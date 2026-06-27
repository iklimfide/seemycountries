import type { SupabaseClient } from "@supabase/supabase-js";

/** True if user has marked this country as visited (explicit country or any city). */
export async function isCountryVisited(
  supabase: SupabaseClient,
  userId: string,
  countryCode: string
): Promise<boolean> {
  const code = countryCode.toUpperCase();

  const { count: countryCount } = await supabase
    .from("visited_countries")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("country_code", code);

  if (countryCount && countryCount > 0) return true;

  const { count: cityCount } = await supabase
    .from("visited_cities")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("country_code", code);

  return (cityCount ?? 0) > 0;
}
