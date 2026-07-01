import type { SupabaseClient } from "@supabase/supabase-js";

type UserIdRow = {
  user_id: string;
};

export async function countCountryPinners(
  supabase: SupabaseClient | null,
  countryCode: string
): Promise<number> {
  if (!supabase) return 0;

  const code = countryCode.toUpperCase();
  const userIds = new Set<string>();

  const [{ data: countryRows }, { data: cityRows }, { data: parkRows }] = await Promise.all([
    supabase.from("visited_countries").select("user_id").eq("country_code", code),
    supabase.from("visited_cities").select("user_id").eq("country_code", code),
    supabase.from("visited_parks").select("user_id").eq("country_code", code),
  ]);

  for (const row of [
    ...(countryRows as UserIdRow[] | null ?? []),
    ...(cityRows as UserIdRow[] | null ?? []),
    ...(parkRows as UserIdRow[] | null ?? []),
  ]) {
    userIds.add(row.user_id);
  }

  return userIds.size;
}
