import type { VisitedPark } from "@/types/database";

export function buildVisitedParkList(parks: VisitedPark[]): VisitedPark[] {
  return [...parks].sort((a, b) => {
    const byCountry = a.country_name.localeCompare(b.country_name, undefined, {
      sensitivity: "base",
    });
    if (byCountry !== 0) return byCountry;
    return a.park_name.localeCompare(b.park_name, undefined, { sensitivity: "base" });
  });
}
