import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { TravelStatsInteractive } from "@/components/stats/TravelStatsInteractive";
import { TravelMapFocusShell } from "@/components/map/TravelMapFocusShell";
import { DemoTravelerSummary } from "@/components/home/DemoTravelerSummary";
import { HomeFeatures } from "@/components/home/HomeFeatures";
import { TravelMapView } from "@/components/map/TravelMapView";
import { ShareProfile } from "@/components/share/ShareProfile";
import { createClient } from "@/lib/supabase/server";
import { BRAND } from "@/lib/constants";
import { DEMO_CITIES } from "@/lib/data/demo-cities";
import { DEMO_VISITED_COUNTRIES } from "@/lib/data/demo-countries";
import { DEMO_WISHLIST_COUNTRIES } from "@/lib/data/demo-wishlist";
import { DEMO_PERSONA, getDemoTravelStats } from "@/lib/data/demo-persona";
import { formatMessage, homeMessages } from "@/lib/i18n/client-messages";
import { getSiteUrl } from "@/lib/seo/site";
import {
  computeTravelStats,
  getVisitedCountryCodes,
  getWishlistCountryCodes,
} from "@/lib/utils/stats";
import type { VisitedCity, VisitedCountry, WishlistCountry } from "@/types/database";

export async function generateMetadata(): Promise<Metadata> {
  const ogTitle = `${BRAND.name} — What's your travel status?`;
  const ogDescription =
    "Don't just list your trips, claim your title. Pin your visited cities, map your ultimate bucket list, and unlock exclusive traveler badges.";

  return {
    title: ogTitle,
    description: ogDescription,
    alternates: { canonical: "/" },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: getSiteUrl(),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
    },
  };
}

export default async function HomePage() {
  const t = await getTranslations("home");
  const supabase = await createClient();

  let user = null;
  let username: string | null = null;
  let displayName: string | null = null;
  let countries: VisitedCountry[] = [];
  let cities: VisitedCity[] = DEMO_CITIES;
  let dbCountries: VisitedCountry[] = [];
  let dbCities: VisitedCity[] = [];
  let isDemo = true;

  let wishlistCountries: WishlistCountry[] = [];

  if (supabase) {
    const { data } = await supabase.auth.getUser();
    user = data.user;

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, display_name")
        .eq("id", user.id)
        .single();

      username = profile?.username ?? null;
      displayName = profile?.display_name ?? profile?.username ?? null;

      const [{ data: userCountries }, { data: userCities }, { data: userWishlist }] =
        await Promise.all([
        supabase
          .from("visited_countries")
          .select("*")
          .eq("user_id", user.id)
          .order("country_name", { ascending: true }),
        supabase
          .from("visited_cities")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("wishlist_countries")
          .select("*")
          .eq("user_id", user.id)
          .order("country_name", { ascending: true }),
      ]);

      wishlistCountries = (userWishlist ?? []) as WishlistCountry[];
      dbCountries = (userCountries ?? []) as VisitedCountry[];
      dbCities = (userCities ?? []) as VisitedCity[];

      if (dbCountries.length > 0 || dbCities.length > 0) {
        countries = dbCountries;
        cities = dbCities;
        isDemo = false;
      }
    }
  }

  const stats = isDemo
    ? getDemoTravelStats()
    : computeTravelStats(countries, cities);
  const userStats = computeTravelStats(dbCountries, dbCities);
  const wishlistCount = isDemo
    ? DEMO_PERSONA.wishlistCountries
    : wishlistCountries.length;
  const countryCodes = getVisitedCountryCodes(
    isDemo ? DEMO_VISITED_COUNTRIES : countries,
    isDemo ? [] : cities
  );
  const wishlistCodes = isDemo
    ? getWishlistCountryCodes(DEMO_WISHLIST_COUNTRIES)
    : getWishlistCountryCodes(wishlistCountries);

  return (
    <>
      <Header username={username} isLoggedIn={!!user} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-3 sm:py-8">
        <TravelMapFocusShell>
        <div className="flex flex-col gap-4 sm:gap-6">
        <div className="order-2 flex flex-col items-center gap-4 text-center sm:order-1 sm:mb-0 sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div>
            <p className="text-sm font-medium text-blue-400">
              {isDemo
                ? formatMessage(homeMessages.demoLabel, { name: DEMO_PERSONA.name })
                : displayName}
            </p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-3xl">
              {t("hero")}
            </h1>
            <p className="mt-2 hidden max-w-xl text-sm text-slate-400 sm:block sm:text-base">
              {isDemo ? t("subtitle") : t("yourMap")}
            </p>
          </div>
          {isDemo ? (
            <DemoTravelerSummary
              name={DEMO_PERSONA.name}
              stats={stats}
              wishlistCountries={wishlistCount}
            />
          ) : (
            <TravelStatsInteractive
              stats={stats}
              visitedCountries={dbCountries}
              visitedCities={dbCities}
            />
          )}
        </div>

        <div className="order-1 sm:order-2">
        <TravelMapView
          visitedCountryCodes={countryCodes}
          wishlistCountryCodes={wishlistCodes}
          visitedCountries={user ? dbCountries : []}
          wishlistCountries={user ? wishlistCountries : []}
          userCities={user ? dbCities : []}
          citiesCountryCodes={
            user ? [...new Set(dbCities.map((c) => c.country_code.toUpperCase()))] : []
          }
          isLoggedIn={!!user}
          explorable
          showContinentFilter
        />
        </div>

        {user && username ? (
          <div className="order-3">
            <ShareProfile
              username={username}
              displayName={displayName ?? username}
              stats={userStats}
              isOwnProfile
            />
          </div>
        ) : (
          <>
            <HomeFeatures />
            <div className="order-4 mt-2 flex flex-col items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-6 py-5 text-center sm:mt-4 sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="font-medium text-white">{t("ctaTitle")}</p>
              <p className="mt-1 text-sm text-slate-500">{t("ctaHint")}</p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Link
                href="/register"
                className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
              >
                {t("cta")}
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-slate-700 px-6 py-2.5 text-sm font-medium text-slate-300 hover:border-slate-500 hover:text-white"
              >
                {t("login")}
              </Link>
            </div>
            </div>
          </>
        )}
        </div>
        </TravelMapFocusShell>
      </main>
    </>
  );
}
