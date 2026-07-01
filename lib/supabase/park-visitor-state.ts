import type { SupabaseClient } from "@supabase/supabase-js";
import type { ParkHub } from "@/lib/data/park-hubs";
import { GUEST_PARK_VISITOR_STATE, type ParkVisitorState } from "@/lib/data/park-visitor-state";

export async function loadParkVisitorState(
  supabase: SupabaseClient | null,
  userId: string | undefined,
  hub: ParkHub
): Promise<ParkVisitorState> {
  if (!supabase || !userId) return GUEST_PARK_VISITOR_STATE;

  const code = hub.countryCode.toUpperCase();
  const parkName = hub.name.trim();

  const [{ data: parks }, { data: wishlist }, { data: visitedCountries }] = await Promise.all([
    supabase
      .from("visited_parks")
      .select("id")
      .eq("user_id", userId)
      .eq("country_code", code)
      .ilike("park_name", parkName)
      .limit(1),
    supabase
      .from("wishlist_countries")
      .select("id")
      .eq("user_id", userId)
      .eq("country_code", code)
      .limit(1),
    supabase
      .from("visited_countries")
      .select("id")
      .eq("user_id", userId)
      .eq("country_code", code)
      .limit(1),
  ]);

  return {
    isLoggedIn: true,
    parkId: parks?.[0]?.id ?? null,
    countryWishlistId: wishlist?.[0]?.id ?? null,
    countryVisited: Boolean(visitedCountries?.[0]),
  };
}

export async function countParkPinners(
  supabase: SupabaseClient | null,
  hub: ParkHub
): Promise<number> {
  if (!supabase) return 0;

  const { count } = await supabase
    .from("visited_parks")
    .select("user_id", { count: "exact", head: true })
    .eq("country_code", hub.countryCode.toUpperCase())
    .ilike("park_name", hub.name.trim());

  return count ?? 0;
}
