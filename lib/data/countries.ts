import countriesLib from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

countriesLib.registerLocale(enLocale);

/** All ISO countries — never filtered by population. */
export type CountryOption = {
  code: string;
  name: string;
  searchText: string;
};

function formatCountryLabel(alias: string, official: string): string {
  if (alias.toLowerCase() === official.toLowerCase()) {
    return alias;
  }
  return `${alias} (${official})`;
}

function buildCountryOption(code: string): CountryOption {
  const official =
    countriesLib.getName(code, "en", { select: "official" }) ?? code;
  const alias =
    countriesLib.getName(code, "en", { select: "alias" }) ?? official;
  const name = formatCountryLabel(alias, official);
  const searchText = `${alias} ${official} ${name} ${code}`.toLowerCase();

  return { code, name, searchText };
}

export const COUNTRY_LIST: CountryOption[] = Object.keys(
  countriesLib.getNames("en", { select: "official" })
)
  .map(buildCountryOption)
  .sort((a, b) => a.name.localeCompare(b.name));

/** English display label, e.g. Turkey (Türkiye). */
export function getCountryName(code: string): string {
  const official =
    countriesLib.getName(code, "en", { select: "official" }) ??
    countriesLib.getName(code, "en") ??
    code;
  const alias =
    countriesLib.getName(code, "en", { select: "alias" }) ?? official;
  return formatCountryLabel(alias, official);
}
