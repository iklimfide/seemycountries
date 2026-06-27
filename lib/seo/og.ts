import { getSiteUrl } from "@/lib/seo/site";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

export function profileOgImagePath(username: string): string {
  return `/og/u/${username.toLowerCase()}`;
}

export function profileOgImageUrl(username: string): string {
  return `${getSiteUrl()}${profileOgImagePath(username)}`;
}

export function profileOgImageAlt(displayName: string): string {
  return `${displayName}'s travel map on SeeMyCountries`;
}
