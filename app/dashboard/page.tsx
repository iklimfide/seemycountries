import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { PublicProfileView } from "@/components/profile/PublicProfileView";
import { ParkList } from "@/components/dashboard/ParkList";
import { CityList } from "@/components/dashboard/CityList";
import { CountryManager } from "@/components/dashboard/CountryManager";
import { createClient } from "@/lib/supabase/server";
import { buildProfileDescription } from "@/lib/seo/profile";
import { resolveProfileDisplayName } from "@/lib/utils/display-name";
import type { PublicProfilePageData } from "@/lib/supabase/profile-page-data";
import type { PublicProfile } from "@/lib/supabase/public-profile";
import {
  computeTravelStats,
  getVisitedCountryCodes,
  getWishlistCountryCodes,
} from "@/lib/utils/stats";
import type { VisitedCity, VisitedCountry, VisitedPark, WishlistCountry } from "@/types/database";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const PROFILE_SELECT =
  "id, username, display_name, avatar_url, bio, residence, profession, marital_status, wishlist_public";

export default async function DashboardPage() {
  const supabase = await createClient();
  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    { data: profileRow },
    { data: countries, error: countriesError },
    { data: cities, error: citiesError },
    { data: parks, error: parksError },
    { data: wishlist, error: wishlistError },
  ] = await Promise.all([
    supabase.from("profiles").select(PROFILE_SELECT).eq("id", user.id).single(),
    supabase
      .from("visited_countries")
      .select("*")
      .eq("user_id", user.id)
      .order("country_name", { ascending: true }),
    supabase
      .from("visited_cities")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("visited_parks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("wishlist_countries")
      .select("*")
      .eq("user_id", user.id)
      .order("country_name", { ascending: true }),
  ]);

  if (!profileRow?.username) {
    redirect("/dashboard/settings");
  }

  const profile: PublicProfile = {
    id: profileRow.id,
    username: profileRow.username,
    display_name: profileRow.display_name ?? null,
    avatar_url: profileRow.avatar_url ?? null,
    bio: profileRow.bio ?? null,
    residence: profileRow.residence ?? null,
    profession: profileRow.profession ?? null,
    marital_status: profileRow.marital_status ?? null,
    wishlist_public: profileRow.wishlist_public === true,
  };

  const visitedCountries = (countriesError ? [] : (countries ?? [])) as VisitedCountry[];
  const visitedCities = (citiesError ? [] : (cities ?? [])) as VisitedCity[];
  const visitedParks = (parksError ? [] : (parks ?? [])) as VisitedPark[];
  const wishlistCountries = (wishlistError ? [] : (wishlist ?? [])) as WishlistCountry[];
  const stats = computeTravelStats(visitedCountries, visitedCities, visitedParks);
  const visitedCodes = getVisitedCountryCodes(visitedCountries, visitedCities, visitedParks);
  const wishlistCodes = getWishlistCountryCodes(wishlistCountries);
  const displayName = resolveProfileDisplayName(profile.display_name, profile.username);
  const profileDescription = buildProfileDescription(displayName, stats);

  const data: PublicProfilePageData = {
    profile,
    visitedCountries,
    visitedCities,
    visitedParks,
    wishlistCountries,
    stats,
    visitedCodes,
    wishlistCodes,
    isLoggedIn: true,
    currentUsername: profile.username,
  };

  return (
    <>
      <Header isLoggedIn />
      <PublicProfileView
        data={data}
        profileDescription={profileDescription}
        isOwnProfile
        isGuest={false}
        dashboardTools={
          <>
            <div id="dashboard-add" className="profile-dashboard-add-anchor">
              <CountryManager
              visitedCountries={visitedCountries}
              wishlistCountries={wishlistCountries}
              visitedCountryCodes={visitedCodes}
              visitedCities={visitedCities}
              visitedParks={visitedParks}
            />
            </div>
            <CityList cities={visitedCities} countries={visitedCountries} />
            <ParkList parks={visitedParks} countries={visitedCountries} />
          </>
        }
      />
    </>
  );
}
