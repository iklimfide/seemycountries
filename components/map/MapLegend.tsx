"use client";

import { useTranslations } from "next-intl";
import { BRAND } from "@/lib/constants";

type MapLegendProps = {
  showWishlist?: boolean;
};

export function MapLegend({ showWishlist = false }: MapLegendProps) {
  const t = useTranslations("wishlist");

  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
      <span className="inline-flex items-center gap-2">
        <span
          className="h-3 w-5 rounded-sm border border-slate-700"
          style={{ backgroundColor: BRAND.colors.visited }}
        />
        {t("legendVisited")}
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
          {t("legendWishlist")}
        </span>
      )}
    </div>
  );
}
