import { findCityHubSlug } from "@/lib/data/city-hubs";
import { getCountryHubByCode } from "@/lib/data/country-hubs";
import type { ParkType } from "@/lib/data/tourist-park-search";
import { cityPath, countryPath, parkPath } from "@/lib/seo/site";
import { buildParkSlug } from "@/lib/utils/park-slug";

type LatestPinnedSource =
  | { kind: "country"; code: string; name: string }
  | { kind: "city"; countryCode: string; cityName: string; name: string }
  | {
      kind: "park";
      countryCode: string;
      parkName: string;
      parkType: ParkType;
      name: string;
    };

const DEMO_LATEST_PINNED_SOURCES: LatestPinnedSource[] = [
  { kind: "country", code: "FR", name: "France" },
  { kind: "country", code: "IT", name: "Italy" },
  { kind: "country", code: "JP", name: "Japan" },
];

export type DemoLatestPinned = {
  name: string;
  href: string;
  countryCode: string;
};

function resolveLatestPinnedHref(item: LatestPinnedSource): string | null {
  if (item.kind === "country") {
    const slug = getCountryHubByCode(item.code)?.slug;
    return slug ? countryPath(slug) : null;
  }

  if (item.kind === "city") {
    const slug = findCityHubSlug(item.countryCode, item.cityName);
    return slug ? cityPath(slug) : null;
  }

  return parkPath(buildParkSlug(item.parkName, item.countryCode));
}

export function getDemoLatestPinned(): DemoLatestPinned[] {
  return DEMO_LATEST_PINNED_SOURCES.flatMap((item) => {
    const href = resolveLatestPinnedHref(item);
    if (!href) return [];

    const countryCode = item.kind === "country" ? item.code : item.countryCode;
    return [{ name: item.name, href, countryCode }];
  });
}
