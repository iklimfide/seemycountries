import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { TravelStatsInteractive } from "@/components/stats/TravelStatsInteractive";
import { TravelMapFocusShell } from "@/components/map/TravelMapFocusShell";
import { HomeBestDestinations } from "@/components/home/HomeBestDestinations";
import { HomeExplainer } from "@/components/home/HomeExplainer";
import { HomeFeatures } from "@/components/home/HomeFeatures";
import { HomeFinalCta } from "@/components/home/HomeFinalCta";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeSampleCardHeader } from "@/components/home/HomeSampleCardHeader";
import { TravelMapView } from "@/components/map/TravelMapView";
import { ShareProfile } from "@/components/share/ShareProfile";
import { createClient } from "@/lib/supabase/server";
import { BRAND } from "@/lib/constants";
import { DEMO_CITIES } from "@/lib/data/demo-cities";
import { DEMO_VISITED_COUNTRIES } from "@/lib/data/demo-countries";
import { DEMO_WISHLIST_COUNTRIES } from "@/lib/data/demo-wishlist";
import { DEMO_PERSONA, getDemoTravelStats } from "@/lib/data/demo-persona";
import { getSiteUrl } from "@/lib/seo/site";
import { resolveProfileDisplayName } from "@/lib/utils/display-name";
import {
  computeTravelStats,
  getVisitedCountryCodes,
  getWishlistCountryCodes,
} from "@/lib/utils/stats";
import type { VisitedCity, VisitedCountry, VisitedPark, WishlistCountry } from "@/types/database";

