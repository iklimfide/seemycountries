import type { SupabaseClient } from "@supabase/supabase-js";
import type { CityHub } from "@/lib/data/city-hubs";
import { profilePath } from "@/lib/seo/site";
import { resolveProfileDisplayName } from "@/lib/utils/display-name";
import type { MediaType } from "@/types/database";

export type CityTravelerPin = {
  id: string;
  note: string | null;
  mediaType: MediaType | null;
  mediaUrl: string | null;
  mediaPreviewUrl: string | null;
  visitDates: string[];
  pinnedAt: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  profilePath: string;
};

type CityPinRow = {
  id: string;
  note: string | null;
  media_type: MediaType | null;
  media_url: string | null;
  media_preview_url: string | null;
  visit_dates: string[] | null;
  updated_at: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

function rowToPin(row: CityPinRow): CityTravelerPin | null {
  const profile = row.profiles;
  if (!profile?.username) return null;

  const username = profile.username.toLowerCase();

  return {
    id: row.id,
    note: row.note,
    mediaType: row.media_type,
    mediaUrl: row.media_url,
    mediaPreviewUrl:
      row.media_preview_url ??
      (row.media_type === "photo" ? row.media_url : null),
    visitDates: row.visit_dates ?? [],
    pinnedAt: row.updated_at,
    username,
    displayName: resolveProfileDisplayName(profile.display_name, profile.username),
    avatarUrl: profile.avatar_url,
    profilePath: profilePath(username),
  };
}

function pinPriority(pin: CityTravelerPin): number {
  if (pin.mediaUrl) return 2;
  if (pin.note) return 1;
  return 0;
}

export async function fetchRecentCityPins(
  supabase: SupabaseClient,
  hub: CityHub,
  limit = 12
): Promise<CityTravelerPin[]> {
  const code = hub.countryCode.toUpperCase();

  const { data } = await supabase
    .from("visited_cities")
    .select(
      "id, note, media_type, media_url, media_preview_url, visit_dates, updated_at, profiles!inner(username, display_name, avatar_url)"
    )
    .eq("country_code", code)
    .ilike("city_name", hub.name.trim())
    .order("updated_at", { ascending: false })
    .limit(40);

  const pins = (data as CityPinRow[] | null ?? [])
    .map(rowToPin)
    .filter((pin): pin is CityTravelerPin => pin !== null)
    .sort((a, b) => {
      const priorityDiff = pinPriority(b) - pinPriority(a);
      if (priorityDiff !== 0) return priorityDiff;
      return b.pinnedAt.localeCompare(a.pinnedAt);
    });

  return pins.slice(0, limit);
}

export async function countCityPinners(
  supabase: SupabaseClient | null,
  hub: CityHub
): Promise<number> {
  if (!supabase) return 0;

  const { count } = await supabase
    .from("visited_cities")
    .select("user_id", { count: "exact", head: true })
    .eq("country_code", hub.countryCode.toUpperCase())
    .ilike("city_name", hub.name.trim());

  return count ?? 0;
}

export function cityPinsWithContent(pins: CityTravelerPin[]): CityTravelerPin[] {
  return pins.filter((pin) => Boolean(pin.mediaUrl) || Boolean(pin.note?.trim()));
}

export function uniqueCityTravelers(pins: CityTravelerPin[], limit = 5) {
  const seen = new Set<string>();
  const travelers: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
    profilePath: string;
    lastPinnedAt: string;
  }[] = [];

  for (const pin of pins) {
    if (seen.has(pin.username)) continue;
    seen.add(pin.username);
    travelers.push({
      username: pin.username,
      displayName: pin.displayName,
      avatarUrl: pin.avatarUrl,
      profilePath: pin.profilePath,
      lastPinnedAt: pin.pinnedAt,
    });
    if (travelers.length >= limit) break;
  }

  return travelers;
}
