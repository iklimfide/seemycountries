import { redirect } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { TravelStatsBar } from "@/components/stats/TravelStats";
import { TravelMapView } from "@/components/map/TravelMapView";
import { CityList } from "@/components/dashboard/CityList";
import { CountryList } from "@/components/dashboard/CountryList";
import { createClient } from "@/lib/supabase/server";
import {
  computeTravelStats,
  getVisitedCountryCodes,
} from "@/lib/utils/stats";
import type { VisitedCity, VisitedCountry } from "@/types/database";

export default async function DashboardPage() {
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

  const { data: countries, error: countriesError } = await supabase
    .from("visited_countries")
    .select("*")
    .eq("user_id", user.id)
    .order("country_name", { ascending: true });

  const { data: cities } = await supabase
    .from("visited_cities")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const visitedCountries = (countriesError ? [] : (countries ?? [])) as VisitedCountry[];
  const visitedCities = (cities ?? []) as VisitedCity[];
  const stats = computeTravelStats(visitedCountries, visitedCities);
  const countryCodes = getVisitedCountryCodes(visitedCountries, visitedCities);

  return (
    <>
      <Header username={profile?.username} isLoggedIn />
      <main className="mx-auto max-w-5xl flex-1 px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {profile?.display_name ?? profile?.username}
            </h1>
            {profile?.username && (
              <Link
                href={`/u/${profile.username}`}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                seemycountries.com/u/{profile.username}
              </Link>
            )}
          </div>
          <TravelStatsBar stats={stats} />
        </div>

        <div className="mb-8">
          <TravelMapView cities={visitedCities} visitedCountryCodes={countryCodes} />
        </div>

        <div className="flex flex-col gap-10">
          <CountryList countries={visitedCountries} />
          <CityList cities={visitedCities} countries={visitedCountries} />
        </div>
      </main>
    </>
  );
}
