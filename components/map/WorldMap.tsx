"use client";

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { geoCentroid, geoNaturalEarth1, geoPath } from "d3-geo";
import { select } from "d3-selection";
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from "d3-zoom";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, Geometry, FeatureCollection } from "geojson";
import countries from "world-atlas/countries-110m.json";
import supplementalCountries from "@/lib/data/map/supplemental-countries.json";
import countriesLib from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { BRAND } from "@/lib/constants";
import {
  countryMetaFromFeature,
  countryCodesToNumericIds,
  normalizeCountryNumericId,
} from "@/lib/map/country";
import { type ContinentId } from "@/lib/map/continents";
import { filterVisibleForContinent, selectFitFeatures } from "@/lib/map/continent-fit";
import { clipCountryToMainland } from "@/lib/map/mainland";
import { clampTransform, transformForFeature, transformToString } from "@/lib/map/zoom";
import { isTinyCountryOnMap } from "@/lib/map/micro-states";
import { MapCountryPin } from "@/components/map/MapCountryPin";
import { MapCountryLabel } from "@/components/map/MapCountryLabel";
import {
  MapMicroStateMarker,
  microStateMarkerColors,
} from "@/components/map/MapMicroStateMarker";

countriesLib.registerLocale(enLocale);

type WorldMapProps = {
  visitedCountryCodes: string[];
  wishlistCountryCodes?: string[];
  onCountryClick?: (country: { code: string; name: string }) => void;
  interactive?: boolean;
  explorable?: boolean;
  continent?: ContinentId;
  focusCountryCode?: string | null;
  onFocusCountryDone?: () => void;
  pinnedCountryCode?: string | null;
};

const WIDTH = 800;
const HEIGHT = 450;
const MAP_PADDING = 16;

function buildProjection(
  continent: ContinentId,
  worldLand: FeatureCollection,
  fitLand: FeatureCollection
) {
  const projection = geoNaturalEarth1();
  const extent: [[number, number], [number, number]] = [
    [MAP_PADDING, MAP_PADDING],
    [WIDTH - MAP_PADDING, HEIGHT - MAP_PADDING],
  ];

  const target =
    continent === "world" || fitLand.features.length === 0 ? worldLand : fitLand;

  return projection.fitExtent(extent, target);
}

