import type {
  TravelStats,
  VisitedCity,
  VisitedCountry,
  VisitedPark,
  WishlistCountry,
} from "@/types/database";
import { isThemeParkType } from "@/lib/utils/park-type";
import { cityVisitCount } from "@/lib/utils/visit-date";

function countryVisitTotals(
  countries: VisitedCountry[],
  cities: VisitedCity[],
  parks: VisitedPark[]
): Map<string, number> {
  const totals = new Map<string, number>();

  for (const city of cities) {
    const code = city.country_code.toUpperCase();
    totals.set(code, (totals.get(code) ?? 0) + cityVisitCount(city));
  }

  for (const country of countries) {
    const code = country.country_code.toUpperCase();
    if (!totals.has(code)) totals.set(code, 1);
  }

  for (const park of parks) {
    const code = park.country_code.toUpperCase();
    if (!totals.has(code)) totals.set(code, 1);
  }

  return totals;
}

export function computeTravelStats(
  countries: VisitedCountry[],
  cities: VisitedCity[],
  parks: VisitedPark[] = []
): TravelStats {
  const countryTotals = countryVisitTotals(countries, cities, parks);
  const totalCountryVisits = [...countryTotals.values()].reduce((sum, count) => sum + count, 0);
  const totalCityVisits = cities.reduce((sum, city) => sum + cityVisitCount(city), 0);

  return {
    countries: totalCountryVisits,
    cities: totalCityVisits,
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

export function computeRepeatVisitSummary(
  countries: VisitedCountry[],
  cities: VisitedCity[],
  parks: VisitedPark[] = []
): { countriesVisitedMoreThanOnce: number; citiesVisitedMoreThanOnce: number } {
  const countryTotals = countryVisitTotals(countries, cities, parks);

  let countriesVisitedMoreThanOnce = 0;
  for (const total of countryTotals.values()) {
    if (total > 1) countriesVisitedMoreThanOnce++;
  }

  const citiesVisitedMoreThanOnce = cities.filter((city) => cityVisitCount(city) > 1).length;

  return { countriesVisitedMoreThanOnce, citiesVisitedMoreThanOnce };
}
