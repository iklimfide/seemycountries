import { notFound, redirect } from "next/navigation";
import { sanitizeCountrySlug } from "@/lib/utils/sanitize-country-slug";
import { getCountryHubBySlug } from "@/lib/data/country-hubs";
import { countryPath } from "@/lib/seo/site";

type PageProps = {
  searchParams: Promise<{ name?: string }>;
};

/** Legacy/query URL: /country?name=italy → /country/italy */
export default async function CountryQueryRedirectPage({ searchParams }: PageProps) {
  const { name } = await searchParams;
  const slug = sanitizeCountrySlug(name);
  if (!slug || !getCountryHubBySlug(slug)) {
    notFound();
  }

  redirect(countryPath(slug));
}
