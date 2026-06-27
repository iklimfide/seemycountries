import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { TravelStatsBar } from "@/components/stats/TravelStats";
import { TravelMapView } from "@/components/map/TravelMapView";
import { createClient } from "@/lib/supabase/server";
import { DEMO_CITIES } from "@/lib/data/demo-cities";
import {
  computeTravelStats,
  getVisitedCountryCodes,
} from "@/lib/utils/stats";
import type { VisitedCity, VisitedCountry } from "@/types/database";

export default async function HomePage() {
  const t = await getTranslations("home");
  const supabase = await createClient();

  let user = null;
  let username: string | null = null;
  let displayName: string | null = null;
  let countries: VisitedCountry[] = [];
  let cities: VisitedCity[] = DEMO_CITIES;
  let isDemo = true;

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

      const [{ data: userCountries }, { data: userCities }] = await Promise.all([
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
      ]);

      if (
        (userCountries && userCountries.length > 0) ||
        (userCities && userCities.length > 0)
      ) {
        countries = userCountries as VisitedCountry[];
        cities = (userCities ?? []) as VisitedCity[];
        isDemo = false;
      }
    }
  }

  const stats = computeTravelStats(
    isDemo ? [] : countries,
    cities
  );
  const countryCodes = getVisitedCountryCodes(
    isDemo ? [] : countries,
    cities
  );

  return (
    <>
      <Header username={username} isLoggedIn={!!user} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="text-left">
            <p className="text-sm font-medium text-blue-400">
              {isDemo ? t("demoLabel") : displayName}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {t("hero")}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400 sm:text-base">
              {isDemo ? t("subtitle") : t("yourMap")}
            </p>
          </div>
          <TravelStatsBar stats={stats} />
        </div>

        <TravelMapView cities={cities} visitedCountryCodes={countryCodes} />

        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-6 py-5 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-medium text-white">{t("ctaTitle")}</p>
            <p className="mt-1 text-sm text-slate-500">{t("ctaHint")}</p>
          </div>
          {user ? (
            <Link
              href="/dashboard"
              className="shrink-0 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
            >
              {t("editMap")}
            </Link>
          ) : (
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
          )}
        </div>
      </main>
    </>
  );
}