export async function generateMetadata(): Promise<Metadata> {
  const ogTitle = `${BRAND.name} — Your Travel Map`;
  const ogDescription =
    "Mark the countries you've visited, pin your favorite cities, save memories, and build a wishlist for future trips — all in one beautiful travel profile.";

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
  let dbParks: VisitedPark[] = [];
  let isDemo = true;

  let wishlistCountries: WishlistCountry[] = [];

  if (supabase) {
    const { data } = await supabase.auth.getUser();
    user = data.user;

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, display_name, avatar_url")
        .eq("id", user.id)
        .single();

      username = profile?.username ?? null;
      displayName = profile?.username
        ? resolveProfileDisplayName(profile.display_name, profile.username)
        : null;

      const [{ data: userCountries }, { data: userCities }, { data: userParks }, { data: userWishlist }] =
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
            .from("visited_parks")
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
      dbParks = (userParks ?? []) as VisitedPark[];

      if (dbCountries.length > 0 || dbCities.length > 0 || dbParks.length > 0) {
        countries = dbCountries;
        cities = dbCities;
        isDemo = false;
      }
    }
  }

  const stats = isDemo
    ? getDemoTravelStats()
    : computeTravelStats(countries, cities, dbParks);
  const userStats = computeTravelStats(dbCountries, dbCities, dbParks);
  const countryCodes = getVisitedCountryCodes(
    isDemo ? DEMO_VISITED_COUNTRIES : countries,
    isDemo ? [] : cities,
    isDemo ? [] : dbParks
  );
  const wishlistCodes = isDemo
    ? getWishlistCountryCodes(DEMO_WISHLIST_COUNTRIES)
    : getWishlistCountryCodes(wishlistCountries);

  const showLanding = isDemo && !user;
  const mapProfileName = isDemo ? DEMO_PERSONA.name : displayName ?? username ?? "";
  const mapProfileUsername = isDemo ? DEMO_PERSONA.username : username ?? "";
  const mapProfileAvatar = isDemo ? DEMO_PERSONA.avatarUrl : null;

  return (
    <>
      <Header isLoggedIn={!!user} variant={showLanding ? "landing" : "default"} />
      <main
        className={
          showLanding
            ? "mx-auto w-full max-w-[1200px] flex-1 px-6 py-[46px] pb-[72px] max-sm:px-3.5 max-sm:py-8 max-sm:pb-[54px] lg:max-w-[1400px] lg:px-10 xl:max-w-[1520px] xl:px-12"
            : "mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-3 sm:py-8 lg:max-w-[1400px] lg:px-10 xl:max-w-[1520px] xl:px-12"
        }
      >
        <TravelMapFocusShell>
          {showLanding ? (
            <div className="flex flex-col gap-7 sm:gap-9">
              <section className="grid items-center gap-[34px] lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 xl:gap-12">
                <HomeHero />
                <TravelMapView
                  visitedCountryCodes={countryCodes}
                  wishlistCountryCodes={wishlistCodes}
                  visitedCountries={DEMO_VISITED_COUNTRIES}
                  wishlistCountries={DEMO_WISHLIST_COUNTRIES}
                  userCities={DEMO_CITIES}
                  isLoggedIn={false}
                  explorable
                  showContinentFilter
                  homeLayout
                  profileHeader={
                    <HomeSampleCardHeader
                      name={mapProfileName}
                      username={mapProfileUsername}
                      avatarUrl={mapProfileAvatar}
                      stats={stats}
                      isDemo
                    />
                  }
                />
              </section>

              <HomeExplainer
                name={DEMO_PERSONA.name}
                countries={stats.countries}
                cities={stats.cities}
              />
              <HomeFeatures />
              <HomeFinalCta />
              <HomeBestDestinations />
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:text-left lg:items-center">
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-sm font-medium text-blue-600">
                    {isDemo
                      ? `${DEMO_PERSONA.name}'s journey`
                      : displayName}
                  </p>
                  <h1 className="mt-1 text-xl font-bold tracking-tight text-[#071126] sm:text-3xl">
                    {t("hero")}
                  </h1>
                  <p className="mt-2 hidden max-w-xl text-sm text-[#64748b] sm:block sm:text-base">
                    {isDemo ? t("subtitle") : t("yourMap")}
                  </p>
                </div>
                <TravelStatsInteractive
                  stats={stats}
                  visitedCountries={dbCountries}
                  visitedCities={dbCities}
                  visitedParks={dbParks}
                  wishlistCountries={user ? wishlistCountries : []}
                  displayName={!isDemo ? (displayName ?? undefined) : undefined}
                  username={!isDemo ? (username ?? undefined) : undefined}
                  className="w-full sm:w-auto lg:shrink-0"
                />
              </div>

              <TravelMapView
                visitedCountryCodes={countryCodes}
                wishlistCountryCodes={wishlistCodes}
                visitedCountries={user ? dbCountries : []}
                wishlistCountries={user ? wishlistCountries : []}
                userCities={user ? dbCities : []}
                userParks={user ? dbParks : []}
                citiesCountryCodes={
                  user ? [...new Set(dbCities.map((c) => c.country_code.toUpperCase()))] : []
                }
                parksCountryCodes={
                  user ? [...new Set(dbParks.map((p) => p.country_code.toUpperCase()))] : []
                }
                isLoggedIn={!!user}
                explorable
                showContinentFilter
              />

              {user && username ? (
                <ShareProfile
                  username={username}
                  displayName={displayName ?? username}
                  stats={userStats}
                  isOwnProfile
                />
              ) : (
                <div className="mt-2 flex flex-col items-center gap-3 rounded-3xl border border-[#d8e1ef] bg-white px-6 py-5 text-center shadow-sm sm:mt-4 sm:flex-row sm:justify-between sm:text-left">
                  <div>
                    <p className="font-medium text-[#0f172a]">{t("ctaTitle")}</p>
                    <p className="mt-1 text-sm text-[#64748b]">{t("ctaHint")}</p>
                  </div>
                  <div className="flex shrink-0 gap-3">
                    <Link
                      href="/register"
                      className="rounded-full bg-[#2563eb] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
                    >
                      {t("cta")}
                    </Link>
                    <Link
                      href="/login"
                      className="rounded-full border border-[#d8e1ef] px-6 py-2.5 text-sm font-medium text-[#64748b] hover:border-[#93c5fd] hover:text-[#0f172a]"
                    >
                      {t("login")}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </TravelMapFocusShell>
      </main>
    </>
  );
}
