export const BRAND = {
  name: "SeeMyCountries",
  domain: "seemycountries.com",
  colors: {
    primary: "#2563eb",
    visited: "#2563eb",
    unvisited: "#334155",
    wishlist: "#f59e0b",
    wishlistFill: "rgba(245, 158, 11, 0.18)",
    pin: "#60a5fa",
    background: "#0f172a",
    surface: "#1e293b",
  },
} as const;

export const LIMITS = {
  noteMaxLength: 1000,
  imageMaxWidth: 1080,
  usernameMin: 3,
  usernameMax: 30,
  minCityPopulation: 100_000,
} as const;
