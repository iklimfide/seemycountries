import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { TravelStatsInteractive } from "@/components/stats/TravelStatsInteractive";
import { TravelMapFocusShell } from "@/components/map/TravelMapFocusShell";
import { TravelMapView } from "@/components/map/TravelMapView";
import { ParkList } from "@/components/dashboard/ParkList";
import { CityList } from "@/components/dashboard/CityList";
import { CountryManager } from "@/components/dashboard/CountryManager";
import { ShareProfileButton } from "@/components/share/ShareProfileButton";
import { createClient } from "@/lib/supabase/server";
import { BRAND } from "@/lib/constants";
import { profilePath } from "@/lib/seo/site";
import {
  computeTravelStats,
  getVisitedCountryCodes,
  getWishlistCountryCodes,
} from "@/lib/utils/stats";
import type { VisitedCity, VisitedCountry, VisitedPark, WishlistCountry } from "@/types/database";

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

  const [{ data: countries, error: countriesError }, { data: cities, error: citiesError }, { data: parks, error: parksError }, { data: wishlist, error: wishlistError }] =
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

  const visitedCountries = (countriesError ? [] : (countries ?? [])) as VisitedCountry[];
  const visitedCities = (citiesError ? [] : (cities ?? [])) as VisitedCity[];
  const visitedParks = (parksError ? [] : (parks ?? [])) as VisitedPark[];
  const wishlistCountries = (wishlistError ? [] : (wishlist ?? [])) as WishlistCountry[];
  const stats = computeTravelStats(visitedCountries, visitedCities, visitedParks);
  const visitedCodes = getVisitedCountryCodes(visitedCountries, visitedCities, visitedParks);
  const wishlistCodes = getWishlistCountryCodes(wishlistCountries);
  const displayName = profile?.display_name ?? profile?.username ?? "";

  return (
    <>
      <Header username={profile?.username} isLoggedIn />
      <main className="mx-auto flex w-full min-w-0 max-w-5xl flex-1 flex-col overflow-x-clip px-4 py-3 sm:py-8">
        <TravelMapFocusShell>
        <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
        <div className="flex min-w-0 flex-col gap-4 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 text-left">
            <h1 className="text-2xl font-bold text-white">
              {profile?.display_name ?? profile?.username}
            </h1>
            {profile?.username && (
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <Link
                  href={profilePath(profile.username)}
                  className="break-all text-blue-400 hover:text-blue-300"
                >
                  {BRAND.domain}
                  {profilePath(profile.username)}
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
          <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:max-w-sm sm:items-stretch lg:max-w-none lg:items-end">
            {profile?.username ? (
              <ShareProfileButton
                username={profile.username}
                displayName={displayName}
                stats={stats}
                isOwnProfile
              />
            ) : null}
            <TravelStatsInteractive
              stats={stats}
              visitedCountries={visitedCountries}
              visitedCities={visitedCities}
              visitedParks={visitedParks}
              wishlistCountries={wishlistCountries}
              displayName={displayName}
              username={profile?.username}
              className="w-full"
            />
          </div>
        </div>

        <div className="min-w-0">
        <div className="mb-8 min-w-0">
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
            parksCountryCodes={[
              ...new Set(visitedParks.map((p) => p.country_code.toUpperCase())),
            ]}
            isLoggedIn
            explorable
            showContinentFilter
          />
        </div>

        <div className="flex min-w-0 flex-col gap-10">
          <CountryManager
            visitedCountries={visitedCountries}
            wishlistCountries={wishlistCountries}
            visitedCountryCodes={visitedCodes}
            visitedCities={visitedCities}
            visitedParks={visitedParks}
          />
          <CityList cities={visitedCities} countries={visitedCountries} />
          <ParkList parks={visitedParks} countries={visitedCountries} />
        </div>
        </div>
        </div>
        </TravelMapFocusShell>
      </main>
    </>
  );
}
