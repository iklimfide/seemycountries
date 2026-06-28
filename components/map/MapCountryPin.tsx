import { BRAND } from "@/lib/constants";
import { formatMapCoord } from "@/lib/map/coords";
import { MAP_CSS } from "@/lib/theme/map-css-vars";

/** Favicon-style map pin, anchored at the tip (bottom center). */
const PIN_PATH =
  "M16 6.5c-3.45 0-6.25 2.8-6.25 6.25 0 4.85 6.25 11.75 6.25 11.75s6.25-6.9 6.25-11.75C22.25 9.3 19.45 6.5 16 6.5z";

const PIN_TIP_Y = 24.25;
const PIN_CENTER_X = 16;

type MapCountryPinProps = {
  x: number;
  y: number;
  scale?: number;
  inverseScale?: number;
};

export function MapCountryPin({ x, y, scale = 0.5, inverseScale = 1 }: MapCountryPinProps) {
  const pinScale = scale * inverseScale;
  return (
    <g
      transform={`translate(${formatMapCoord(x)}, ${formatMapCoord(y)}) scale(${pinScale}) translate(${-PIN_CENTER_X}, ${-PIN_TIP_Y})`}
      pointerEvents="none"
    >
      <path d={PIN_PATH} fill={BRAND.colors.pin} stroke="#ffffff" strokeWidth={0.75} />
      <circle cx={PIN_CENTER_X} cy={12.75} r={2.25} fill={MAP_CSS.pinCenter} />
    </g>
  );
}
