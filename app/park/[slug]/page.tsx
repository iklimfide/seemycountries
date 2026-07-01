import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ParkPageContent } from "@/components/park/ParkPageContent";
import { getCountryHubByCode } from "@/lib/data/country-hubs";
import { getParkHubBySlug, listParkHubSlugs } from "@/lib/data/park-hubs";
import { buildParkPageTitle, DEFAULT_DESCRIPTION, getSiteUrl, parkPath, parkUrl } from "@/lib/seo/site";
import { getDefaultParkHeroAlt, getDefaultParkHeroImage } from "@/lib/utils/park-hero-image";
import { getCachedRecentParkTravelers } from "@/lib/supabase/park-travelers-cache";
import { countParkPinners, loadParkVisitorState } from "@/lib/supabase/park-visitor-state";
import { getAuthUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { sanitizeParkSlug } from "@/lib/utils/park-slug";
import "../../city/city-page.css";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateStaticParams() {
  return listParkHubSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = sanitizeParkSlug(rawSlug);
  if (!slug) return { title: "Park" };

  const hub = getParkHubBySlug(slug);
  if (!hub) return { title: "Park not found" };

  const title = buildParkPageTitle(hub.name);
  const ogImage = `${getSiteUrl()}${getDefaultParkHeroImage(hub.parkType)}`;

  return {
    title,
    description: DEFAULT_DESCRIPTION,
    alternates: { canonical: parkPath(slug) },
    openGraph: {
      title,
      description: DEFAULT_DESCRIPTION,
      url: parkUrl(slug),
      images: [{ url: ogImage, alt: getDefaultParkHeroAlt(hub.parkType) }],
    },
  };
}

export default async function ParkHubPage({ params }: PageProps) {
  const { slug: rawSlug } = await params;
  const slug = sanitizeParkSlug(rawSlug);
  if (!slug) notFound();

  const hub = getParkHubBySlug(slug);
  if (!hub) notFound();

  const countryHub = getCountryHubByCode(hub.countryCode);
  const returnPath = parkPath(slug);
  const loginHref = `/login?next=${encodeURIComponent(returnPath)}`;
  const registerHref = `/register?next=${encodeURIComponent(returnPath)}`;

  const [t, tCountry, tCommon, travelers, user, supabase] = await Promise.all([
    getTranslations("parkHub"),
    getTranslations("countryHub"),
    getTranslations("common"),
    getCachedRecentParkTravelers(hub),
    getAuthUser(),
    createClient(),
  ]);

  const visitorState = await loadParkVisitorState(supabase, user?.id, hub);
  const pinCount = await countParkPinners(supabase, hub);
  const pinCountLabel =
    pinCount > 0
      ? t("travelersPinned", { count: pinCount })
      : t("noTravelersPinned");

  const labels = {
    home: t("home"),
    visited: t("visited"),
    wantToVisit: t("wantToVisit"),
    like: t("like"),
    country: t("country"),
    parkType: t("parkType"),
    currency: tCountry("currency"),
    plugType: tCountry("plugType"),
    parkAdded: t("parkAdded"),
    parkRemoved: t("parkRemoved"),
    wishlistAdded: t("wishlistAdded"),
    wishlistRemoved: t("wishlistRemoved"),
    recentTravelers: t("recentTravelers", { park: hub.name }),
    noTravelersYet: t("noTravelersYet", { park: hub.name }),
    pinPark: t("pinPark", { park: hub.name }),
    login: tCommon("login"),
    register: tCommon("register"),
  };

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden">
      <ParkPageContent
        hub={hub}
        countryHub={countryHub}
        travelers={travelers}
        visitorState={visitorState}
        loginHref={loginHref}
        registerHref={registerHref}
        pinCountLabel={pinCountLabel}
        labels={labels}
      />
    </main>
  );
}
