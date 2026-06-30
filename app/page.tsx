import type { Metadata } from "next";
import { TravelMapFocusShell } from "@/components/map/TravelMapFocusShell";
import { HomeBestDestinations } from "@/components/home/HomeBestDestinations";
import { HomeExplainer } from "@/components/home/HomeExplainer";
import { HomeFeatures } from "@/components/home/HomeFeatures";
import { HomeFinalCta } from "@/components/home/HomeFinalCta";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeSampleCardHeader } from "@/components/home/HomeSampleCardHeader";
import { TravelMapView } from "@/components/map/TravelMapView";
import { BRAND } from "@/lib/constants";
import { DEMO_CITIES } from "@/lib/data/demo-cities";
import { DEMO_VISITED_COUNTRIES } from "@/lib/data/demo-countries";
import { DEMO_WISHLIST_COUNTRIES } from "@/lib/data/demo-wishlist";
import { DEMO_PERSONA, getDemoTravelStats } from "@/lib/data/demo-persona";
import { getSiteUrl } from "@/lib/seo/site";
import { getVisitedCountryCodes, getWishlistCountryCodes } from "@/lib/utils/stats";

export async function generateMetadata(): Promise<Metadata> {
  const ogTitle = `${BRAND.name} — Your Travel Map`;
  const ogDescription =
    "Mark the countries you've visited, pin your favorite cities, save memories, and build a wishlist for future trips — all in one beautiful travel profile.";

  return {
    title: ogTitle,
    description: ogDescription,
    alternates: { canonical: "/" },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: getSiteUrl(),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
    },
  };
}

export default async function HomePage() {
  const stats = getDemoTravelStats();
  const countryCodes = getVisitedCountryCodes(DEMO_VISITED_COUNTRIES, [], []);
  const wishlistCodes = getWishlistCountryCodes(DEMO_WISHLIST_COUNTRIES);

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-[46px] pb-[72px] max-sm:px-3.5 max-sm:py-8 max-sm:pb-[54px] lg:max-w-[1400px] lg:px-10 xl:max-w-[1520px] xl:px-12">
      <TravelMapFocusShell>
        <div className="flex flex-col gap-7 sm:gap-9">
          <section className="grid items-center gap-[34px] lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 xl:gap-12">
            <HomeHero />
            <TravelMapView
              visitedCountryCodes={countryCodes}
              wishlistCountryCodes={wishlistCodes}
              visitedCountries={DEMO_VISITED_COUNTRIES}
              wishlistCountries={DEMO_WISHLIST_COUNTRIES}
              userCities={DEMO_CITIES}
              isLoggedIn={false}
              explorable
              showContinentFilter
              homeLayout
              profileHeader={
                <HomeSampleCardHeader
                  name={DEMO_PERSONA.name}
                  username={DEMO_PERSONA.username}
                  avatarUrl={DEMO_PERSONA.avatarUrl}
                  stats={stats}
                  isDemo
                />
              }
            />
          </section>

          <HomeExplainer
            name={DEMO_PERSONA.name}
            countries={stats.countries}
            cities={stats.cities}
          />
          <HomeFeatures />
          <HomeFinalCta />
          <HomeBestDestinations />
        </div>
      </TravelMapFocusShell>
    </main>
  );
}
