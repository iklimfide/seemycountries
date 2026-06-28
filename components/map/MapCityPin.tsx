import { BRAND } from "@/lib/constants";
import { formatMapCoord } from "@/lib/map/coords";
import { MAP_CSS } from "@/lib/theme/map-css-vars";

type MapCityPinProps = {
  x: number;
  y: number;
  name: string;
  inverseScale?: number;
  interactive?: boolean;
  onClick?: () => void;
};

export function MapCityPin({
  x,
  y,
  name,
  inverseScale = 1,
  interactive = false,
  onClick,
}: MapCityPinProps) {
  const labelWidth = Math.min(Math.max(name.length * 5.4 + 10, 32), 110);
  const labelHeight = 14;
  const labelLeft = -labelWidth / 2;
  const labelTop = 6;

  return (
    <g
      transform={`translate(${formatMapCoord(x)}, ${formatMapCoord(y)}) scale(${inverseScale})`}
      pointerEvents={interactive ? "all" : "none"}
      style={{ cursor: interactive ? "pointer" : undefined }}
      onClick={
        interactive
          ? (event) => {
              event.stopPropagation();
              onClick?.();
            }
          : undefined
      }
    >
      <title>{name}</title>
      <circle
        r={4}
        fill={BRAND.colors.pin}
        stroke="#ffffff"
        strokeWidth={1.2}
      />
      <circle r={1.5} cx={0} cy={0} fill={MAP_CSS.pinCenter} />
      <rect
        x={formatMapCoord(labelLeft)}
        y={labelTop}
        width={formatMapCoord(labelWidth)}
        height={labelHeight}
        rx={4}
        fill="var(--map-label-bg)"
        stroke="var(--map-label-border)"
        strokeWidth={0.75}
      />
      <text
        x={0}
        y={labelTop + 10.5}
        textAnchor="middle"
        fill="var(--map-label-text)"
        fontSize={9}
        fontWeight={500}
      >
        {name}
      </text>
    </g>
  );
}
