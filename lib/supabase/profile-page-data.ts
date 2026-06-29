import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  fetchPublicProfile,
  fetchPublicWishlistCountries,
  type PublicProfile,
} from "@/lib/supabase/public-profile";
import {
  computeTravelStats,
  getVisitedCountryCodes,
  getWishlistCountryCodes,
} from "@/lib/utils/stats";
import type {
  TravelStats,
  VisitedCity,
  VisitedCountry,
  VisitedPark,
  WishlistCountry,
} from "@/types/database";
import { getAuthUser } from "@/lib/supabase/auth";

export type PublicProfilePageData = {
  profile: PublicProfile;
  visitedCountries: VisitedCountry[];
  visitedCities: VisitedCity[];
  visitedParks: VisitedPark[];
  wishlistCountries: WishlistCountry[];
  stats: TravelStats;
  visitedCodes: string[];
  wishlistCodes: string[];
  isLoggedIn: boolean;
  currentUsername: string | null;
};

async function loadProfileRows(
  supabase: SupabaseClient,
  profile: PublicProfile
): Promise<
  Pick<
    PublicProfilePageData,
    "visitedCountries" | "visitedCities" | "visitedParks" | "wishlistCountries"
  >
> {
  const [{ data: countries }, { data: cities }, { data: parks }, wishlistCountries] =
    await Promise.all([
      supabase
        .from("visited_countries")
        .select("*")
        .eq("user_id", profile.id)
        .order("country_name", { ascending: true }),
      supabase
        .from("visited_cities")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("visited_parks")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false }),
      fetchPublicWishlistCountries(supabase, profile.id, profile.wishlist_public),
    ]);

  return {
    visitedCountries: (countries ?? []) as VisitedCountry[],
    visitedCities: (cities ?? []) as VisitedCity[],
    visitedParks: (parks ?? []) as VisitedPark[],
    wishlistCountries,
  };
}

/** Single cached loader for profile metadata + page (avoids duplicate Supabase round-trips). */
export const loadPublicProfilePage = cache(
  async (username: string): Promise<PublicProfilePageData | null> => {
    const supabase = await createClient();
    if (!supabase) return null;

    const profile = await fetchPublicProfile(supabase, username);
    if (!profile) return null;

    const [{ visitedCountries, visitedCities, visitedParks, wishlistCountries }, authUser] =
      await Promise.all([loadProfileRows(supabase, profile), getAuthUser()]);

    const stats = computeTravelStats(visitedCountries, visitedCities, visitedParks);
    const visitedCodes = getVisitedCountryCodes(
      visitedCountries,
      visitedCities,
      visitedParks
    );
    const wishlistCodes = profile.wishlist_public
      ? getWishlistCountryCodes(wishlistCountries)
      : [];

    let currentUsername: string | null = null;
    if (authUser) {
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", authUser.id)
        .maybeSingle();
      currentUsername = currentProfile?.username ?? null;
    }

    return {
      profile,
      visitedCountries,
      visitedCities,
      visitedParks,
      wishlistCountries,
      stats,
      visitedCodes,
      wishlistCodes,
      isLoggedIn: !!authUser,
      currentUsername,
    };
  }
);
