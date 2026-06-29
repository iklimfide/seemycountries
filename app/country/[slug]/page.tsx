import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { CountryPageContent } from "@/components/country/CountryPageContent";
import { getCountryHubBySlug, listCountryHubSlugs } from "@/lib/data/country-hubs";
import { getCachedRecentCountryTravelers } from "@/lib/supabase/country-travelers-cache";
import { loadCountryVisitorState } from "@/lib/supabase/country-visitor-state";
import { getAuthUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { countryPath, countryUrl } from "@/lib/seo/site";
import { sanitizeCountrySlug } from "@/lib/utils/sanitize-country-slug";
import "../../city/city-page.css";

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

  const loginHref = `/login?next=${encodeURIComponent(countryPath(slug))}`;

  const [t, travelers, user, supabase] = await Promise.all([
    getTranslations("countryHub"),
    getCachedRecentCountryTravelers(hub.code),
    getAuthUser(),
    createClient(),
  ]);

  const visitorState = await loadCountryVisitorState(supabase, user?.id, hub);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${hub.name} on TravelerPin`,
    description: hub.visaNote,
    url: countryUrl(slug),
  };

  const labels = {
    home: t("home"),
    visited: t("visited"),
    wantToVisit: t("wantToVisit"),
    countryAdded: t("countryAdded"),
    countryRemoved: t("countryRemoved"),
    wishlistAdded: t("wishlistAdded"),
    wishlistRemoved: t("wishlistRemoved"),
    removePlacesFirst: t("removePlacesFirst"),
    capital: t("capital"),
    currency: t("currency"),
    plugType: t("plugType"),
    visa: t("visa"),
    language: t("language"),
    recentTravelers: t("recentTravelers"),
    noTravelersYet: t("noTravelersYet"),
    pinCountry: t("pinCountry"),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden">
        <CountryPageContent
          hub={hub}
          travelers={travelers}
          visitorState={visitorState}
          loginHref={loginHref}
          labels={labels}
        />
      </main>
    </>
  );
}
