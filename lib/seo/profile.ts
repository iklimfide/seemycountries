import type { TravelStats } from "@/types/database";
import { profileUrl } from "@/lib/seo/site";

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
  username: string
): string {
  const url = profileUrl(username);
  if (stats.countries === 0 && stats.cities === 0) {
    return `Follow my travel journey on SeeMyCountries: ${url}`;
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

  return `I've visited ${parts.join(" and ")}! See my travel map on SeeMyCountries: ${url}`;
}
