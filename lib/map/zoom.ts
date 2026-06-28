import { zoomIdentity, type ZoomTransform } from "d3-zoom";
import type { GeoPath } from "d3-geo";
import type { Feature, Geometry } from "geojson";

const MIN_SCALE = 1;
const MAX_SCALE = 8;

export function clampTransform(
  transform: ZoomTransform,
  width: number,
  height: number
): ZoomTransform {
  const k = Math.min(MAX_SCALE, Math.max(MIN_SCALE, transform.k));
  const maxX = (width * (k - 1)) / 2;
  const maxY = (height * (k - 1)) / 2;

  return zoomIdentity
    .translate(
      Math.min(maxX, Math.max(-maxX, transform.x)),
      Math.min(maxY, Math.max(-maxY, transform.y))
    )
    .scale(k);
}

export function transformForFeature(
  path: GeoPath,
  feature: Feature<Geometry>,
  width: number,
  height: number,
  padding = 48
): ZoomTransform {
  const bounds = path.bounds(feature);
  const dx = bounds[1][0] - bounds[0][0];
  const dy = bounds[1][1] - bounds[0][1];
  const x = (bounds[0][0] + bounds[1][0]) / 2;
  const y = (bounds[0][1] + bounds[1][1]) / 2;

  if (!Number.isFinite(dx) || !Number.isFinite(dy) || dx === 0 || dy === 0) {
    return zoomIdentity;
  }

  const scale = Math.min(
    MAX_SCALE,
    Math.max(
      MIN_SCALE,
      0.9 / Math.max(dx / (width - padding * 2), dy / (height - padding * 2))
    )
  );

  return zoomIdentity
    .translate(width / 2 - scale * x, height / 2 - scale * y)
    .scale(scale);
}

export function transformToString(transform: ZoomTransform): string {
  return `translate(${transform.x} ${transform.y}) scale(${transform.k})`;
}
