"use client";

import { useMemo, useState, useCallback } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import countries from "world-atlas/countries-110m.json";
import countriesLib from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { BRAND } from "@/lib/constants";
import type { VisitedCity } from "@/types/database";

countriesLib.registerLocale(enLocale);

type WorldMapProps = {
  cities: VisitedCity[];
  visitedCountryCodes: string[];
  wishlistCountryCodes?: string[];
  onCityClick?: (city: VisitedCity) => void;
  interactive?: boolean;
};

const WIDTH = 800;
const HEIGHT = 450;

export function WorldMap({
  cities,
  visitedCountryCodes,
  wishlistCountryCodes = [],
  onCityClick,
  interactive = true,
}: WorldMapProps) {
  const [hoveredCityId, setHoveredCityId] = useState<string | null>(null);

  const countryFeatures = useMemo(() => {
    const topology = countries as unknown as Topology<{ countries: GeometryCollection }>;
    return feature(topology, topology.objects.countries).features;
  }, []);

  const projection = useMemo(() => {
    const topology = countries as unknown as Topology<{ countries: GeometryCollection }>;
    const land = feature(topology, topology.objects.countries);
    return geoNaturalEarth1().fitSize([WIDTH, HEIGHT], land);
  }, []);

  const pathGenerator = useMemo(() => geoPath(projection), [projection]);

  const visitedNumericIds = useMemo(() => {
    return new Set(
      visitedCountryCodes
        .map((code) => countriesLib.alpha2ToNumeric(code))
        .filter(Boolean)
        .map((n) => String(n).padStart(3, "0"))
    );
  }, [visitedCountryCodes]);

  const wishlistNumericIds = useMemo(() => {
    return new Set(
      wishlistCountryCodes
        .map((code) => countriesLib.alpha2ToNumeric(code))
        .filter(Boolean)
        .map((n) => String(n).padStart(3, "0"))
    );
  }, [wishlistCountryCodes]);

  const projectPoint = useCallback(
    (lng: number, lat: number): [number, number] | null => {
      const point = projection([lng, lat]);
      return point ? [point[0], point[1]] : null;
    },
    [projection]
  );

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="World travel map"
      >
        <rect width={WIDTH} height={HEIGHT} fill={BRAND.colors.background} />

        <g>
          {countryFeatures.map((country, index) => {
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
            if (!d) return null;

            return (
              <path
                key={id}
                d={d}
                fill={
                  isVisited
                    ? BRAND.colors.visited
                    : isWishlist
                      ? BRAND.colors.wishlistFill
                      : BRAND.colors.unvisited
                }
                stroke={
                  isWishlist ? BRAND.colors.wishlist : BRAND.colors.background
                }
                strokeWidth={isWishlist ? 1.5 : 0.5}
                className="transition-colors duration-300"
              />
            );
          })}
        </g>

        {cities.map((city) => {
          const coords = projectPoint(city.longitude, city.latitude);
          if (!coords) return null;

          const [x, y] = coords;
          const isHovered = hoveredCityId === city.id;

          return (
            <g
              key={city.id}
              className={interactive ? "cursor-pointer" : ""}
              onClick={() => interactive && onCityClick?.(city)}
              onMouseEnter={() => setHoveredCityId(city.id)}
              onMouseLeave={() => setHoveredCityId(null)}
            >
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 6 : 4}
                fill={BRAND.colors.pin}
                stroke="#fff"
                strokeWidth={1.5}
                className="transition-all duration-150"
              />
              {isHovered && (
                <g>
                  <rect
                    x={x + 8}
                    y={y - 22}
                    width={Math.max(80, `${city.city_name}, ${city.country_name}`.length * 6.5)}
                    height={20}
                    rx={4}
                    fill="rgba(15, 23, 42, 0.92)"
                    stroke="rgba(148, 163, 184, 0.3)"
                  />
                  <text
                    x={x + 14}
                    y={y - 8}
                    fill="#f1f5f9"
                    fontSize={11}
                    fontFamily="system-ui, sans-serif"
                  >
                    {city.city_name}, {city.country_name}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
