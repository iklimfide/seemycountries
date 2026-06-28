import type { GeoPath } from "d3-geo";
import type { Feature, Geometry } from "geojson";

/** Rendered smaller than this on screen → show a visible click target instead. */
const MIN_VISIBLE_PX = 6;

export function isTinyCountryOnMap(
  pathGenerator: GeoPath,
  country: Feature<Geometry>
): boolean {
  const bounds = pathGenerator.bounds(country);
  if (!Number.isFinite(bounds[0][0]) || !Number.isFinite(bounds[1][0])) {
    return true;
  }

  const width = bounds[1][0] - bounds[0][0];
  const height = bounds[1][1] - bounds[0][1];
  return width < MIN_VISIBLE_PX && height < MIN_VISIBLE_PX;
}
