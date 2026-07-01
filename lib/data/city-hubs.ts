import rawCities from "@/data/city-hubs.json";
import { searchTouristCities, type TouristCity } from "@/lib/data/tourist-cities";
import { searchTouristParks, type TouristPark } from "@/lib/data/tourist-park-search";
import { getCountryHubByCode, type CountryHub } from "@/lib/data/country-hubs";

export type CityHub = {
  slug: string;
  name: string;
  countryCode: string;
  countrySlug: string;
  countryName: string;
  touristCityName?: string;
  heroImage?: string;
  heroImageAlt?: string;
};

type CityHubsFile = {
  cities: Record<string, CityHub>;
};

const catalog = rawCities as CityHubsFile;

const bySlug = new Map<string, CityHub>();
const byCountryAndName = new Map<string, CityHub>();

for (const hub of Object.values(catalog.cities)) {
  bySlug.set(hub.slug.toLowerCase(), hub);
  const key = `${hub.countryCode.toUpperCase()}:${hub.name.toLocaleLowerCase("tr")}`;
  byCountryAndName.set(key, hub);
}

export function getCityHubBySlug(slug: string): CityHub | null {
  return bySlug.get(slug.toLowerCase()) ?? null;
}

export function findCityHubSlug(countryCode: string, cityName: string): string | null {
  const key = `${countryCode.toUpperCase()}:${cityName.trim().toLocaleLowerCase("tr")}`;
  return byCountryAndName.get(key)?.slug ?? null;
}

export function findCityHubByName(cityName: string): CityHub | null {
  const needle = cityName.trim().toLocaleLowerCase("tr");
  if (!needle) return null;

  for (const hub of bySlug.values()) {
    if (hub.name.toLocaleLowerCase("tr") === needle) {
      return hub;
    }
  }

  return null;
}

export function listCityHubSlugs(): string[] {
  return [...bySlug.keys()].sort((a, b) => a.localeCompare(b));
}

export function getCityHubTouristCity(hub: CityHub): TouristCity | null {
  const searchName = hub.touristCityName ?? hub.name;
  const matches = searchTouristCities(hub.countryCode, searchName, 10);
  const exact = matches.find(
    (city) => city.name.toLocaleLowerCase("tr") === searchName.toLocaleLowerCase("tr")
  );
  return exact ?? matches[0] ?? null;
}

export function getCityHubParks(hub: CityHub, limit = 12): TouristPark[] {
  return searchTouristParks(hub.countryCode, hub.name, limit);
}

export type CityHubContext = {
  hub: CityHub;
  touristCity: TouristCity | null;
  countryHub: CountryHub | null;
  parks: TouristPark[];
};

export function getCityHubContext(slug: string): CityHubContext | null {
  const hub = getCityHubBySlug(slug);
  if (!hub) return null;

  return {
    hub,
    touristCity: getCityHubTouristCity(hub),
    countryHub: getCountryHubByCode(hub.countryCode),
    parks: getCityHubParks(hub),
  };
}
