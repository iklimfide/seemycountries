import { DEMO_CITIES } from "@/lib/data/demo-cities";
import { DEMO_VISITED_COUNTRIES } from "@/lib/data/demo-countries";
import { DEMO_PERSONA, getDemoTravelStats } from "@/lib/data/demo-persona";
import { DEMO_WISHLIST_COUNTRIES } from "@/lib/data/demo-wishlist";
import {
  getVisitedCountryCodes,
  getWishlistCountryCodes,
} from "@/lib/utils/stats";
import type { Profile, VisitedCity, VisitedCountry, VisitedPark, WishlistCountry } from "@/types/database";

export type JenniferDemoPageData = {
  profile: Profile;
  visitedCountries: VisitedCountry[];
  visitedCities: VisitedCity[];
  visitedParks: VisitedPark[];
  wishlistCountries: WishlistCountry[];
  stats: ReturnType<typeof getDemoTravelStats>;
  visitedCodes: string[];
  wishlistCodes: string[];
};

export function loadJenniferDemoPage(): JenniferDemoPageData {
  const visitedCountries = DEMO_VISITED_COUNTRIES;
  const visitedCities = DEMO_CITIES;
  const visitedParks: VisitedPark[] = [];
  const wishlistCountries = DEMO_WISHLIST_COUNTRIES;
  const stats = getDemoTravelStats();

  return {
    profile: {
      id: "demo-jennifer",
      username: DEMO_PERSONA.username,
      display_name: DEMO_PERSONA.name,
      avatar_url: DEMO_PERSONA.avatarUrl,
      bio: DEMO_PERSONA.bio,
      residence: null,
      profession: null,
      marital_status: null,
      wishlist_public: true,
      created_at: "",
    },
    visitedCountries,
    visitedCities,
    visitedParks,
    wishlistCountries,
    stats,
    visitedCodes: getVisitedCountryCodes(visitedCountries, visitedCities, visitedParks),
    wishlistCodes: getWishlistCountryCodes(wishlistCountries),
  };
}
