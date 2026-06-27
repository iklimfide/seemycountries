import majorCitiesByCountry from "./major-cities.json";
import { LIMITS } from "@/lib/constants";

export type MajorCity = {
  name: string;
  latitude: number;
  longitude: number;
  population: number;
};

const catalog = majorCitiesByCountry as Record<string, MajorCity[]>;

/** Cities only — filtered to minCityPopulation when the JSON was generated. */
export function getMajorCitiesForCountry(countryCode: string): MajorCity[] {
  return catalog[countryCode.toUpperCase()] ?? [];
}

export function getMinCityPopulation(): number {
  return LIMITS.minCityPopulation;
}
