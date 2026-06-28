/** Showcase persona for the public homepage demo map. */
export const DEMO_PERSONA = {
  name: "Jennifer",
  visitedCountries: 35,
  visitedCities: 124,
  wishlistCountries: 20,
} as const;

export function getDemoTravelStats() {
  return {
    countries: DEMO_PERSONA.visitedCountries,
    cities: DEMO_PERSONA.visitedCities,
  };
}
