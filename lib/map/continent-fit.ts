import type { Feature, Geometry } from "geojson";
import { countryMetaFromFeature } from "@/lib/map/country";
import { featureInContinent, getCountryContinent, type ContinentId } from "@/lib/map/continents";

/** Shown on the Oceania map (excludes scattered Polynesia that break framing). */
export const OCEANIA_MAP_CODES = new Set([
  "AU", "NZ", "PG", "FJ", "NC", "SB", "VU", "WS", "TO", "MH", "FM", "PW", "NR",
]);

/** Large landmasses for framing the static profile world map. */
const WORLD_MAINLAND_FIT_CODES = new Set([
  "US", "CA", "MX", "BR", "AR", "CL", "CO", "PE", "GB", "IS", "NO", "SE", "FI", "DE", "FR",
  "ES", "IT", "TR", "RU", "KZ", "CN", "IN", "TH", "JP", "AU", "NZ", "ZA", "EG", "MA", "NG",
  "KE", "DZ", "SA", "IR", "PK", "ID", "MY", "VN", "KR",
]);

/**
 * Countries used only to calculate zoom/framing (large landmasses).
 * Display can include more neighbors in the same view.
 */
const CONTINENT_FIT_COUNTRY_CODES: Partial<Record<ContinentId, Set<string>>> = {
  asia: new Set([
    "CN", "IN", "JP", "ID", "TH", "VN", "KR", "SA", "IR", "PK", "MY", "PH", "BD",
    "MM", "KZ", "UZ", "TR", "AE", "AF", "IQ", "NP", "LK", "OM", "YE", "JO", "IL",
    "SY", "LA", "KH", "TW", "HK", "MO", "BT", "MN", "GE", "AM", "AZ", "KG", "TJ",
    "TM", "QA", "KW", "BH", "LB", "PS",
  ]),
  oceania: new Set(["AU", "NZ", "PG"]),
};

export function filterVisibleForContinent(
  continent: ContinentId,
  features: Feature<Geometry>[]
): Feature<Geometry>[] {
  return features.filter((country) => {
    const meta = countryMetaFromFeature(country);
    if (!meta || !featureInContinent(meta.code, continent)) return false;

    if (continent === "oceania") {
      return OCEANIA_MAP_CODES.has(meta.code);
    }

    return true;
  });
}

export function selectFitFeatures(
  continent: ContinentId,
  visibleFeatures: Feature<Geometry>[]
): Feature<Geometry>[] {
  if (continent === "world") return visibleFeatures;

  const fitCodes = CONTINENT_FIT_COUNTRY_CODES[continent];
  if (!fitCodes) return visibleFeatures;

  const picked = visibleFeatures.filter((country) => {
    const meta = countryMetaFromFeature(country);
    return meta != null && fitCodes.has(meta.code);
  });

  return picked.length > 0 ? picked : visibleFeatures;
}

/** Inhabited continents only — no Antarctica or remote Pacific/Atlantic micro-islands. */
export function filterMainlandWorldFeatures(
  features: Feature<Geometry>[]
): Feature<Geometry>[] {
  return features.filter((country) => {
    const meta = countryMetaFromFeature(country);
    if (!meta) return false;

    const continent = getCountryContinent(meta.code);
    if (!continent) return false;

    if (continent === "oceania" && !OCEANIA_MAP_CODES.has(meta.code)) {
      return false;
    }

    return true;
  });
}

export function selectMainlandWorldFitFeatures(
  visibleFeatures: Feature<Geometry>[]
): Feature<Geometry>[] {
  const picked = visibleFeatures.filter((country) => {
    const meta = countryMetaFromFeature(country);
    return meta != null && WORLD_MAINLAND_FIT_CODES.has(meta.code);
  });

  return picked.length > 0 ? picked : visibleFeatures;
}
