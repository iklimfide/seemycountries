import type { ParkType } from "@/types/database";
import { parkMessages } from "@/lib/i18n/client-messages";

export function isThemeParkType(type: ParkType): boolean {
  return type === "theme_park" || type === "botanical_garden";
}

export function matchesParkTypeFilter(parkType: ParkType, filter?: ParkType): boolean {
  if (filter == null) return true;
  if (filter === "theme_park") return isThemeParkType(parkType);
  return parkType === filter;
}

export function parkTypeLabel(type: ParkType): string {
  switch (type) {
    case "national_park":
      return parkMessages.nationalPark;
    case "theme_park":
    case "botanical_garden":
      return parkMessages.themePark;
  }
}
