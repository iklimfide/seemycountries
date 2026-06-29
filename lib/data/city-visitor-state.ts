export type CityVisitorState = {
  isLoggedIn: boolean;
  cityId: string | null;
  countryWishlistId: string | null;
  countryVisited: boolean;
};

export const GUEST_VISITOR_STATE: CityVisitorState = {
  isLoggedIn: false,
  cityId: null,
  countryWishlistId: null,
  countryVisited: false,
};
