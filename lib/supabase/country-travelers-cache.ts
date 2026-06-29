import { unstable_cache } from "next/cache";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import {
  fetchRecentCountryTravelers,
  type CountryTraveler,
} from "@/lib/supabase/country-travelers";

export function getCachedRecentCountryTravelers(
  countryCode: string,
  revalidateSeconds = 120
): Promise<CountryTraveler[]> {
  const code = countryCode.toUpperCase();

  return unstable_cache(
    async () => {
      const supabase = createPublicSupabaseClient();
      if (!supabase) return [];
      return fetchRecentCountryTravelers(supabase, code);
    },
    ["country-recent-travelers", code],
    { revalidate: revalidateSeconds }
  )();
}
