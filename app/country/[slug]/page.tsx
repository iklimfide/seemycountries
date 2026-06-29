import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { CountryHubContent } from "@/components/country/CountryHubContent";
import { getCountryHubBySlug, listCountryHubSlugs } from "@/lib/data/country-hubs";
import { getCachedRecentCountryTravelers } from "@/lib/supabase/country-travelers-cache";
import { countryPath, countryUrl } from "@/lib/seo/site";
import { sanitizeCountrySlug } from "@/lib/utils/sanitize-country-slug";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateStaticParams() {
  return listCountryHubSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = sanitizeCountrySlug(rawSlug);
  if (!slug) return { title: "Country" };

  const hub = getCountryHubBySlug(slug);
  if (!hub) return { title: "Country not found" };

  const title = `${hub.name} travel guide`;
  const description = `Plan a trip to ${hub.name}: ${hub.currency}. ${hub.plugType}. ${hub.visaNote}`;

  return {
    title,
    description,
    alternates: { canonical: countryPath(slug) },
    openGraph: {
      title,
      description,
      url: countryUrl(slug),
    },
  };
}

export default async function CountryHubPage({ params }: PageProps) {
  const { slug: rawSlug } = await params;
  const slug = sanitizeCountrySlug(rawSlug);
  if (!slug) notFound();

  const hub = getCountryHubBySlug(slug);
  if (!hub) notFound();

  const [t, travelers] = await Promise.all([
    getTranslations("countryHub"),
    getCachedRecentCountryTravelers(hub.code),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${hub.name} on TravelerPin`,
    description: hub.visaNote,
    url: countryUrl(slug),
  };

  const labels = {
    quickFacts: t("quickFacts"),
    currency: t("currency"),
    plugType: t("plugType"),
    visa: t("visa"),
    capital: t("capital"),
    language: t("language"),
    recentTravelers: t("recentTravelers"),
    noTravelersYet: t("noTravelersYet"),
    pinCountry: t("pinCountry"),
    addToMap: t("addToMap"),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-10">
        <CountryHubContent hub={hub} travelers={travelers} labels={labels} />
      </main>
    </>
  );
}
