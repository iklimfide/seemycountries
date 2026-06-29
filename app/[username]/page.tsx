import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { TravelMapFocusShell } from "@/components/map/TravelMapFocusShell";
import { TravelMapView } from "@/components/map/TravelMapView";
import { TravelStatsInteractive } from "@/components/stats/TravelStatsInteractive";
import { HomeFeatures } from "@/components/home/HomeFeatures";
import { DemoTravelerStory } from "@/components/home/DemoTravelerSummary";
import { ShareProfile } from "@/components/share/ShareProfile";
import { BRAND } from "@/lib/constants";
import { formatMessage, homeMessages } from "@/lib/i18n/client-messages";
import {
  buildProfileDescription,
  buildProfileOgDescription,
  buildProfileOgTitle,
  buildProfileTitle,
} from "@/lib/seo/profile";
import {
  OG_IMAGE_SIZE,
  profileOgImageAlt,
  profileOgImagePath,
  profileOgImageUrl,
  profileOgImageVersion,
} from "@/lib/seo/og";
import { profilePath, profileUrl as buildProfileUrl, getSiteUrl } from "@/lib/seo/site";
import { loadPublicProfilePage } from "@/lib/supabase/profile-page-data";

type PageProps = {
  params: Promise<{ username: string }>;
};

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const data = await loadPublicProfilePage(username);

  if (!data) {
    return { title: "Traveler not found" };
  }

  const { profile, stats } = data;
  const visitedCount = data.visitedCodes.length;
  const wishlistCount = data.wishlistCodes.length;
  const displayName = profile.display_name ?? profile.username;
  const title = buildProfileTitle(displayName, profile.username);
  const description = buildProfileDescription(displayName, stats);
  const ogTitle = buildProfileOgTitle(displayName);
  const ogDescription = buildProfileOgDescription(visitedCount);
  const url = buildProfileUrl(profile.username);
  const ogVersion = profileOgImageVersion(stats, visitedCount, wishlistCount);
  const ogImagePath = profileOgImagePath(profile.username, ogVersion);
  const ogImageUrl = profileOgImageUrl(profile.username, ogVersion);

  return {
    metadataBase: new URL(getSiteUrl()),
    title,
    description,
    alternates: {
      canonical: profilePath(profile.username),
    },
    openGraph: {
      type: "website",
      title: ogTitle,
      description: ogDescription,
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
      title: ogTitle,
      description: ogDescription,
      images: [ogImageUrl],
    },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;
  const [t, tHome, data] = await Promise.all([
    getTranslations("profile"),
    getTranslations("home"),
    loadPublicProfilePage(username),
  ]);

  if (!data) {
    notFound();
  }

  const {
    profile,
    visitedCountries,
    visitedCities,
    visitedParks,
    wishlistCountries,
    stats,
    visitedCodes,
    wishlistCodes,
    currentUsername,
    isLoggedIn,
  } = data;

  const wishlistPublic = profile.wishlist_public;
  const hasMapContent =
    visitedCountries.length > 0 ||
    visitedCities.length > 0 ||
    visitedParks.length > 0 ||
    wishlistCodes.length > 0;
  const displayName = profile.display_name ?? profile.username;
  const publicUrl = buildProfileUrl(profile.username);
  const profileDescription = buildProfileDescription(displayName, stats);
  const isOwnProfile = currentUsername === profile.username;
  const isGuest = !isLoggedIn;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${displayName} on ${BRAND.name}`,
    description: profileDescription,
    url: publicUrl,
    mainEntity: {
      "@type": "Person",
      name: displayName,
      alternateName: profile.username,
      url: publicUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header
        isLoggedIn={isLoggedIn}
        profileLead={{
          avatarUrl: profile.avatar_url,
          displayName,
          username: profile.username,
          countryCount: stats.countries,
        }}
      />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-3 sm:py-8">
        <TravelMapFocusShell>
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:text-left">
              <div className="flex items-start justify-between gap-3 text-left">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-blue-400">
                    {formatMessage(homeMessages.demoLabel, { name: displayName })}
                  </p>
                  <h1 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-3xl">
                    {tHome("hero")}
                  </h1>
                  {profile.bio ? (
                    <p className="mt-2 hidden max-w-xl text-sm text-slate-400 sm:block sm:text-base">
                      {profile.bio}
                    </p>
                  ) : (
                    <p className="mt-2 hidden max-w-xl text-sm text-slate-400 sm:block sm:text-base">
                      {profileDescription}
                    </p>
                  )}
                </div>
              </div>
              <TravelStatsInteractive
                stats={stats}
                visitedCountries={visitedCountries}
                visitedCities={visitedCities}
                visitedParks={visitedParks}
                wishlistCountries={wishlistPublic ? wishlistCountries : []}
                className="w-full sm:w-auto"
              />
            </div>

            {isGuest ? (
              <div className="sm:hidden">
                <DemoTravelerStory name={displayName} stats={stats} />
              </div>
            ) : null}

            <div>
              {hasMapContent ? (
                <TravelMapView
                  visitedCountryCodes={visitedCodes}
                  wishlistCountryCodes={wishlistCodes}
                  visitedCountries={visitedCountries}
                  wishlistCountries={wishlistPublic ? wishlistCountries : []}
                  userCities={visitedCities}
                  userParks={visitedParks}
                  citiesCountryCodes={[
                    ...new Set(visitedCities.map((c) => c.country_code.toUpperCase())),
                  ]}
                  parksCountryCodes={[
                    ...new Set(visitedParks.map((p) => p.country_code.toUpperCase())),
                  ]}
                  isLoggedIn={isLoggedIn}
                  canEditMap={isOwnProfile}
                  explorable
                  interactive
                  showContinentFilter
                />
              ) : (
                <p className="text-center text-slate-500">{t("noCountries")}</p>
              )}
            </div>

            {hasMapContent && (
              <div>
                {isOwnProfile ? (
                  <ShareProfile
                    username={profile.username}
                    displayName={displayName}
                    stats={stats}
                    isOwnProfile
                  />
                ) : (
                  <HomeFeatures />
                )}
              </div>
            )}

            <div className="mt-2 flex flex-col items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-6 py-5 text-center sm:mt-8 sm:flex-row sm:justify-between sm:text-left">
              <div>
                <p className="font-medium text-white">{tHome("ctaTitle")}</p>
                <p className="mt-1 text-sm text-slate-500">{tHome("ctaHint")}</p>
              </div>
              {isOwnProfile ? (
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                  <Link
                    href="/dashboard"
                    className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
                  >
                    {tHome("editMap")}
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="rounded-full border border-slate-700 px-6 py-2.5 text-sm font-medium text-slate-300 hover:border-slate-500 hover:text-white"
                  >
                    {t("editProfile")}
                  </Link>
                </div>
              ) : isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="shrink-0 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
                >
                  {tHome("editMap")}
                </Link>
              ) : (
                <div className="flex shrink-0 gap-3">
                  <Link
                    href="/register"
                    className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
                  >
                    {tHome("cta")}
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-full border border-slate-700 px-6 py-2.5 text-sm font-medium text-slate-300 hover:border-slate-500 hover:text-white"
                  >
                    {tHome("login")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </TravelMapFocusShell>
      </main>
    </>
  );
}
