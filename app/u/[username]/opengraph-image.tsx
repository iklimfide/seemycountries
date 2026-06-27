import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { BRAND } from "@/lib/constants";
import { ogMapDataUrl } from "@/lib/seo/og-map-svg";
import { createClient } from "@/lib/supabase/server";
import {
  computeTravelStats,
  getVisitedCountryCodes,
  getWishlistCountryCodes,
} from "@/lib/utils/stats";
import type { VisitedCity, VisitedCountry, WishlistCountry } from "@/types/database";

export const runtime = "nodejs";
export const alt = "Travel map on SeeMyCountries";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ username: string }>;
};

export default async function OgImage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();
  if (!supabase) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, wishlist_public")
    .eq("username", username.toLowerCase())
    .single();

  if (!profile) notFound();

  const [{ data: countries }, { data: cities }, { data: wishlist }] = await Promise.all([
    supabase.from("visited_countries").select("*").eq("user_id", profile.id),
    supabase.from("visited_cities").select("*").eq("user_id", profile.id),
    profile.wishlist_public
      ? supabase.from("wishlist_countries").select("*").eq("user_id", profile.id)
      : Promise.resolve({ data: [] }),
  ]);

  const visitedCountries = (countries ?? []) as VisitedCountry[];
  const visitedCities = (cities ?? []) as VisitedCity[];
  const wishlistCountries = (wishlist ?? []) as WishlistCountry[];
  const stats = computeTravelStats(visitedCountries, visitedCities);
  const visitedCodes = getVisitedCountryCodes(visitedCountries, visitedCities);
  const wishlistCodes = profile.wishlist_public
    ? getWishlistCountryCodes(wishlistCountries)
    : [];
  const mapSrc = ogMapDataUrl(visitedCodes, visitedCities, wishlistCodes);

  const name = profile.display_name ?? profile.username;
  const statsLine =
    stats.countries > 0 || stats.cities > 0
      ? `${stats.countries} Countries · ${stats.cities} Cities`
      : "Start your travel map";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: BRAND.colors.background,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <img
          src={mapSrc}
          alt=""
          width={1200}
          height={420}
          style={{
            width: "100%",
            height: "420px",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "32px 48px",
            background: `linear-gradient(180deg, ${BRAND.colors.surface} 0%, ${BRAND.colors.background} 100%)`,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                fontSize: "48px",
                fontWeight: 700,
                color: "#f8fafc",
                lineHeight: 1.1,
              }}
            >
              {name}
            </div>
            <div style={{ fontSize: "28px", color: "#60a5fa" }}>{statsLine}</div>
            <div style={{ fontSize: "22px", color: "#94a3b8" }}>@{profile.username}</div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "#60a5fa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    background: BRAND.colors.background,
                  }}
                />
              </div>
              <span style={{ fontSize: "26px", color: "#e2e8f0", fontWeight: 600 }}>
                {BRAND.name}
              </span>
            </div>
            <span style={{ fontSize: "18px", color: "#64748b" }}>{BRAND.domain}</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
