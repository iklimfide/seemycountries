import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { TravelMapFocusShell } from "@/components/map/TravelMapFocusShell";
import { TravelMapView } from "@/components/map/TravelMapView";
import { BRAND } from "@/lib/constants";
import {
  buildProfileDescription,
  buildProfileTitle,
} from "@/lib/seo/profile";
import {
  OG_IMAGE_SIZE,
  profileOgImageAlt,
  profileOgImagePath,
  profileOgImageUrl,
} from "@/lib/seo/og";
import { profilePath, profileUrl as buildProfileUrl, getSiteUrl } from "@/lib/seo/site";
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
import { PublicProfileBio } from "@/components/profile/PublicProfileBio";
import { PublicProfileTravelSummary } from "@/components/profile/PublicProfileTravelSummary";

type PageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const normalized = username.toLowerCase();
  const supabase = await createClient();
  if (!supabase) {
    return { title: `@${normalized}` };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("username", normalized)
    .single();

  if (!profile) {
    return { title: "Traveler not found" };
  }

  const [{ data: countries }, { data: cities }] = await Promise.all([
    supabase.from("visited_countries").select("*").eq("user_id", profile.id),
    supabase.from("visited_cities").select("*").eq("user_id", profile.id),
  ]);

  const stats = computeTravelStats(
    (countries ?? []) as VisitedCountry[],
    (cities ?? []) as VisitedCity[]
  );

  const displayName = profile.display_name ?? profile.username;
  const title = buildProfileTitle(displayName, profile.username);
  const description = buildProfileDescription(displayName, stats);
  const url = buildProfileUrl(profile.username);
  const ogImagePath = profileOgImagePath(profile.username);
  const ogImageUrl = profileOgImageUrl(profile.username);

  return {
    metadataBase: new URL(getSiteUrl()),
    title,
    description,
    alternates: {
      canonical: profilePath(profile.username),
    },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: BRAND.name,
      images: [
        {
          url: ogImagePath,
          secureUrl: ogImageUrl,
          width: OG_IMAGE_SIZE.width,
          height: OG_IMAGE_SIZE.height,
          alt: profileOgImageAlt(displayName),
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;
  const t = await getTranslations("profile");
  const supabase = await createClient();
  if (!supabase) {
    notFound();
  }

  const profile = await fetchPublicProfile(supabase, username);

  if (!profile) {
    notFound();
  }

  const [{ data: countries }, { data: cities }, wishlistCountries] = await Promise.all([
    supabase
      .from("visited_countries")
      .select("*")
      .eq("user_id", profile.id)
      .order("country_name", { ascending: true }),
    supabase
      .from("visited_cities")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false }),
    fetchPublicWishlistCountries(supabase, profile.id, profile.wishlist_public),
  ]);

  const visitedCountries = (countries ?? []) as VisitedCountry[];
  const visitedCities = (cities ?? []) as VisitedCity[];
  const stats = computeTravelStats(visitedCountries, visitedCities);
  const visitedCodes = getVisitedCountryCodes(visitedCountries, visitedCities);
  const wishlistPublic = profile.wishlist_public;
  const wishlistCodes = wishlistPublic
    ? getWishlistCountryCodes(wishlistCountries)
    : [];
  const hasMapContent =
    visitedCountries.length > 0 ||
    visitedCities.length > 0 ||
    wishlistCodes.length > 0;
  const displayName = profile.display_name ?? profile.username;
  const publicUrl = buildProfileUrl(profile.username);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentUsername: string | null = null;
  if (user) {
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();
    currentUsername = currentProfile?.username ?? null;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${displayName} on ${BRAND.name}`,
    description: buildProfileDescription(displayName, stats),
    url: publicUrl,
    mainEntity: {
      "@type": "Person",
      name: displayName,
      alternateName: profile.username,
      url: publicUrl,
    },
  };

  const isOwnProfile = currentUsername === profile.username;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header
        isLoggedIn={!!user}
        profileLead={{
          avatarUrl: profile.avatar_url,
          displayName,
          username: profile.username,
          countryCount: stats.countries,
        }}
      />
      <main className="mx-auto max-w-5xl flex-1 px-4 py-2 sm:py-8">
        <TravelMapFocusShell>
        <div className="flex flex-col gap-2 sm:gap-6">
          <PublicProfileTravelSummary
            stats={stats}
            visitedCountries={visitedCountries}
            visitedCities={visitedCities}
            wishlistCountries={wishlistPublic ? wishlistCountries : []}
          />

          {hasMapContent ? (
            <TravelMapView
              visitedCountryCodes={visitedCodes}
              wishlistCountryCodes={wishlistCodes}
              userCities={visitedCities}
              interactive
            />
          ) : (
            <p className="text-center text-slate-500">{t("noCountries")}</p>
          )}

          <PublicProfileBio bio={profile.bio} />

          {isOwnProfile && (
            <a
              href="/dashboard/settings"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              {t("editProfile")}
            </a>
          )}
        </div>
        </TravelMapFocusShell>
      </main>
    </>
  );
}
