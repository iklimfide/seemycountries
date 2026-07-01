import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CountryPageContent } from "@/components/country/CountryPageContent";
import { getCountryHubBySlug, listCountryHubSlugs } from "@/lib/data/country-hubs";
import { getCachedRecentCountryTravelers } from "@/lib/supabase/country-travelers-cache";
import { countCountryPinners } from "@/lib/supabase/country-pin-count";
import { loadCountryVisitorState } from "@/lib/supabase/country-visitor-state";
import { getAuthUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { countryPath, countryUrl, buildCountryPageTitle, DEFAULT_DESCRIPTION } from "@/lib/seo/site";
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

  const title = buildCountryPageTitle(hub.name);

  return {
    title,
    description: DEFAULT_DESCRIPTION,
    alternates: { canonical: countryPath(slug) },
    openGraph: {
      title,
      description: DEFAULT_DESCRIPTION,
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

  const returnPath = countryPath(slug);
  const loginHref = `/login?next=${encodeURIComponent(returnPath)}`;
  const registerHref = `/register?next=${encodeURIComponent(returnPath)}`;

  const [t, tCommon, travelers, user, supabase] = await Promise.all([
    getTranslations("countryHub"),
    getTranslations("common"),
    getCachedRecentCountryTravelers(hub.code),
    getAuthUser(),
    createClient(),
  ]);

  const visitorState = await loadCountryVisitorState(supabase, user?.id, hub);
  const pinCount = await countCountryPinners(supabase, hub.code);
  const pinCountLabel =
    pinCount > 0
      ? t("travelersPinned", { count: pinCount })
      : t("noTravelersPinned");

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
    like: t("like"),
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
    login: tCommon("login"),
    register: tCommon("register"),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden">
        <CountryPageContent
          hub={hub}
          travelers={travelers}
          visitorState={visitorState}
          loginHref={loginHref}
          registerHref={registerHref}
          pinCountLabel={pinCountLabel}
          labels={labels}
        />
      </main>
    </>
  );
}
