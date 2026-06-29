import rawCountries from "@/data/countries.json";

export type CountryHub = {
  slug: string;
  code: string;
  name: string;
  currency: string;
  plugType: string;
  visaNote: string;
  capital: string;
  language: string;
};

type CountriesFile = {
  countries: Record<string, CountryHub>;
};

const catalog = rawCountries as CountriesFile;

const bySlug = new Map<string, CountryHub>();
const byCode = new Map<string, CountryHub>();

for (const hub of Object.values(catalog.countries)) {
  bySlug.set(hub.slug.toLowerCase(), hub);
  byCode.set(hub.code.toUpperCase(), hub);
}

export function getCountryHubBySlug(slug: string): CountryHub | null {
  return bySlug.get(slug.toLowerCase()) ?? null;
}

export function getCountryHubByCode(code: string): CountryHub | null {
  return byCode.get(code.toUpperCase()) ?? null;
}

export function listCountryHubSlugs(): string[] {
  return [...bySlug.keys()].sort((a, b) => a.localeCompare(b));
}

export function listCountryHubs(): CountryHub[] {
  return listCountryHubSlugs()
    .map((slug) => bySlug.get(slug)!)
    .filter(Boolean);
}
