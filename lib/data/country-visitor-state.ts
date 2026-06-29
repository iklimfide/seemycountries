export type CountryVisitorState = {
  isLoggedIn: boolean;
  visitedId: string | null;
  wishlistId: string | null;
  isOnMap: boolean;
  visitedViaPlacesOnly: boolean;
};

export const GUEST_COUNTRY_VISITOR_STATE: CountryVisitorState = {
  isLoggedIn: false,
  visitedId: null,
  wishlistId: null,
  isOnMap: false,
  visitedViaPlacesOnly: false,
};
