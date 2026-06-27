import { BRAND } from "@/lib/constants";

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return `https://${BRAND.domain}`;
}

export function profilePath(username: string): string {
  return `/u/${username.toLowerCase()}`;
}

export function profileUrl(username: string): string {
  return `${getSiteUrl()}${profilePath(username)}`;
}

export const DEFAULT_DESCRIPTION =
  "Mark the countries and cities you've visited. One photo and memory per city — share your travel map with one link.";

export const DEFAULT_KEYWORDS = [
  "travel map",
  "countries visited",
  "travel journal",
  "world map",
  "travel memories",
  "share travel",
];
