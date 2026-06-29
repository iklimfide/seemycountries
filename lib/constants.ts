export const BRAND = {
  name: "TravelerPin",
  domain: "travelerpin.com",
  colors: {
    primary: "#2563eb",
    visited: "#2563eb",
    unvisited: "#334155",
    wishlist: "#d97706",
    wishlistFill: "#f59e0b",
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
  passwordMin: 6,
  minCityPopulation: 100_000,
} as const;
