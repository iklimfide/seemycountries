import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  fetchTravelShareSnapshot,
  saveTravelShareSnapshot,
} from "@/lib/supabase/travel-share-snapshot";
import {
  computeTravelStats,
  getVisitedCountryCodes,
} from "@/lib/utils/stats";
import type { VisitedCity, VisitedCountry, VisitedPark } from "@/types/database";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await fetchTravelShareSnapshot(supabase, user.id);
  return NextResponse.json({ snapshot });
}

export async function POST() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ data: countries }, { data: cities }, { data: parks }] = await Promise.all([
    supabase.from("visited_countries").select("*").eq("user_id", user.id),
    supabase.from("visited_cities").select("*").eq("user_id", user.id),
    supabase.from("visited_parks").select("*").eq("user_id", user.id),
  ]);

  const visitedCountries = (countries ?? []) as VisitedCountry[];
  const visitedCities = (cities ?? []) as VisitedCity[];
  const visitedParks = (parks ?? []) as VisitedPark[];
  const stats = computeTravelStats(visitedCountries, visitedCities, visitedParks);
  const visitedCodes = getVisitedCountryCodes(
    visitedCountries,
    visitedCities,
    visitedParks
  );

  const snapshot = await saveTravelShareSnapshot(
    supabase,
    user.id,
    stats,
    visitedCodes
  );

  if (!snapshot) {
    return NextResponse.json({ error: "Failed to save snapshot" }, { status: 500 });
  }

  return NextResponse.json({ snapshot });
}
