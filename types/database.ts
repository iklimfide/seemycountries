export type MediaType = "photo" | "instagram";

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  residence: string | null;
  profession: string | null;
  marital_status: string | null;
  wishlist_public: boolean;
  created_at: string;
}

export interface VisitedCountry {
  id: string;
  user_id: string;
  country_code: string;
  country_name: string;
  created_at: string;
}

export interface WishlistCountry {
  id: string;
  user_id: string;
  country_code: string;
  country_name: string;
  created_at: string;
}

export interface VisitedCity {
  id: string;
  user_id: string;
  city_name: string;
  country_code: string;
  country_name: string;
  latitude: number;
  longitude: number;
  note: string | null;
  media_type: MediaType | null;
  media_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TravelStats {
  countries: number;
  cities: number;
}
