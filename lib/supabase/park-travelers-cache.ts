import { unstable_cache } from "next/cache";
import type { ParkHub } from "@/lib/data/park-hubs";
import { parkPinsCacheTag } from "@/lib/cache/revalidate-park-hub";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { fetchRecentParkTravelers } from "@/lib/supabase/park-travelers";

export function getCachedRecentParkTravelers(
  hub: ParkHub,
  revalidateSeconds = 120
) {
  const code = hub.countryCode.toUpperCase();
  const park = hub.name.trim().toLowerCase();

  return unstable_cache(
    async () => {
      const supabase = createPublicSupabaseClient();
      if (!supabase) return [];
      return fetchRecentParkTravelers(supabase, hub);
    },
    ["park-recent-travelers", code, park],
    {
      revalidate: revalidateSeconds,
      tags: [parkPinsCacheTag(code, hub.name)],
    }
  )();
}
