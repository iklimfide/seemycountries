import { geoPath, type GeoProjection } from "d3-geo";
import type { FeatureCollection } from "geojson";

/** Fit geo data to the viewport and scale up to remove letterboxing (edges touch frame). */
export function fitProjectionFill(
  projection: GeoProjection,
  width: number,
  height: number,
  object: FeatureCollection,
  padding = 0
): GeoProjection {
  const inset = Math.max(0, padding);

  projection.fitExtent(
    [
      [inset, inset],
      [width - inset, height - inset],
    ],
    object
  );

  const path = geoPath(projection);
  const bounds = path.bounds(object);
  const dx = bounds[1][0] - bounds[0][0];
  const dy = bounds[1][1] - bounds[0][1];

  if (!Number.isFinite(dx) || !Number.isFinite(dy) || dx <= 0 || dy <= 0) {
    return projection;
  }

  const innerW = width - inset * 2;
  const innerH = height - inset * 2;
  const scaleX = innerW / dx;
  const scaleY = innerH / dy;
  const fillFactor = Math.max(scaleX, scaleY) / Math.min(scaleX, scaleY);

  projection.scale(projection.scale() * fillFactor);

  const centered = path.bounds(object);
  const cx = (centered[0][0] + centered[1][0]) / 2;
  const cy = (centered[0][1] + centered[1][1]) / 2;
  const [tx, ty] = projection.translate();
  projection.translate([tx + width / 2 - cx, ty + height / 2 - cy]);

  return projection;
}
