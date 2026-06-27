import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { BRAND } from "@/lib/constants";
import { OG_IMAGE_SIZE } from "@/lib/seo/og";
import { createClient } from "@/lib/supabase/server";
import {
  fetchPublicProfile,
  fetchPublicWishlistCountries,
} from "@/lib/supabase/public-profile";
import {
  computeTravelStats,
  getVisitedCountryCodes,
  getWishlistCountryCodes,
} from "@/lib/utils/stats";
import type { VisitedCity, VisitedCountry } from "@/types/database";

export const runtime = "edge";

export async function buildProfileOgImage(username: string): Promise<ImageResponse> {
  const supabase = await createClient();
  if (!supabase) notFound();

  const profile = await fetchPublicProfile(supabase, username);
  if (!profile) notFound();

  const [{ data: countries }, { data: cities }, wishlistCountries] = await Promise.all([
    supabase.from("visited_countries").select("*").eq("user_id", profile.id),
    supabase.from("visited_cities").select("*").eq("user_id", profile.id),
    fetchPublicWishlistCountries(supabase, profile.id, profile.wishlist_public),
  ]);

  const visitedCountries = (countries ?? []) as VisitedCountry[];
  const visitedCities = (cities ?? []) as VisitedCity[];
  const stats = computeTravelStats(visitedCountries, visitedCities);
  const visitedCount = getVisitedCountryCodes(visitedCountries, visitedCities).length;
  const wishlistCount = profile.wishlist_public
    ? getWishlistCountryCodes(wishlistCountries).length
    : 0;

  const name = profile.display_name ?? profile.username;
  const statsLine =
    stats.countries > 0 || stats.cities > 0
      ? `${stats.countries} Countries · ${stats.cities} Cities`
      : "Start your travel map";

  const showCounts = visitedCount > 0 || wishlistCount > 0;

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
        <div
          style={{
            height: "280px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(160deg, ${BRAND.colors.surface} 0%, ${BRAND.colors.background} 100%)`,
            borderBottom: `1px solid ${BRAND.colors.unvisited}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              background: BRAND.colors.unvisited,
              border: `3px solid ${BRAND.colors.visited}`,
            }}
          >
            <div
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: BRAND.colors.pin,
              }}
            />
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "36px 48px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "46px",
                fontWeight: 700,
                color: "#f8fafc",
                lineHeight: 1.1,
              }}
            >
              {name}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "28px",
                color: "#60a5fa",
              }}
            >
              {statsLine}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "22px",
                color: "#94a3b8",
              }}
            >
              @{profile.username}
            </div>
            {showCounts ? (
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  marginTop: "8px",
                }}
              >
                {visitedCount > 0 ? (
                  <div style={{ display: "flex", fontSize: "18px", color: "#93c5fd" }}>
                    {visitedCount} visited
                  </div>
                ) : null}
                {wishlistCount > 0 ? (
                  <div style={{ display: "flex", fontSize: "18px", color: "#fbbf24" }}>
                    {wishlistCount} wishlist
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "10px",
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
              <div
                style={{
                  display: "flex",
                  fontSize: "26px",
                  color: "#e2e8f0",
                  fontWeight: 600,
                }}
              >
                {BRAND.name}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "18px",
                color: "#64748b",
              }}
            >
              {BRAND.domain}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...OG_IMAGE_SIZE }
  );
}
