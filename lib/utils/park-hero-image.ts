import {
  DEFAULT_NATIONAL_PARK_HERO_ALT,
  DEFAULT_NATIONAL_PARK_HERO_IMAGE,
  DEFAULT_THEME_PARK_HERO_ALT,
  DEFAULT_THEME_PARK_HERO_IMAGE,
} from "@/lib/constants";
import { isThemeParkType } from "@/lib/utils/park-type";
import type { ParkType } from "@/lib/data/tourist-park-search";

export function getDefaultParkHeroImage(parkType: ParkType): string {
  return isThemeParkType(parkType) ? DEFAULT_THEME_PARK_HERO_IMAGE : DEFAULT_NATIONAL_PARK_HERO_IMAGE;
}

export function getDefaultParkHeroAlt(parkType: ParkType): string {
  return isThemeParkType(parkType) ? DEFAULT_THEME_PARK_HERO_ALT : DEFAULT_NATIONAL_PARK_HERO_ALT;
}