export function WorldMap({
  visitedCountryCodes,
  wishlistCountryCodes = [],
  onCountryClick,
  interactive = true,
  explorable = false,
  continent = "world",
  focusCountryCode = null,
  onFocusCountryDone,
  pinnedCountryCode = null,
}: WorldMapProps) {
  const [mapReady, setMapReady] = useState(false);
  const [hoveredCountryId, setHoveredCountryId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const mapGroupRef = useRef<SVGGElement>(null);
  const zoomBehaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    setMapReady(true);
  }, []);

  const countryFeatures = useMemo(() => {
    const topology = countries as unknown as Topology<{ countries: GeometryCollection }>;
    const base = feature(topology, topology.objects.countries).features;
    const baseIds = new Set(
      base
        .filter((row) => row.id != null && row.id !== "")
        .map((row) => normalizeCountryNumericId(row.id!))
    );

    const extras = (supplementalCountries.features as Feature<Geometry>[]).filter((row) => {
      if (row.id == null || row.id === "") return false;
      return !baseIds.has(normalizeCountryNumericId(row.id));
    });

    return [...base, ...extras];
  }, []);

  const mainlandFeatures = useMemo(() => {
    const clipped: Feature<Geometry>[] = [];

    for (const country of countryFeatures) {
      const meta = countryMetaFromFeature(country);
      if (!meta) {
        clipped.push(country);
        continue;
      }

      const mainland = clipCountryToMainland(country, meta.code);
      if (mainland) clipped.push(mainland);
    }

    return clipped;
  }, [countryFeatures]);

  const worldLand = useMemo((): FeatureCollection => {
    return { type: "FeatureCollection", features: mainlandFeatures };
  }, [mainlandFeatures]);

  const visibleFeatures = useMemo(() => {
    return filterVisibleForContinent(continent, mainlandFeatures);
  }, [continent, mainlandFeatures]);

  const fitFeatures = useMemo(() => {
    return selectFitFeatures(continent, visibleFeatures);
  }, [continent, visibleFeatures]);

  const fitLand = useMemo((): FeatureCollection => {
    return { type: "FeatureCollection", features: fitFeatures };
  }, [fitFeatures]);

  const projection = useMemo(
    () => buildProjection(continent, worldLand, fitLand),
    [continent, worldLand, fitLand]
  );

  const pathGenerator = useMemo(() => geoPath(projection), [projection]);

  const countryById = useMemo(() => {
    const map = new Map<string, Feature<Geometry>>();
    visibleFeatures.forEach((country, index) => {
      const id =
        country.id != null && country.id !== ""
          ? String(country.id)
          : `country-${index}`;
      map.set(id, country);
    });
    return map;
  }, [visibleFeatures]);

  const visitedNumericIds = useMemo(
    () => countryCodesToNumericIds(visitedCountryCodes),
    [visitedCountryCodes]
  );

  const wishlistNumericIds = useMemo(
    () => countryCodesToNumericIds(wishlistCountryCodes),
    [wishlistCountryCodes]
  );

  const visitedPinPositions = useMemo(() => {
    const positions: { id: string; x: number; y: number }[] = [];

    visibleFeatures.forEach((country, index) => {
      if (country.id == null || country.id === "") return;
      const numericId = normalizeCountryNumericId(country.id);
      if (!visitedNumericIds.has(numericId)) return;
      if (isTinyCountryOnMap(pathGenerator, country)) return;

      const [lng, lat] = geoCentroid(country);
      const point = projection([lng, lat]);
      if (!point) return;

      const id =
        country.id != null && country.id !== ""
          ? String(country.id)
          : `country-${index}`;

      positions.push({ id, x: point[0], y: point[1] });
    });

    return positions;
  }, [visibleFeatures, projection, pathGenerator, visitedNumericIds]);

  const applyTransform = useCallback((next: ZoomTransform, animate = false) => {
    if (!svgRef.current || !mapGroupRef.current || !zoomBehaviorRef.current) return;

    const clamped = clampTransform(next, WIDTH, HEIGHT);
    const svg = select(svgRef.current);
    const mapGroup = select(mapGroupRef.current);

    if (animate) {
      svg.call(zoomBehaviorRef.current.transform, clamped);
    } else {
      mapGroup.attr("transform", transformToString(clamped));
      svg.property("__zoom", clamped);
    }
  }, []);

  const resetZoom = useCallback(() => {
    if (!mapGroupRef.current) return;

    if (svgRef.current && zoomBehaviorRef.current) {
      select(svgRef.current).call(zoomBehaviorRef.current.transform, zoomIdentity);
      return;
    }

    select(mapGroupRef.current).attr("transform", transformToString(zoomIdentity));
  }, []);

  useEffect(() => {
    resetZoom();
  }, [continent, projection, resetZoom]);

  useEffect(() => {
    if (!explorable || !svgRef.current || !mapGroupRef.current) return;

    const svg = select(svgRef.current);
    const mapGroup = select(mapGroupRef.current);

    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .filter((event) => {
        if (event.type === "wheel") return true;
        if (event.type === "dblclick") return true;
        return event.button === 0;
      })
      .on("zoom", (event) => {
        const clamped = clampTransform(event.transform, WIDTH, HEIGHT);
        mapGroup.attr("transform", transformToString(clamped));
        svg.property("__zoom", clamped);
      });

    zoomBehaviorRef.current = behavior;
    svg.call(behavior);
    resetZoom();

    svg.on("dblclick.zoom", (event) => {
      event.preventDefault();
      applyTransform(zoomIdentity, true);
    });

    return () => {
      svg.on(".zoom", null);
      zoomBehaviorRef.current = null;
    };
  }, [applyTransform, explorable, resetZoom, continent, projection]);

  const focusCountry = useCallback(
    (country: Feature<Geometry>) => {
      const next = transformForFeature(pathGenerator, country, WIDTH, HEIGHT);
      applyTransform(next, true);
    },
    [applyTransform, pathGenerator]
  );

  useEffect(() => {
    if (!focusCountryCode || !mapReady) return;

    const code = focusCountryCode.toUpperCase();
    const country = visibleFeatures.find((feature) => {
      const meta = countryMetaFromFeature(feature);
      return meta?.code === code;
    });

    if (!country) {
      onFocusCountryDone?.();
      return;
    }

    const id =
      country.id != null && country.id !== "" ? String(country.id) : null;
    if (id) setHoveredCountryId(id);

    if (explorable) {
      focusCountry(country);
    }

    onFocusCountryDone?.();
  }, [
    explorable,
    focusCountry,
    focusCountryCode,
    mapReady,
    onFocusCountryDone,
    visibleFeatures,
  ]);

  const handleCountryClick = useCallback(
    (country: Feature<Geometry>, id: string) => {
      if (!interactive || !onCountryClick) return;

      const meta = countryMetaFromFeature(country);
      if (!meta) return;

      if (explorable) {
        focusCountry(country);
      }
      onCountryClick(meta);
      setHoveredCountryId(id);
    },
    [explorable, focusCountry, interactive, onCountryClick]
  );

  const hoveredCountryLabel = useMemo(() => {
    let targetCode: string | null = null;

    if (hoveredCountryId) {
      const country = countryById.get(hoveredCountryId);
      const meta = country ? countryMetaFromFeature(country) : null;
      targetCode = meta?.code ?? null;
    } else if (pinnedCountryCode) {
      targetCode = pinnedCountryCode.toUpperCase();
    }

    if (!targetCode) return null;

    const country = visibleFeatures.find((feature) => {
      const meta = countryMetaFromFeature(feature);
      return meta?.code === targetCode;
    });
    if (!country) return null;

    const meta = countryMetaFromFeature(country);
    if (!meta) return null;

    const [lng, lat] = geoCentroid(country);
    const point = projection([lng, lat]);
    if (!point) return null;

    return { x: point[0], y: point[1], name: meta.name };
  }, [countryById, hoveredCountryId, pinnedCountryCode, projection, visibleFeatures]);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900 ${
        explorable ? "touch-none" : ""
      }`}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className={`h-auto w-full ${explorable ? "cursor-grab active:cursor-grabbing" : ""}`}
        role="img"
        aria-label="World travel map"
      >
        <rect width={WIDTH} height={HEIGHT} fill={BRAND.colors.background} />

        <g ref={mapGroupRef}>
          {mapReady &&
            visibleFeatures.map((country, index) => {
            const id =
              country.id != null && country.id !== ""
                ? String(country.id)
                : `country-${index}`;
            const isVisited =
              country.id != null &&
              visitedNumericIds.has(normalizeCountryNumericId(country.id));
            const isWishlist =
              !isVisited &&
              country.id != null &&
              wishlistNumericIds.has(normalizeCountryNumericId(country.id));
            const isHovered = hoveredCountryId === id;
            const d = pathGenerator(country);
            const tiny = isTinyCountryOnMap(pathGenerator, country);
            const canClickCountry = interactive && !!onCountryClick;

            if (tiny) {
              const [lng, lat] = geoCentroid(country);
              const point = projection([lng, lat]);
              if (!point) return null;

              const colors = microStateMarkerColors(isVisited, isWishlist, isHovered);

              return (
                <MapMicroStateMarker
                  key={id}
                  x={point[0]}
                  y={point[1]}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={isHovered ? 2 : isWishlist ? 1.5 : 1.5}
                  interactive={canClickCountry}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleCountryClick(country, id);
                  }}
                  onMouseEnter={() => setHoveredCountryId(id)}
                  onMouseLeave={() => setHoveredCountryId(null)}
                />
              );
            }

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
                  isHovered
                    ? "#93c5fd"
                    : isWishlist
                      ? BRAND.colors.wishlist
                      : BRAND.colors.background
                }
                strokeWidth={isHovered ? 1.5 : isWishlist ? 1.5 : 0.5}
                className={`transition-colors duration-200 ${
                  canClickCountry ? "cursor-pointer" : ""
                }`}
                onClick={(event) => {
                  event.stopPropagation();
                  handleCountryClick(country, id);
                }}
                onMouseEnter={() => setHoveredCountryId(id)}
                onMouseLeave={() => setHoveredCountryId(null)}
              />
            );
          })}

          {mapReady &&
            visitedPinPositions.map((pin) => (
              <MapCountryPin key={`pin-${pin.id}`} x={pin.x} y={pin.y} />
            ))}

          {mapReady && hoveredCountryLabel && (
            <MapCountryLabel
              x={hoveredCountryLabel.x}
              y={hoveredCountryLabel.y}
              name={hoveredCountryLabel.name}
            />
          )}
        </g>
      </svg>
    </div>
  );
}
