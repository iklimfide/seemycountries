export type ParkVisitorState = {
  isLoggedIn: boolean;
  parkId: string | null;
  countryWishlistId: string | null;
  countryVisited: boolean;
};

export const GUEST_PARK_VISITOR_STATE: ParkVisitorState = {
  isLoggedIn: false,
  parkId: null,
  countryWishlistId: null,
  countryVisited: false,
};
