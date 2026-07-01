import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { ProfileCardOgLayout } from "@/lib/seo/profile-card-og-layout";
import { buildProfileDescription } from "@/lib/seo/profile";
import { OG_IMAGE_SIZE } from "@/lib/seo/og";
import { getShareCardFonts, SHARE_CARD_FONT_FAMILIES } from "@/lib/seo/share-card-fonts";
import { getSiteUrl } from "@/lib/seo/site";
import { createClient } from "@/lib/supabase/server";
import {
  fetchPublicProfile,
} from "@/lib/supabase/public-profile";
import { resolveProfileDisplayName } from "@/lib/utils/display-name";
import { resolveProfileCoverUrl } from "@/lib/utils/profile-page";
import {
  computeTravelStats,
} from "@/lib/utils/stats";
import type { VisitedCity, VisitedCountry, VisitedPark } from "@/types/database";

export const runtime = "edge";

function absoluteAssetUrl(url: string | null, siteUrl: string): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${siteUrl}${url.startsWith("/") ? url : `/${url}`}`;
}

export async function buildProfileOgImage(username: string): Promise<ImageResponse> {
  const supabase = await createClient();
  if (!supabase) notFound();

  const profile = await fetchPublicProfile(supabase, username);
  if (!profile) notFound();

  const [{ data: countries }, { data: cities }, { data: parks }] = await Promise.all([
    supabase.from("visited_countries").select("*").eq("user_id", profile.id),
    supabase.from("visited_cities").select("*").eq("user_id", profile.id),
    supabase.from("visited_parks").select("*").eq("user_id", profile.id),
  ]);

  const visitedCountries = (countries ?? []) as VisitedCountry[];
  const visitedCities = (cities ?? []) as VisitedCity[];
  const visitedParks = (parks ?? []) as VisitedPark[];
  const stats = computeTravelStats(visitedCountries, visitedCities, visitedParks);

  const displayName = resolveProfileDisplayName(profile.display_name, profile.username);
  const siteUrl = getSiteUrl();
  const coverUrl = absoluteAssetUrl(
    resolveProfileCoverUrl(visitedCities, visitedParks),
    siteUrl
  );
  const avatarUrl = absoluteAssetUrl(profile.avatar_url, siteUrl);
  const description =
    profile.bio?.trim() || buildProfileDescription(displayName, stats);
  const heroTitle = `${displayName}'s Travel Map`;
  const heroSubtitle =
    "Collect the places you've been and share how your map grows over time.";
  const fonts = await getShareCardFonts().catch(() => null);

  return new ImageResponse(
    (
      <ProfileCardOgLayout
        displayName={displayName}
        username={profile.username}
        avatarUrl={avatarUrl}
        coverUrl={coverUrl}
        residence={profile.residence}
        heroTitle={heroTitle}
        heroSubtitle={heroSubtitle}
        description={description}
        stats={stats}
      />
    ),
    {
      ...OG_IMAGE_SIZE,
      ...(fonts
        ? {
            fonts: [
              {
                name: SHARE_CARD_FONT_FAMILIES.sans,
                data: fonts.bold,
                weight: 700,
                style: "normal" as const,
              },
              {
                name: SHARE_CARD_FONT_FAMILIES.sans,
                data: fonts.semi,
                weight: 600,
                style: "normal" as const,
              },
            ],
          }
        : {}),
    }
  );
}
