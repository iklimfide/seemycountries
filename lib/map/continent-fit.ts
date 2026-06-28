import type { Feature, Geometry } from "geojson";
import { countryMetaFromFeature } from "@/lib/map/country";
import { featureInContinent, type ContinentId } from "@/lib/map/continents";

/** Shown on the Oceania map (excludes scattered Polynesia that break framing). */
const OCEANIA_MAP_CODES = new Set([
  "AU", "NZ", "PG", "FJ", "NC", "SB", "VU", "WS", "TO", "MH", "FM", "PW", "NR",
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
