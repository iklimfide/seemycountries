import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { BRAND } from "@/lib/constants";
import { OG_IMAGE_SIZE } from "@/lib/seo/og";
import { ogMapDataUrl } from "@/lib/seo/og-map-svg";
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

function profileInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

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
  const visitedCodes = getVisitedCountryCodes(visitedCountries, visitedCities);
  const wishlistCodes = profile.wishlist_public
    ? getWishlistCountryCodes(wishlistCountries)
    : [];

  const name = profile.display_name ?? profile.username;
  const statsLine =
    stats.countries > 0 || stats.cities > 0
      ? `${stats.countries} Countries · ${stats.cities} Cities`
      : "Start your travel map";

  const mapSrc = ogMapDataUrl(visitedCodes, visitedCities, wishlistCodes);

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
            position: "relative",
            display: "flex",
            height: "360px",
            width: "100%",
            overflow: "hidden",
            borderBottom: `2px solid ${BRAND.colors.unvisited}`,
          }}
        >
          <img
            src={mapSrc}
            alt=""
            width={1200}
            height={360}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "16px",
              left: "24px",
              display: "flex",
              gap: "20px",
              padding: "8px 14px",
              borderRadius: "999px",
              background: "rgba(15, 23, 42, 0.82)",
              border: `1px solid ${BRAND.colors.unvisited}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "3px",
                  background: BRAND.colors.visited,
                }}
              />
              <span style={{ fontSize: "16px", color: "#e2e8f0" }}>Visited</span>
            </div>
            {wishlistCodes.length > 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "3px",
                    background: BRAND.colors.wishlistFill,
                    border: `2px solid ${BRAND.colors.wishlist}`,
                  }}
                />
                <span style={{ fontSize: "16px", color: "#e2e8f0" }}>Want to visit</span>
              </div>
            ) : null}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "28px 40px 32px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                width={88}
                height={88}
                style={{
                  width: "88px",
                  height: "88px",
                  borderRadius: "50%",
                  border: `3px solid ${BRAND.colors.visited}`,
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: "88px",
                  height: "88px",
                  borderRadius: "50%",
                  border: `3px solid ${BRAND.colors.visited}`,
                  background: BRAND.colors.surface,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "36px",
                  fontWeight: 700,
                  color: "#f8fafc",
                }}
              >
                {profileInitial(name)}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: "42px",
                  fontWeight: 700,
                  color: "#f8fafc",
                  lineHeight: 1.1,
                  maxWidth: "620px",
                }}
              >
                {name}
              </div>
              <div style={{ display: "flex", fontSize: "26px", color: "#60a5fa" }}>
                {statsLine}
              </div>
              <div style={{ display: "flex", fontSize: "20px", color: "#94a3b8" }}>
                @{profile.username}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: BRAND.colors.pin,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: BRAND.colors.background,
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "24px",
                  color: "#e2e8f0",
                  fontWeight: 700,
                }}
              >
                {BRAND.name}
              </div>
            </div>
            <div style={{ display: "flex", fontSize: "18px", color: "#64748b" }}>
              {BRAND.domain}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...OG_IMAGE_SIZE }
  );
}
