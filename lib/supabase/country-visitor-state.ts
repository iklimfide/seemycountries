import type { SupabaseClient } from "@supabase/supabase-js";
import type { CountryHub } from "@/lib/data/country-hubs";
import {
  GUEST_COUNTRY_VISITOR_STATE,
  type CountryVisitorState,
} from "@/lib/data/country-visitor-state";

export async function getCountryVisitorState(
  supabase: SupabaseClient,
  userId: string,
  hub: CountryHub
): Promise<CountryVisitorState> {
  const code = hub.code.toUpperCase();

  const [
    { data: visited },
    { data: wishlist },
    { count: cityCount },
    { count: parkCount },
  ] = await Promise.all([
    supabase
      .from("visited_countries")
      .select("id")
      .eq("user_id", userId)
      .eq("country_code", code)
      .maybeSingle(),
    supabase
      .from("wishlist_countries")
      .select("id")
      .eq("user_id", userId)
      .eq("country_code", code)
      .maybeSingle(),
    supabase
      .from("visited_cities")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("country_code", code),
    supabase
      .from("visited_parks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("country_code", code),
  ]);

  const visitedId = visited?.id ?? null;
  const hasPlaces = (cityCount ?? 0) > 0 || (parkCount ?? 0) > 0;
  const isOnMap = Boolean(visitedId) || hasPlaces;

  return {
    isLoggedIn: true,
    visitedId,
    wishlistId: wishlist?.id ?? null,
    isOnMap,
    visitedViaPlacesOnly: isOnMap && !visitedId,
  };
}

export async function loadCountryVisitorState(
  supabase: SupabaseClient | null,
  userId: string | undefined,
  hub: CountryHub
): Promise<CountryVisitorState> {
  if (!supabase || !userId) {
    return GUEST_COUNTRY_VISITOR_STATE;
  }
  return getCountryVisitorState(supabase, userId, hub);
}
