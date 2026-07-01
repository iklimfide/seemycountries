import type { SupabaseClient } from "@supabase/supabase-js";
import type { ParkHub } from "@/lib/data/park-hubs";
import type { CountryTraveler } from "@/lib/supabase/country-travelers";
import { profilePath } from "@/lib/seo/site";
import { resolveProfileDisplayName } from "@/lib/utils/display-name";

type ParkPinRow = {
  user_id: string;
  created_at: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

export async function fetchRecentParkTravelers(
  supabase: SupabaseClient,
  hub: ParkHub,
  limit = 5
): Promise<CountryTraveler[]> {
  const code = hub.countryCode.toUpperCase();
  const parkName = hub.name.trim();

  const { data } = await supabase
    .from("visited_parks")
    .select("user_id, created_at, profiles!inner(username, display_name, avatar_url)")
    .eq("country_code", code)
    .ilike("park_name", parkName)
    .order("created_at", { ascending: false })
    .limit(30);

  const latestByUser = new Map<string, CountryTraveler>();

  for (const row of (data as ParkPinRow[] | null) ?? []) {
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

  return [...latestByUser.values()]
    .sort((a, b) => b.lastPinnedAt.localeCompare(a.lastPinnedAt))
    .slice(0, limit);
}
