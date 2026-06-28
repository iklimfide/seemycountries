import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import countries from "world-atlas/countries-110m.json";
import countriesLib from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { BRAND } from "@/lib/constants";
import type { VisitedCity } from "@/types/database";

countriesLib.registerLocale(enLocale);

const MAP_WIDTH = 1200;
const MAP_HEIGHT = 420;
const MAX_PINS = 80;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildOgMapSvg(
  visitedCountryCodes: string[],
  cities: VisitedCity[],
  wishlistCountryCodes: string[] = []
): string {
  const topology = countries as unknown as Topology<{ countries: GeometryCollection }>;
  const countryFeatures = feature(topology, topology.objects.countries).features;
  const land = feature(topology, topology.objects.countries);
  const projection = geoNaturalEarth1().fitSize([MAP_WIDTH, MAP_HEIGHT], land);
  const pathGenerator = geoPath(projection);

  const visitedNumericIds = new Set(
    visitedCountryCodes
      .map((code) => countriesLib.alpha2ToNumeric(code))
      .filter(Boolean)
      .map((n) => String(n).padStart(3, "0"))
  );

  const wishlistNumericIds = new Set(
    wishlistCountryCodes
      .map((code) => countriesLib.alpha2ToNumeric(code))
      .filter(Boolean)
      .map((n) => String(n).padStart(3, "0"))
  );

  const countryPaths = countryFeatures
    .map((country, index) => {
      const id =
        country.id != null && country.id !== ""
          ? String(country.id)
          : `country-${index}`;
      const isVisited =
        country.id != null && visitedNumericIds.has(String(country.id));
      const isWishlist =
        !isVisited &&
        country.id != null &&
        wishlistNumericIds.has(String(country.id));
      const d = pathGenerator(country);
      if (!d) return "";

      const fill = isVisited
        ? BRAND.colors.visited
        : isWishlist
          ? BRAND.colors.wishlistFill
          : BRAND.colors.unvisited;
      const stroke = isWishlist ? BRAND.colors.wishlist : BRAND.colors.background;
      const strokeWidth = isWishlist ? "1.2" : "0.6";

      return `<path d="${escapeXml(d)}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
    })
    .join("");

  const pinCities = cities.slice(0, MAX_PINS);
  const pins = pinCities
    .map((city) => {
      const point = projection([city.longitude, city.latitude]);
      if (!point) return "";
      const [x, y] = point;
      return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="5" fill="${BRAND.colors.pin}" stroke="#ffffff" stroke-width="1.5"/>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MAP_WIDTH} ${MAP_HEIGHT}" width="${MAP_WIDTH}" height="${MAP_HEIGHT}">
  <rect width="${MAP_WIDTH}" height="${MAP_HEIGHT}" fill="${BRAND.colors.background}"/>
  <g>${countryPaths}</g>
  <g>${pins}</g>
</svg>`;
}

/** Edge-safe data URL for next/og ImageResponse. */
export function ogMapDataUrl(
  visitedCountryCodes: string[],
  cities: VisitedCity[],
  wishlistCountryCodes: string[] = []
): string {
  const svg = buildOgMapSvg(visitedCountryCodes, cities, wishlistCountryCodes);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
