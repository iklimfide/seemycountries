import {
  HOME_BEST_CITIES,
  HOME_BEST_COUNTRIES,
  HOME_BEST_PLACES,
} from "@/lib/data/home-best-destinations";
import { getCountryHubByCode, listCountryHubs } from "@/lib/data/country-hubs";
import { getCityHubBySlug, listCityHubSlugs } from "@/lib/data/city-hubs";
import { POPULAR_PARKS } from "@/lib/data/popular-parks";
import { TOURIST_CITIES } from "@/lib/data/tourist-cities";
import { cityPath, countryPath, parkPath } from "@/lib/seo/site";
import { buildParkSlug } from "@/lib/utils/park-slug";

export type LinkedDestination = {
  name: string;
  href: string | null;
};

function normalize(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("tr")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ");
}

function normalizeParkKey(value: string): string {
  return normalize(value).replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ");
}

function countryHrefByCode(code: string): string | null {
  const hub = getCountryHubByCode(code);
  return hub ? countryPath(hub.slug) : null;
}

function countryHrefByName(name: string): string | null {
  const hub = listCountryHubs().find((entry) => entry.name === name);
  return hub ? countryPath(hub.slug) : null;
}

function cityHubHrefByName(name: string): string | null {
  for (const slug of listCityHubSlugs()) {
    const hub = getCityHubBySlug(slug);
    if (hub?.name === name) return cityPath(slug);
  }
  return null;
}

function parkHrefByLabel(name: string): string | null {
  const query = normalizeParkKey(name);
  const park =
    POPULAR_PARKS.find((entry) => {
      const label = normalizeParkKey(entry.label);
      const parkName = normalizeParkKey(entry.parkName);
      return (
        label === query ||
        parkName === query ||
        parkName.includes(query) ||
        query.includes(label)
      );
    }) ?? null;

  if (!park) return null;

  return parkPath(buildParkSlug(park.parkName, park.countryCode));
}

function findTouristCityByName(name: string) {
  const query = normalize(name);
  return TOURIST_CITIES.find((city) => normalize(city.name) === query) ?? null;
}

function resolveCityHref(name: string): string | null {
  const cityHubHref = cityHubHrefByName(name);
  if (cityHubHref) return cityHubHref;

  const touristCity = findTouristCityByName(name);
  if (touristCity) return countryHrefByCode(touristCity.countryCode);

  return null;
}

function resolvePlaceHref(name: string): string | null {
  const parkHref = parkHrefByLabel(name);
  if (parkHref) return parkHref;

  const touristCity = findTouristCityByName(name);
  if (touristCity) return countryHrefByCode(touristCity.countryCode);

  return null;
}

function linkNames(names: readonly string[], resolveHref: (name: string) => string | null): LinkedDestination[] {
  return names.map((name) => ({
    name,
    href: resolveHref(name),
  }));
}

export const HOME_BEST_COUNTRIES_LINKED = linkNames(HOME_BEST_COUNTRIES, countryHrefByName);
export const HOME_BEST_CITIES_LINKED = linkNames(HOME_BEST_CITIES, resolveCityHref);
export const HOME_BEST_PLACES_LINKED = linkNames(HOME_BEST_PLACES, resolvePlaceHref);
