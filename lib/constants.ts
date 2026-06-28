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
  bioMaxLength: 500,
  displayNameMaxLength: 50,
  residenceMaxLength: 100,
  imageMaxWidth: 1080,
  avatarSize: 400,
  avatarMaxBytes: 5 * 1024 * 1024,
  usernameMin: 3,
  usernameMax: 30,
  minCityPopulation: 100_000,
} as const;
