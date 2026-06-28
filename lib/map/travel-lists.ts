import type { VisitedCity, VisitedCountry } from "@/types/database";

export type TravelCountryItem = {
  code: string;
  name: string;
};

export type TravelCityItem = {
  id: string;
  city_name: string;
  country_code: string;
  country_name: string;
};

export function buildVisitedCountryList(
  countries: VisitedCountry[],
  cities: VisitedCity[]
): TravelCountryItem[] {
  const map = new Map<string, TravelCountryItem>();

  for (const country of countries) {
    const code = country.country_code.toUpperCase();
    map.set(code, { code: country.country_code, name: country.country_name });
  }

  for (const city of cities) {
    const code = city.country_code.toUpperCase();
    if (!map.has(code)) {
      map.set(code, { code: city.country_code, name: city.country_name });
    }
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function buildVisitedCityList(cities: VisitedCity[]): TravelCityItem[] {
  return [...cities].sort((a, b) => {
    const byCountry = a.country_name.localeCompare(b.country_name);
    if (byCountry !== 0) return byCountry;
    return a.city_name.localeCompare(b.city_name);
  });
}
