import { geoArea, geoCentroid } from "d3-geo";
import type { Feature, Geometry, Polygon, Position } from "geojson";
import { getCountryContinent, type ContinentId } from "@/lib/map/continents";

/**
 * Geographic boxes for classifying polygon centroids (wider than map framing boxes).
 * [west, south, east, north]
 */
const CONTINENT_POLYGON_BOUNDS: Record<
  Exclude<ContinentId, "world">,
  [number, number, number, number]
> = {
  africa: [-20, -36, 55, 38],
  europe: [-25, 35, 45, 82],
  asia: [25, -12, 180, 78],
  "north-america": [-172, 12, -50, 84],
  "south-america": [-82, -56, -32, 15],
  oceania: [105, -52, 180, -8],
};

const CONTINENT_CHECK_ORDER: Exclude<ContinentId, "world">[] = [
  "south-america",
  "north-america",
  "oceania",
  "africa",
  "europe",
  "asia",
];

/** Countries spanning multiple continents — keep polygons on any listed continent. */
const MULTI_CONTINENT_CODES: Partial<Record<string, ContinentId[]>> = {
  RU: ["europe", "asia"],
  TR: ["europe", "asia"],
  EG: ["africa", "asia"],
  KZ: ["europe", "asia"],
  GE: ["europe", "asia"],
  AZ: ["europe", "asia"],
  CY: ["europe", "asia"],
  ID: ["asia", "oceania"],
  PA: ["north-america", "south-america"],
};

export function getContinentAtPoint(lng: number, lat: number): ContinentId | null {
  for (const id of CONTINENT_CHECK_ORDER) {
    const [west, south, east, north] = CONTINENT_POLYGON_BOUNDS[id];
    if (lng >= west && lng <= east && lat >= south && lat <= north) {
      return id;
    }
  }
  return null;
}

function allowedContinents(countryCode: string): Set<ContinentId> {
  const primary = getCountryContinent(countryCode);
  const extras = MULTI_CONTINENT_CODES[countryCode.toUpperCase()];
  const allowed = new Set<ContinentId>();

  if (primary) allowed.add(primary);
  if (extras) extras.forEach((c) => allowed.add(c));

  return allowed;
}

function explodePolygonCoords(geometry: Geometry): Position[][][] {
  if (geometry.type === "Polygon") {
    return [geometry.coordinates];
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates;
  }
  return [];
}

function polygonFeature(
  parent: Feature<Geometry>,
  coordinates: Position[][]
): Feature<Polygon> {
  return {
    type: "Feature",
    id: parent.id,
    properties: parent.properties,
    geometry: { type: "Polygon", coordinates },
  };
}

function mergePolygons(
  parent: Feature<Geometry>,
  polygons: Position[][][]
): Feature<Geometry> | null {
  if (polygons.length === 0) return null;
  if (polygons.length === 1) {
    return {
      ...parent,
      geometry: { type: "Polygon", coordinates: polygons[0] },
    };
  }

  return {
    ...parent,
    geometry: { type: "MultiPolygon", coordinates: polygons },
  };
}

function keepLargestPolygon(parent: Feature<Geometry>): Feature<Geometry> | null {
  const polygons = explodePolygonCoords(parent.geometry);
  if (polygons.length === 0) return null;
  if (polygons.length === 1) {
    return {
      ...parent,
      geometry: { type: "Polygon", coordinates: polygons[0] },
    };
  }

  let best = polygons[0];
  let bestArea = -1;

  for (const coordinates of polygons) {
    const area = geoArea(polygonFeature(parent, coordinates));
    if (area > bestArea) {
      bestArea = area;
      best = coordinates;
    }
  }

  return {
    ...parent,
    geometry: { type: "Polygon", coordinates: best },
  };
}

/** Drops overseas polygons whose centroid falls outside the country's continent(s). */
export function clipCountryToMainland(
  country: Feature<Geometry>,
  countryCode: string
): Feature<Geometry> | null {
  const allowed = allowedContinents(countryCode);
  if (allowed.size === 0) {
    return keepLargestPolygon(country);
  }

  const polygons = explodePolygonCoords(country.geometry);
  const kept = polygons.filter((coordinates) => {
    const [lng, lat] = geoCentroid(polygonFeature(country, coordinates));
    const continent = getContinentAtPoint(lng, lat);
    return continent != null && allowed.has(continent);
  });

  if (kept.length === 0) {
    return keepLargestPolygon(country);
  }

  return mergePolygons(country, kept);
}
