import type { SupabaseClient } from "@supabase/supabase-js";
import type { CityHub } from "@/lib/data/city-hubs";
import {
  GUEST_VISITOR_STATE,
  type CityVisitorState,
} from "@/lib/data/city-visitor-state";

export async function getCityVisitorState(
  supabase: SupabaseClient,
  userId: string,
  hub: CityHub
): Promise<CityVisitorState> {
  const code = hub.countryCode.toUpperCase();

  const [{ data: city }, { data: wishlist }, { data: country }] = await Promise.all([
    supabase
      .from("visited_cities")
      .select("id")
      .eq("user_id", userId)
      .eq("country_code", code)
      .ilike("city_name", hub.name.trim())
      .maybeSingle(),
    supabase
      .from("wishlist_countries")
      .select("id")
      .eq("user_id", userId)
      .eq("country_code", code)
      .maybeSingle(),
    supabase
      .from("visited_countries")
      .select("id")
      .eq("user_id", userId)
      .eq("country_code", code)
      .maybeSingle(),
  ]);

  return {
    isLoggedIn: true,
    cityId: city?.id ?? null,
    countryWishlistId: wishlist?.id ?? null,
    countryVisited: Boolean(country) || Boolean(city),
  };
}

export async function loadCityVisitorState(
  supabase: SupabaseClient | null,
  userId: string | undefined,
  hub: CityHub
): Promise<CityVisitorState> {
  if (!supabase || !userId) {
    return GUEST_VISITOR_STATE;
  }
  return getCityVisitorState(supabase, userId, hub);
}
