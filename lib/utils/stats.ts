import type {
  TravelStats,
  VisitedCity,
  VisitedCountry,
  VisitedPark,
  WishlistCountry,
} from "@/types/database";
import { isThemeParkType } from "@/lib/utils/park-type";

export function computeTravelStats(
  countries: VisitedCountry[],
  cities: VisitedCity[],
  parks: VisitedPark[] = []
): TravelStats {
  const countryCodes = new Set([
    ...countries.map((c) => c.country_code.toUpperCase()),
    ...cities.map((c) => c.country_code.toUpperCase()),
    ...parks.map((p) => p.country_code.toUpperCase()),
  ]);

  return {
    countries: countryCodes.size,
    cities: cities.length,
    nationalParks: parks.filter((p) => p.park_type === "national_park").length,
    themeParks: parks.filter((p) => isThemeParkType(p.park_type)).length,
  };
}

export function getVisitedCountryCodes(
  countries: VisitedCountry[],
  cities: VisitedCity[] = [],
  parks: VisitedPark[] = []
): string[] {
  const codes = new Set([
    ...countries.map((c) => c.country_code.toUpperCase()),
    ...cities.map((c) => c.country_code.toUpperCase()),
    ...parks.map((p) => p.country_code.toUpperCase()),
  ]);
  return [...codes];
}

export function getWishlistCountryCodes(wishlist: WishlistCountry[]): string[] {
  return wishlist.map((c) => c.country_code.toUpperCase());
}
