import type { SupabaseClient } from "@supabase/supabase-js";

export async function ensureVisitedCountry(
  supabase: SupabaseClient,
  userId: string,
  countryCode: string,
  countryName: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const code = countryCode.toUpperCase();

  const { data: visitedCountry } = await supabase
    .from("visited_countries")
    .select("id")
    .eq("user_id", userId)
    .eq("country_code", code)
    .maybeSingle();

  if (visitedCountry) {
    return { ok: true };
  }

  const { error: countryError } = await supabase.from("visited_countries").insert({
    user_id: userId,
    country_code: code,
    country_name: countryName,
  });

  if (countryError && countryError.code !== "23505") {
    return { ok: false, error: countryError.message };
  }

  await supabase
    .from("wishlist_countries")
    .delete()
    .eq("user_id", userId)
    .eq("country_code", code);

  return { ok: true };
}
