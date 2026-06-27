import type { VisitedCity, VisitedCountry, TravelStats } from "@/types/database";

export function computeTravelStats(
  countries: VisitedCountry[],
  cities: VisitedCity[]
): TravelStats {
  const countryCodes = new Set([
    ...countries.map((c) => c.country_code.toUpperCase()),
    ...cities.map((c) => c.country_code.toUpperCase()),
  ]);

  return {
    countries: countryCodes.size,
    cities: cities.length,
  };
}

export function getVisitedCountryCodes(
  countries: VisitedCountry[],
  cities: VisitedCity[] = []
): string[] {
  const codes = new Set([
    ...countries.map((c) => c.country_code.toUpperCase()),
    ...cities.map((c) => c.country_code.toUpperCase()),
  ]);
  return [...codes];
}
