import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TravelMapFocusShell } from "@/components/map/TravelMapFocusShell";
import { HomeBestDestinations } from "@/components/home/HomeBestDestinations";
import { HomeExplainer } from "@/components/home/HomeExplainer";
import { HomeFeatures } from "@/components/home/HomeFeatures";
import { HomeFinalCta } from "@/components/home/HomeFinalCta";
import { HomeHero } from "@/components/home/HomeHero";
import { PublicProfileView } from "@/components/profile/PublicProfileView";
import { BRAND } from "@/lib/constants";
import { DEMO_PERSONA } from "@/lib/data/demo-persona";
import { loadDemoPublicProfilePage } from "@/lib/data/jennifer-demo-page";
import { buildProfileDescription } from "@/lib/seo/profile";
import { getSiteUrl } from "@/lib/seo/site";
import { resolveProfileDisplayName } from "@/lib/utils/display-name";

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
  const data = await loadDemoPublicProfilePage(DEMO_PERSONA.username);
  if (!data) notFound();

  const displayName = resolveProfileDisplayName(data.profile.display_name, data.profile.username);
  const profileDescription = buildProfileDescription(displayName, data.stats);
  const isOwnProfile = data.currentUsername === data.profile.username;

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-[46px] pb-[72px] max-sm:px-3.5 max-sm:py-8 max-sm:pb-[54px] lg:max-w-[1400px] lg:px-10 xl:max-w-[1520px] xl:px-12">
      <TravelMapFocusShell>
        <div className="flex flex-col gap-7 sm:gap-9">
          <section className="grid items-start gap-[34px] lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 xl:gap-12">
            <HomeHero />
            <PublicProfileView
              data={data}
              profileDescription={profileDescription}
              isOwnProfile={isOwnProfile}
              isGuest={!data.isLoggedIn}
              embedded
            />
          </section>

          <HomeExplainer
            name={DEMO_PERSONA.name}
            countries={data.stats.countries}
            cities={data.stats.cities}
          />
          <HomeFeatures />
          <HomeFinalCta />
          <HomeBestDestinations />
        </div>
      </TravelMapFocusShell>
    </main>
  );
}
