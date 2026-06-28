"use client";

import { BRAND } from "@/lib/constants";
import { wishlistMessages } from "@/lib/i18n/client-messages";

type MapLegendProps = {
  showWishlist?: boolean;
};

export function MapLegend({ showWishlist = false }: MapLegendProps) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
      <span className="inline-flex items-center gap-2">
        <span
          className="h-3 w-5 rounded-sm border border-slate-700"
          style={{ backgroundColor: BRAND.colors.visited }}
        />
        {wishlistMessages.legendVisited}
      </span>
      {showWishlist && (
        <span className="inline-flex items-center gap-2">
          <span
            className="h-3 w-5 rounded-sm border-2"
            style={{
              backgroundColor: BRAND.colors.wishlistFill,
              borderColor: BRAND.colors.wishlist,
            }}
          />
          {wishlistMessages.legendWishlist}
        </span>
      )}
    </div>
  );
}
