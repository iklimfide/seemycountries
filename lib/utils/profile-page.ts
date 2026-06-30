import { buildVisitedCountryList } from "@/lib/map/travel-lists";
import { getCountryHubByCode } from "@/lib/data/country-hubs";
import { findCityHubSlug } from "@/lib/data/city-hubs";
import { cityVisitCount } from "@/lib/utils/visit-date";
import type { VisitedCity, VisitedCountry, VisitedPark, WishlistCountry } from "@/types/database";

const WORLD_COUNTRY_TOTAL = 195;

function countryHubSlug(code: string): string | null {
  return getCountryHubByCode(code)?.slug ?? null;
}

function cityHubSlug(countryCode: string, cityName: string): string | null {
  return findCityHubSlug(countryCode, cityName);
}

export type ProfileTrip = {
  id: string;
  cityName: string;
  citySlug: string | null;
  countryCode: string;
  countryName: string;
  countrySlug: string | null;
  imageUrl: string | null;
  note: string | null;
  visitCount: number;
  createdAt: string;
  badge: "recent" | "favorite" | "dayTrip" | null;
};

export type ProfileSummary = {
  topCity: {
    name: string;
    countryName: string;
    citySlug: string | null;
    countrySlug: string | null;
  } | null;
  nextWishlist: { name: string; code: string; countrySlug: string | null } | null;
  countryCount: number;
  repeatCityCount: number;
};

export type LatestVisitedCountry = {
  name: string;
  countrySlug: string | null;
};

function mediaImageUrl(item: {
  media_type: string | null;
  media_url: string | null;
  media_preview_url?: string | null;
}): string | null {
  if (item.media_type === "photo" && item.media_url) return item.media_url;
  if (item.media_preview_url) return item.media_preview_url;
  return null;
}

export function resolveProfileCoverUrl(
  cities: VisitedCity[],
  parks: VisitedPark[] = []
): string | null {
  const candidates = [...cities, ...parks].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  for (const place of candidates) {
    const url = mediaImageUrl(place);
    if (url) return url;
  }

  return null;
}

function tripBadge(city: VisitedCity, isRecent: boolean): ProfileTrip["badge"] {
  const visits = cityVisitCount(city);
  if (isRecent) return "recent";
  if (visits > 3) return "favorite";
  if (visits === 1) return "dayTrip";
  return null;
}

export function buildProfileTrips(cities: VisitedCity[]): ProfileTrip[] {
  const sorted = [...cities].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const recentThreshold = sorted[0]?.created_at;

  return sorted.map((city) => ({
    id: city.id,
    cityName: city.city_name,
    citySlug: cityHubSlug(city.country_code, city.city_name),
    countryCode: city.country_code,
    countryName: city.country_name,
    countrySlug: countryHubSlug(city.country_code),
    imageUrl: mediaImageUrl(city),
    note: city.note,
    visitCount: cityVisitCount(city),
    createdAt: city.created_at,
    badge: tripBadge(city, city.created_at === recentThreshold),
  }));
}

export function buildProfileSummary(
  visitedCountries: VisitedCountry[],
  visitedCities: VisitedCity[],
  visitedParks: VisitedPark[],
  wishlistCountries: WishlistCountry[]
): ProfileSummary {
  let topCity: ProfileSummary["topCity"] = null;
  let topVisits = 0;

  for (const city of visitedCities) {
    const visits = cityVisitCount(city);
    if (visits > topVisits) {
      topVisits = visits;
      topCity = {
        name: city.city_name,
        countryName: city.country_name,
        citySlug: cityHubSlug(city.country_code, city.city_name),
        countrySlug: countryHubSlug(city.country_code),
      };
    }
  }

  const countryCount = buildVisitedCountryList(
    visitedCountries,
    visitedCities,
    [],
    visitedParks
  ).length;

  const repeatCityCount = visitedCities.filter((city) => cityVisitCount(city) > 1).length;
  const nextWishlist = wishlistCountries[0]
    ? {
        name: wishlistCountries[0].country_name,
        code: wishlistCountries[0].country_code,
        countrySlug: countryHubSlug(wishlistCountries[0].country_code),
      }
    : null;

  return { topCity, nextWishlist, countryCount, repeatCityCount };
}

export function worldCoveragePercent(countryCount: number): number {
  if (countryCount <= 0) return 0;
  return Math.min(100, Math.round((countryCount / WORLD_COUNTRY_TOTAL) * 100));
}

export function latestVisitedCountry(
  visitedCountries: VisitedCountry[],
  visitedCities: VisitedCity[],
  visitedParks: VisitedPark[]
): LatestVisitedCountry | null {
  const items: { name: string; code: string; at: number }[] = [];

  for (const country of visitedCountries) {
    items.push({
      name: country.country_name,
      code: country.country_code,
      at: new Date(country.created_at).getTime(),
    });
  }
  for (const city of visitedCities) {
    items.push({
      name: city.country_name,
      code: city.country_code,
      at: new Date(city.created_at).getTime(),
    });
  }
  for (const park of visitedParks) {
    items.push({
      name: park.country_name,
      code: park.country_code,
      at: new Date(park.created_at).getTime(),
    });
  }

  items.sort((a, b) => b.at - a.at);
  const latest = items[0];
  if (!latest) return null;

  return {
    name: latest.name,
    countrySlug: countryHubSlug(latest.code),
  };
}
