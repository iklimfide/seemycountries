import { unstable_cache } from "next/cache";
import type { CityHub } from "@/lib/data/city-hubs";
import { cityPinsCacheTag } from "@/lib/cache/revalidate-city-hub";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { fetchRecentCityPins, type CityTravelerPin } from "@/lib/supabase/city-travelers";

export function getCachedRecentCityPins(
  hub: CityHub,
  revalidateSeconds = 120
): Promise<CityTravelerPin[]> {
  const code = hub.countryCode.toUpperCase();
  const city = hub.name.trim().toLowerCase();

  return unstable_cache(
    async () => {
      const supabase = createPublicSupabaseClient();
      if (!supabase) return [];
      return fetchRecentCityPins(supabase, hub);
    },
    ["city-recent-pins", code, city],
    {
      revalidate: revalidateSeconds,
      tags: [cityPinsCacheTag(code, hub.name)],
    }
  )();
}

export function getCachedRecentCityPinsWithPreviews(
  hub: CityHub,
  revalidateSeconds = 120
): Promise<CityTravelerPin[]> {
  return getCachedRecentCityPins(hub, revalidateSeconds);
}
