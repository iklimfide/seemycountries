import { zoomIdentity, type ZoomTransform } from "d3-zoom";
import type { GeoPath } from "d3-geo";
import type { Feature, Geometry } from "geojson";

const MIN_SCALE = 1;
const MAX_SCALE = 8;
const FOCUS_MAX_SCALE = 12;
const FOCUS_MIN_SCALE = 3;

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

/** Looser pan limits for programmatic country focus. */
export function clampFocusTransform(
  transform: ZoomTransform,
  width: number,
  height: number
): ZoomTransform {
  const k = Math.min(FOCUS_MAX_SCALE, Math.max(FOCUS_MIN_SCALE, transform.k));
  const maxX = width * k;
  const maxY = height * k;

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

/** Zoom tightly on a single country; falls back to centroid when bounds span the continent. */
export function transformForCountryFocus(
  path: GeoPath,
  feature: Feature<Geometry>,
  width: number,
  height: number,
  padding = 28
): ZoomTransform {
  const viewW = width - padding * 2;
  const viewH = height - padding * 2;
  const bounds = path.bounds(feature);
  const dx = bounds[1][0] - bounds[0][0];
  const dy = bounds[1][1] - bounds[0][1];

  if (!Number.isFinite(dx) || !Number.isFinite(dy) || dx === 0 || dy === 0) {
    return zoomIdentity;
  }

  const boundsTooWide = dx > viewW * 0.75 || dy > viewH * 0.75;
  const [cx, cy] = path.centroid(feature);

  if (boundsTooWide) {
    const scale = 4.5;
    return zoomIdentity
      .translate(width / 2 - scale * cx, height / 2 - scale * cy)
      .scale(scale);
  }

  const x = (bounds[0][0] + bounds[1][0]) / 2;
  const y = (bounds[0][1] + bounds[1][1]) / 2;
  const scale = Math.min(
    FOCUS_MAX_SCALE,
    Math.max(FOCUS_MIN_SCALE, 0.92 / Math.max(dx / viewW, dy / viewH))
  );

  return zoomIdentity.translate(width / 2 - scale * x, height / 2 - scale * y).scale(scale);
}

export function transformToString(transform: ZoomTransform): string {
  return `translate(${transform.x} ${transform.y}) scale(${transform.k})`;
}
