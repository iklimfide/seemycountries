import countriesLib from "i18n-iso-countries";
import type { Feature, Geometry } from "geojson";
import { featureInContinent, type ContinentId } from "@/lib/map/continents";

export type CountryMeta = {
  code: string;
  name: string;
};

export function countryMetaFromFeature(
  feature: Feature<Geometry>
): CountryMeta | null {
  if (feature.id == null || feature.id === "") return null;

  const code = countriesLib.numericToAlpha2(normalizeCountryNumericId(feature.id));
  if (!code) return null;

  const name = countriesLib.getName(code, "en") ?? code;
  return { code, name };
}

export function findCountryFeatureByCode(
  features: Feature<Geometry>[],
  code: string,
  continent: ContinentId = "world"
): Feature<Geometry> | undefined {
  const normalized = code.toUpperCase();

  return features.find((feature) => {
    const meta = countryMetaFromFeature(feature);
    if (!meta || meta.code !== normalized) return false;
    return featureInContinent(meta.code, continent);
  });
}

export function normalizeCountryNumericId(id: string | number): string {
  return String(id).padStart(3, "0");
}

export function countryCodesToNumericIds(codes: string[]): Set<string> {
  return new Set(
    codes
      .map((code) => countriesLib.alpha2ToNumeric(code))
      .filter(Boolean)
      .map((id) => normalizeCountryNumericId(id!))
  );
}
