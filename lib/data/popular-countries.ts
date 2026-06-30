import { COUNTRY_LIST, type CountryOption } from "@/lib/data/countries";
import { POPULAR_DESTINATIONS } from "@/lib/data/popular-destinations";
import { POPULAR_PARKS } from "@/lib/data/popular-parks";

/** Countries ordered by first appearance in curated popular destinations, then parks. */
export function getPopularCountries(limit = 40): CountryOption[] {
  const byCode = new Map(COUNTRY_LIST.map((country) => [country.code, country]));
  const seen = new Set<string>();
  const result: CountryOption[] = [];

  function addCode(code: string) {
    const upper = code.toUpperCase();
    if (seen.has(upper)) return;
    const country = byCode.get(upper);
    if (!country) return;
    seen.add(upper);
    result.push(country);
  }

  for (const destination of POPULAR_DESTINATIONS) {
    addCode(destination.countryCode);
    if (result.length >= limit) return result;
  }

  for (const park of POPULAR_PARKS) {
    addCode(park.countryCode);
    if (result.length >= limit) return result;
  }

  return result;
}
