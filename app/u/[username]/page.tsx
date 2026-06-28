import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { TravelMapFocusShell } from "@/components/map/TravelMapFocusShell";
import { TravelMapView } from "@/components/map/TravelMapView";
import { TravelStatsInteractive } from "@/components/stats/TravelStatsInteractive";
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
    .select("id, username, display_name, wishlist_public")
    .eq("username", normalized)
    .single();

  if (!profile) {
    return { title: "Traveler not found" };
  }

  const [{ data: countries }, { data: cities }, { data: wishlist }] = await Promise.all([
    supabase.from("visited_countries").select("*").eq("user_id", profile.id),
    supabase.from("visited_cities").select("*").eq("user_id", profile.id),
    profile.wishlist_public
      ? supabase.from("wishlist_countries").select("country_code").eq("user_id", profile.id)
      : Promise.resolve({ data: [] as { country_code: string }[] }),
  ]);

  const stats = computeTravelStats(
    (countries ?? []) as VisitedCountry[],
    (cities ?? []) as VisitedCity[]
  );
  const visitedCount = getVisitedCountryCodes(
    (countries ?? []) as VisitedCountry[],
    (cities ?? []) as VisitedCity[]
  ).length;
  const wishlistCount = profile.wishlist_public ? (wishlist ?? []).length : 0;

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
  const t = await getTranslations("profile");
  const tHome = await getTranslations("home");
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
  const profileDescription = buildProfileDescription(displayName, stats);

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
    description: profileDescription,
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
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-3 sm:py-8">
        <TravelMapFocusShell>
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="order-2 flex flex-col items-center gap-4 text-center sm:order-1 sm:mb-0 sm:flex-row sm:items-end sm:justify-between sm:text-left">
              <div>
                <p className="text-sm font-medium text-blue-400">
                  {formatMessage(homeMessages.demoLabel, { name: displayName })}
                </p>
                <h1 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-3xl">
                  {tHome("hero")}
                </h1>
                {profile.bio ? (
                  <>
                    <p className="mt-2 text-sm text-slate-400 sm:hidden">{profile.bio}</p>
                    <p className="mt-2 hidden max-w-xl text-sm text-slate-400 sm:block sm:text-base">
                      {profile.bio}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 hidden max-w-xl text-sm text-slate-400 sm:block sm:text-base">
                    {profileDescription}
                  </p>
                )}
              </div>
              <TravelStatsInteractive
                stats={stats}
                visitedCountries={visitedCountries}
                visitedCities={visitedCities}
                wishlistCountries={wishlistPublic ? wishlistCountries : []}
              />
            </div>

            <div className="order-1 sm:order-2">
              {hasMapContent ? (
                <TravelMapView
                  visitedCountryCodes={visitedCodes}
                  wishlistCountryCodes={wishlistCodes}
                  userCities={visitedCities}
                  interactive
                  showContinentFilter
                />
              ) : (
                <p className="text-center text-slate-500">{t("noCountries")}</p>
              )}
            </div>

            {hasMapContent && (
              <div className="order-3">
                <ShareProfile
                  username={profile.username}
                  displayName={displayName}
                  stats={stats}
                  isOwnProfile={isOwnProfile}
                />
              </div>
            )}

            <div className="order-4 mt-2 flex flex-col items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-6 py-5 text-center sm:mt-8 sm:flex-row sm:justify-between sm:text-left">
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
              ) : user ? (
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
