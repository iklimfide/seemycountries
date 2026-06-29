import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { TravelMapFocusShell } from "@/components/map/TravelMapFocusShell";
import { TravelMapView } from "@/components/map/TravelMapView";
import { TravelStatsInteractive } from "@/components/stats/TravelStatsInteractive";
import { HomeFeatures } from "@/components/home/HomeFeatures";
import { DemoTravelerStory } from "@/components/home/DemoTravelerSummary";
import { BRAND } from "@/lib/constants";
import { loadJenniferDemoPage } from "@/lib/data/jennifer-demo-page";
import { DEMO_PERSONA } from "@/lib/data/demo-persona";
import { formatMessage, homeMessages } from "@/lib/i18n/client-messages";
import {
  buildProfileDescription,
  buildProfileOgDescription,
  buildProfileOgTitle,
  buildProfileTitle,
} from "@/lib/seo/profile";
import { getSiteUrl, profilePath } from "@/lib/seo/site";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { profile, stats, visitedCodes } = loadJenniferDemoPage();
  const displayName = profile.display_name ?? profile.username;
  const title = buildProfileTitle(displayName, profile.username);
  const description = buildProfileDescription(displayName, stats);
  const ogTitle = buildProfileOgTitle(displayName);
  const ogDescription = buildProfileOgDescription(visitedCodes.length);
  const url = `${getSiteUrl()}${profilePath(profile.username)}`;

  return {
    metadataBase: new URL(getSiteUrl()),
    title,
    description,
    alternates: {
      canonical: profilePath(profile.username),
    },
    openGraph: {
      type: "profile",
      title: ogTitle,
      description: ogDescription,
      url,
      siteName: BRAND.name,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
    },
  };
}

export default async function JenniferDemoPage() {
  const [tHome, data] = await Promise.all([
    getTranslations("home"),
    Promise.resolve(loadJenniferDemoPage()),
  ]);

  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  const {
    profile,
    visitedCountries,
    visitedCities,
    visitedParks,
    wishlistCountries,
    stats,
    visitedCodes,
    wishlistCodes,
  } = data;

  const displayName = profile.display_name ?? profile.username;
  const profileDescription = buildProfileDescription(displayName, stats);
  const publicUrl = `${getSiteUrl()}${profilePath(profile.username)}`;

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
      <Header isLoggedIn={!!user} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-3 sm:py-8 lg:max-w-[1400px] lg:px-10 xl:max-w-[1520px] xl:px-12">
        <TravelMapFocusShell>
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:text-left lg:items-center">
              <div className="flex min-w-0 flex-1 items-start gap-3 text-left">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-slate-700 bg-slate-800">
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt=""
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-blue-400">
                    {formatMessage(homeMessages.demoLabel, { name: displayName })}
                  </p>
                  <h1 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-3xl">
                    {displayName}
                  </h1>
                  <p className="mt-2 max-w-xl text-sm text-slate-400 sm:text-base">
                    {profile.bio ?? profileDescription}
                  </p>
                </div>
              </div>
              <TravelStatsInteractive
                stats={stats}
                visitedCountries={visitedCountries}
                visitedCities={visitedCities}
                visitedParks={visitedParks}
                wishlistCountries={wishlistCountries}
                className="w-full sm:w-auto lg:shrink-0"
              />
            </div>

            {!user ? (
              <div className="sm:hidden">
                <DemoTravelerStory name={displayName} stats={stats} />
              </div>
            ) : null}

            <TravelMapView
              visitedCountryCodes={visitedCodes}
              wishlistCountryCodes={wishlistCodes}
              visitedCountries={visitedCountries}
              wishlistCountries={wishlistCountries}
              userCities={visitedCities}
              userParks={visitedParks}
              citiesCountryCodes={[
                ...new Set(visitedCities.map((c) => c.country_code.toUpperCase())),
              ]}
              parksCountryCodes={[]}
              isLoggedIn={!!user}
              explorable
              interactive
              showContinentFilter
            />

            <HomeFeatures />

            <div className="mt-2 flex flex-col items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-6 py-5 text-center sm:mt-4 sm:flex-row sm:justify-between sm:text-left">
              <div>
                <p className="font-medium text-white">{tHome("ctaTitle")}</p>
                <p className="mt-1 text-sm text-slate-500">{tHome("ctaHint")}</p>
              </div>
              {user ? (
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

            <p className="text-center text-xs text-slate-600">
              {tHome("sampleProfileLabel")} · @{DEMO_PERSONA.username}
            </p>
          </div>
        </TravelMapFocusShell>
      </main>
    </>
  );
}
