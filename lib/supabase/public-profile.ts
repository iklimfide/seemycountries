import type { SupabaseClient } from "@supabase/supabase-js";
import type { WishlistCountry } from "@/types/database";

export type PublicProfile = {
  id: string;
  username: string;
  display_name: string | null;
  wishlist_public: boolean;
};

/** Load profile for public pages; tolerates missing wishlist migration. */
export async function fetchPublicProfile(
  supabase: SupabaseClient,
  username: string
): Promise<PublicProfile | null> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("username", username.toLowerCase())
    .single();

  if (error || !profile) return null;

  let wishlistPublic = false;
  const { data: settings } = await supabase
    .from("profiles")
    .select("wishlist_public")
    .eq("id", profile.id)
    .maybeSingle();

  if (settings?.wishlist_public === true) {
    wishlistPublic = true;
  }

  return {
    ...profile,
    wishlist_public: wishlistPublic,
  };
}

export async function fetchPublicWishlistCountries(
  supabase: SupabaseClient,
  userId: string,
  wishlistPublic: boolean
): Promise<WishlistCountry[]> {
  if (!wishlistPublic) return [];

  const { data, error } = await supabase
    .from("wishlist_countries")
    .select("*")
    .eq("user_id", userId)
    .order("country_name", { ascending: true });

  if (error) return [];
  return (data ?? []) as WishlistCountry[];
}
