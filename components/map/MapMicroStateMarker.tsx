import { BRAND } from "@/lib/constants";
import { formatMapCoord } from "@/lib/map/coords";

type MapMicroStateMarkerProps = {
  x: number;
  y: number;
  fill: string;
  stroke: string;
  strokeWidth?: number;
  interactive?: boolean;
  onClick?: (event: React.MouseEvent<SVGCircleElement>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

const RADIUS = 5;

export function MapMicroStateMarker({
  x,
  y,
  fill,
  stroke,
  strokeWidth = 1.5,
  interactive = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: MapMicroStateMarkerProps) {
  return (
    <circle
      cx={formatMapCoord(x)}
      cy={formatMapCoord(y)}
      r={RADIUS}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      className={interactive ? "cursor-pointer" : undefined}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
}

export function microStateMarkerColors(
  isVisited: boolean,
  isWishlist: boolean,
  isHovered: boolean
): { fill: string; stroke: string } {
  if (isVisited) {
    return {
      fill: BRAND.colors.visited,
      stroke: isHovered ? "#93c5fd" : BRAND.colors.background,
    };
  }
  if (isWishlist) {
    return {
      fill: BRAND.colors.wishlistFill,
      stroke: isHovered ? "#93c5fd" : BRAND.colors.wishlist,
    };
  }
  return {
    fill: BRAND.colors.unvisited,
    stroke: isHovered ? "#93c5fd" : "#64748b",
  };
}
