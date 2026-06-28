/** Stable SVG coordinate string for SSR/client hydration (d3 float output varies slightly). */
export function formatMapCoord(value: number): string {
  return (Math.round(value * 100) / 100).toFixed(2);
}
