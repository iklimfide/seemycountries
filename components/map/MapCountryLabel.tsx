import { formatMapCoord } from "@/lib/map/coords";

type MapCountryLabelProps = {
  x: number;
  y: number;
  name: string;
};

export function MapCountryLabel({ x, y, name }: MapCountryLabelProps) {
  const width = Math.min(Math.max(name.length * 6.8 + 20, 56), 200);
  const height = 24;
  const left = -width / 2;
  const top = -height - 8;

  return (
    <g
      transform={`translate(${formatMapCoord(x)}, ${formatMapCoord(y)})`}
      pointerEvents="none"
    >
      <rect
        x={formatMapCoord(left)}
        y={formatMapCoord(top)}
        width={formatMapCoord(width)}
        height={height}
        rx={8}
        fill="rgba(15, 23, 42, 0.92)"
        stroke="rgba(51, 65, 85, 0.8)"
        strokeWidth={1}
      />
      <text
        x={0}
        y={formatMapCoord(top + 16)}
        textAnchor="middle"
        fill="#e2e8f0"
        fontSize={12}
        fontWeight={500}
      >
        {name}
      </text>
    </g>
  );
}
