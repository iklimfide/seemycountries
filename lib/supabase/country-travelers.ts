import type { SupabaseClient } from "@supabase/supabase-js";
import { profilePath } from "@/lib/seo/site";
import { resolveProfileDisplayName } from "@/lib/utils/display-name";

export type CountryTraveler = {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  lastPinnedAt: string;
  profilePath: string;
};

type CountryVisitRow = {
  user_id: string;
  created_at: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

export async function fetchRecentCountryTravelers(
  supabase: SupabaseClient,
  countryCode: string,
  limit = 5
): Promise<CountryTraveler[]> {
  const code = countryCode.toUpperCase();

  const [{ data: countryRows }, { data: cityRows }] = await Promise.all([
    supabase
      .from("visited_countries")
      .select("user_id, created_at, profiles!inner(username, display_name, avatar_url)")
      .eq("country_code", code)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("visited_cities")
      .select("user_id, created_at, profiles!inner(username, display_name, avatar_url)")
      .eq("country_code", code)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const latestByUser = new Map<string, CountryTraveler>();

  const ingest = (rows: CountryVisitRow[] | null) => {
    for (const row of rows ?? []) {
      const profile = row.profiles;
      if (!profile?.username) continue;

      const username = profile.username.toLowerCase();
      const existing = latestByUser.get(row.user_id);
      if (existing && existing.lastPinnedAt >= row.created_at) continue;

      latestByUser.set(row.user_id, {
        username,
        displayName: resolveProfileDisplayName(profile.display_name, profile.username),
        avatarUrl: profile.avatar_url,
        lastPinnedAt: row.created_at,
        profilePath: profilePath(username),
      });
    }
  };

  ingest(countryRows as CountryVisitRow[] | null);
  ingest(cityRows as CountryVisitRow[] | null);

  return [...latestByUser.values()]
    .sort((a, b) => b.lastPinnedAt.localeCompare(a.lastPinnedAt))
    .slice(0, limit);
}
