import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { TravelStatsInteractive } from "@/components/stats/TravelStatsInteractive";
import { TravelMapFocusShell } from "@/components/map/TravelMapFocusShell";
import { TravelMapView } from "@/components/map/TravelMapView";
import { CityList } from "@/components/dashboard/CityList";
import { CountryManager } from "@/components/dashboard/CountryManager";
import { createClient } from "@/lib/supabase/server";
import { BRAND } from "@/lib/constants";
import {
  computeTravelStats,
  getVisitedCountryCodes,
  getWishlistCountryCodes,
} from "@/lib/utils/stats";
import type { VisitedCity, VisitedCountry, WishlistCountry } from "@/types/database";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const tProfile = await getTranslations("profile");
  const supabase = await createClient();
  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("id", user.id)
    .single();

  const [{ data: countries, error: countriesError }, { data: cities, error: citiesError }, { data: wishlist, error: wishlistError }] =
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

  const visitedCountries = (countriesError ? [] : (countries ?? [])) as VisitedCountry[];
  const visitedCities = (citiesError ? [] : (cities ?? [])) as VisitedCity[];
  const wishlistCountries = (wishlistError ? [] : (wishlist ?? [])) as WishlistCountry[];
  const stats = computeTravelStats(visitedCountries, visitedCities);
  const visitedCodes = getVisitedCountryCodes(visitedCountries, visitedCities);
  const wishlistCodes = getWishlistCountryCodes(wishlistCountries);

  return (
    <>
      <Header username={profile?.username} isLoggedIn />
      <main className="mx-auto max-w-5xl flex-1 px-4 py-3 sm:py-8">
        <TravelMapFocusShell>
        <div className="flex flex-col gap-4 sm:gap-6">
        <div className="order-2 mb-0 flex flex-col items-center gap-4 text-center sm:order-1 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {profile?.display_name ?? profile?.username}
            </h1>
            {profile?.username && (
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
                <Link
                  href={`/u/${profile.username}`}
                  className="text-blue-400 hover:text-blue-300"
                >
                  {BRAND.domain}/u/{profile.username}
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="text-slate-400 hover:text-slate-300"
                >
                  {tProfile("editProfile")}
                </Link>
              </div>
            )}
          </div>
          <TravelStatsInteractive
            stats={stats}
            visitedCountries={visitedCountries}
            visitedCities={visitedCities}
          />
        </div>

        <div className="order-1 sm:order-2">
        <div className="mb-8">
          <TravelMapView
            visitedCountryCodes={visitedCodes}
            wishlistCountryCodes={wishlistCodes}
            visitedCountries={visitedCountries}
            wishlistCountries={wishlistCountries}
            userCities={visitedCities}
            citiesCountryCodes={[
              ...new Set(visitedCities.map((c) => c.country_code.toUpperCase())),
            ]}
            isLoggedIn
            explorable
            showContinentFilter
          />
        </div>
        </div>

        <div className="order-3 flex flex-col gap-10">
          <CountryManager
            visitedCountries={visitedCountries}
            wishlistCountries={wishlistCountries}
            visitedCountryCodes={visitedCodes}
            visitedCities={visitedCities}
          />
          <CityList cities={visitedCities} countries={visitedCountries} />
        </div>
        </div>
        </TravelMapFocusShell>
      </main>
    </>
  );
}
