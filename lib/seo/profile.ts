import type { TravelStats } from "@/types/database";
import { profileShareUrl } from "@/lib/seo/site";
import { getTravelerBadgeTier, type TravelerBadgeTier } from "@/lib/utils/traveler-badge";

const BADGE_OG_LABELS: Record<TravelerBadgeTier, string> = {
  explorer: "Explorer",
  globetrotter: "Globetrotter",
  super_voyager: "Super Voyager",
  world_citizen: "World Citizen",
};

/** Open Graph / Twitter card title for public profile links. */
export function buildProfileOgTitle(displayName: string): string {
  return `${displayName} traveled and pinned the places they've visited`;
}

/** Open Graph / Twitter card description for public profile links. */
export function buildProfileOgDescription(countryCount: number): string {
  const tier = getTravelerBadgeTier(countryCount);
  const title = tier ? BADGE_OG_LABELS[tier] : "Rising Traveler";

  return `Officially achieved ${title} status with ${countryCount} ${countryCount === 1 ? "country" : "countries"} visited. Tap to explore their travel secrets, photos, and next wishlist destinations!`;
}

export function buildProfileTitle(
  displayName: string,
  username: string
): string {
  return displayName === username ? `@${username}` : `${displayName} (@${username})`;
}

export function buildProfileDescription(
  displayName: string,
  stats: TravelStats
): string {
  if (stats.countries === 0 && stats.cities === 0) {
    return `${displayName}'s travel map on SeeMyCountries — explore countries and cities around the world.`;
  }

  const parts: string[] = [];
  if (stats.countries > 0) {
    parts.push(
      `${stats.countries} ${stats.countries === 1 ? "country" : "countries"}`
    );
  }
  if (stats.cities > 0) {
    parts.push(`${stats.cities} ${stats.cities === 1 ? "city" : "cities"}`);
  }

  return `${displayName} has visited ${parts.join(" and ")}. Explore the interactive travel map on SeeMyCountries.`;
}

export function buildShareText(
  displayName: string,
  stats: TravelStats,
  username: string,
  options?: { url?: string; isOwnProfile?: boolean }
): string {
  const url = options?.url ?? profileShareUrl(username);
  const isOwnProfile = options?.isOwnProfile ?? true;

  if (stats.countries === 0 && stats.cities === 0) {
    return isOwnProfile
      ? `Follow my travel journey on SeeMyCountries: ${url}`
      : `Follow ${displayName}'s travel journey on SeeMyCountries: ${url}`;
  }

  const parts: string[] = [];
  if (stats.countries > 0) {
    parts.push(
      `${stats.countries} ${stats.countries === 1 ? "country" : "countries"}`
    );
  }
  if (stats.cities > 0) {
    parts.push(`${stats.cities} ${stats.cities === 1 ? "city" : "cities"}`);
  }

  const statsPhrase = parts.join(" and ");
  return isOwnProfile
    ? `I've visited ${statsPhrase}! See my travel map on SeeMyCountries: ${url}`
    : `${displayName} has visited ${statsPhrase}! See their travel map on SeeMyCountries: ${url}`;
}
