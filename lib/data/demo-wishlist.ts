import countriesLib from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import type { WishlistCountry } from "@/types/database";

countriesLib.registerLocale(enLocale);

const DEMO_WISHLIST_CODES = [
  "NO", "SE", "FI", "IS", "IE",
  "PE", "CU",
  "CN", "NP", "JO", "IL", "LK", "PH", "MY", "KH",
  "TN", "NA", "BW", "GH", "ET",
] as const;

function demoWishlistCountry(code: string): WishlistCountry {
  return {
    id: `demo-wish-${code.toLowerCase()}`,
    user_id: "demo",
    country_code: code,
    country_name: countriesLib.getName(code, "en") ?? code,
    created_at: "",
  };
}

export const DEMO_WISHLIST_COUNTRIES: WishlistCountry[] =
  DEMO_WISHLIST_CODES.map(demoWishlistCountry);

export const DEMO_WISHLIST_COUNTRY_CODES = DEMO_WISHLIST_CODES.map((code) =>
  code.toUpperCase()
);
