import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildTravelShareSnapshot,
  parseTravelShareSnapshot,
  type TravelShareSnapshot,
} from "@/lib/utils/travel-update";
import type { TravelStats } from "@/types/database";

export async function fetchTravelShareSnapshot(
  supabase: SupabaseClient,
  userId: string
): Promise<TravelShareSnapshot | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("travel_share_snapshot")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return parseTravelShareSnapshot(data.travel_share_snapshot);
}

export async function saveTravelShareSnapshot(
  supabase: SupabaseClient,
  userId: string,
  stats: TravelStats,
  visitedCountryCodes: string[]
): Promise<TravelShareSnapshot | null> {
  const snapshot = buildTravelShareSnapshot(stats, visitedCountryCodes);
  const { error } = await supabase
    .from("profiles")
    .update({
      travel_share_snapshot: snapshot,
      travel_share_snapshot_at: snapshot.savedAt,
    })
    .eq("id", userId);

  if (error) return null;
  return snapshot;
}
