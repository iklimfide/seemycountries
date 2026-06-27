import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { TravelStatsBar } from "@/components/stats/TravelStats";
import { TravelMapView } from "@/components/map/TravelMapView";
import { createClient } from "@/lib/supabase/server";
import {
  computeTravelStats,
  getVisitedCountryCodes,
} from "@/lib/utils/stats";
import type { VisitedCity, VisitedCountry } from "@/types/database";

type PageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username}`,
    description: `Travel map of @${username} on SeeMyCountries`,
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;
  const t = await getTranslations("profile");
  const supabase = await createClient();
  if (!supabase) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("username", username.toLowerCase())
    .single();

  if (!profile) {
    notFound();
  }

  const { data: countries } = await supabase
    .from("visited_countries")
    .select("*")
    .eq("user_id", profile.id)
    .order("country_name", { ascending: true });

  const { data: cities } = await supabase
    .from("visited_cities")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const visitedCountries = (countries ?? []) as VisitedCountry[];
  const visitedCities = (cities ?? []) as VisitedCity[];
  const stats = computeTravelStats(visitedCountries, visitedCities);
  const countryCodes = getVisitedCountryCodes(visitedCountries, visitedCities);

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

  return (
    <>
      <Header username={currentUsername} isLoggedIn={!!user} />
      <main className="mx-auto max-w-5xl flex-1 px-4 py-8">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-bold text-white">
            {profile.display_name ?? profile.username}
          </h1>
          <p className="text-slate-500">@{profile.username}</p>
          <TravelStatsBar stats={stats} />
        </div>

        {visitedCountries.length === 0 && visitedCities.length === 0 ? (
          <p className="text-center text-slate-500">{t("noCountries")}</p>
        ) : (
          <TravelMapView
            cities={visitedCities}
            visitedCountryCodes={countryCodes}
            interactive
          />
        )}
      </main>
    </>
  );
}
