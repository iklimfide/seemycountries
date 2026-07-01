import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CityPageContent } from "@/components/city/CityPageContent";
import { getCityHubContext } from "@/lib/data/city-hubs";
import { listCityHubSlugs } from "@/lib/data/city-hubs";
import { loadCityVisitorState } from "@/lib/supabase/city-visitor-state";
import { cityPinsWithContent, countCityPinners, uniqueCityTravelers } from "@/lib/supabase/city-travelers";
import { getCachedRecentCityPinsWithPreviews } from "@/lib/supabase/city-travelers-cache";
import { getAuthUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { cityPath, cityUrl, buildCityPageTitle, DEFAULT_DESCRIPTION, getSiteUrl } from "@/lib/seo/site";
import { DEFAULT_CITY_HERO_ALT, DEFAULT_CITY_HERO_IMAGE } from "@/lib/constants";
import { sanitizeCitySlug } from "@/lib/utils/sanitize-city-slug";
import "../city-page.css";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateStaticParams() {
  return listCityHubSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = sanitizeCitySlug(rawSlug);
  if (!slug) return { title: "City" };

  const context = getCityHubContext(slug);
  if (!context) return { title: "City not found" };

  const { hub } = context;
  const title = buildCityPageTitle(hub.name);
  const ogImage = `${getSiteUrl()}${DEFAULT_CITY_HERO_IMAGE}`;

  return {
    title,
    description: DEFAULT_DESCRIPTION,
    alternates: { canonical: cityPath(slug) },
    openGraph: {
      title,
      description: DEFAULT_DESCRIPTION,
      url: cityUrl(slug),
      images: [{ url: ogImage, alt: hub.heroImageAlt ?? DEFAULT_CITY_HERO_ALT }],
    },
  };
}

export default async function CityHubPage({ params }: PageProps) {
  const { slug: rawSlug } = await params;
  const slug = sanitizeCitySlug(rawSlug);
  if (!slug) notFound();

  const context = getCityHubContext(slug);
  if (!context) notFound();

  const { hub, touristCity, countryHub, parks } = context;
  const returnPath = cityPath(slug);
  const loginHref = `/login?next=${encodeURIComponent(returnPath)}`;
  const registerHref = `/register?next=${encodeURIComponent(returnPath)}`;

  const [t, tCommon, cityPins, user, supabase] = await Promise.all([
    getTranslations("cityHub"),
    getTranslations("common"),
    getCachedRecentCityPinsWithPreviews(hub),
    getAuthUser(),
    createClient(),
  ]);

  const memoryPins = cityPinsWithContent(cityPins);
  const travelers = uniqueCityTravelers(cityPins);

  const visitorState = await loadCityVisitorState(supabase, user?.id, hub);
  const pinCount = await countCityPinners(supabase, hub);
  const pinCountLabel =
    pinCount > 0
      ? t("travelersPinned", { count: pinCount })
      : t("noTravelersPinned");

  const labels = {
    home: t("home"),
    visited: t("visited"),
    wantToVisit: t("wantToVisit"),
    like: t("like"),
    cityAdded: t("cityAdded"),
    cityRemoved: t("cityRemoved"),
    wishlistAdded: t("wishlistAdded"),
    wishlistRemoved: t("wishlistRemoved"),
    alreadyOnMap: t("alreadyOnMap"),
    country: t("country"),
    currency: t("currency"),
    plugType: t("plugType"),
    visa: t("visa"),
    language: t("language"),
    parksInCity: t("parksInCity", { city: hub.name }),
    travelerMemories: t("travelerMemories", { city: hub.name }),
    viewTravelMap: t("viewTravelMap"),
    viewPin: t("viewPin"),
    close: t("closePin"),
    instagramPost: t("instagramPost"),
    recentTravelers: t("recentTravelers", { city: hub.name }),
    noTravelersYet: t("noTravelersYet", { city: hub.name }),
    pinCity: t("pinCity", { city: hub.name }),
    login: tCommon("login"),
    register: tCommon("register"),
  };

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden">
        <CityPageContent
          hub={hub}
          touristCity={touristCity}
          countryHub={countryHub}
          parks={parks}
          travelers={travelers}
          memoryPins={memoryPins}
          visitorState={visitorState}
          loginHref={loginHref}
          registerHref={registerHref}
          pinCountLabel={pinCountLabel}
          labels={labels}
        />
      </main>
  );
}
