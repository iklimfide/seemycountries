"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMapFocus } from "@/components/map/MapFocusContext";
import { commonMessages, profileMessages } from "@/lib/i18n/client-messages";
import {
  buildVisitedCityList,
  buildVisitedCountryList,
} from "@/lib/map/travel-lists";
import type { TravelStats, VisitedCity, VisitedCountry, WishlistCountry } from "@/types/database";

type OpenPanel = "countries" | "cities" | "wishlist" | null;

type PublicProfileTravelSummaryProps = {
  stats: TravelStats;
  visitedCountries: VisitedCountry[];
  visitedCities: VisitedCity[];
  wishlistCountries: WishlistCountry[];
};

export function PublicProfileTravelSummary({
  stats,
  visitedCountries,
  visitedCities,
  wishlistCountries,
}: PublicProfileTravelSummaryProps) {
  const t = commonMessages;
  const p = profileMessages;
  const { focusCountry } = useMapFocus();
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const countries = useMemo(
    () => buildVisitedCountryList(visitedCountries, visitedCities),
    [visitedCountries, visitedCities]
  );

  const cities = useMemo(() => buildVisitedCityList(visitedCities), [visitedCities]);

  const wishlist = useMemo(
    () =>
      [...wishlistCountries]
        .map((country) => ({
          code: country.country_code,
          name: country.country_name,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [wishlistCountries]
  );

  useEffect(() => {
    if (!openPanel) return;

    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpenPanel(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenPanel(null);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openPanel]);

  function togglePanel(panel: Exclude<OpenPanel, null>) {
    setOpenPanel((current) => (current === panel ? null : panel));
  }

  function handleCountrySelect(country: { code: string; name: string }) {
    setOpenPanel(null);
    focusCountry(country);
  }

  function handleCitySelect(city: {
    country_code: string;
    country_name: string;
  }) {
    setOpenPanel(null);
    focusCountry({ code: city.country_code, name: city.country_name });
  }

  const segmentClass =
    "rounded-md px-1 py-0.5 font-semibold text-foreground transition-colors hover:bg-blue-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50";

  const wishlistSegmentClass =
    "rounded-md px-1 py-0.5 font-semibold text-amber-700 transition-colors hover:bg-amber-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 dark:text-amber-100";

  const panelTitle =
    openPanel === "countries"
      ? t.visitedCountries
      : openPanel === "cities"
        ? t.visitedCities
        : openPanel === "wishlist"
          ? p.wishlistCountries
          : "";

  const panelItems =
    openPanel === "countries"
      ? countries.map((country) => (
          <li key={country.code}>
            <button
              type="button"
              onClick={() => handleCountrySelect(country)}
              className="block w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800 hover:text-white"
            >
              {country.name}
            </button>
          </li>
        ))
      : openPanel === "cities"
        ? cities.map((city) => (
            <li key={city.id}>
              <button
                type="button"
                onClick={() => handleCitySelect(city)}
                className="block w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800 hover:text-white"
              >
                <span className="font-medium">{city.city_name}</span>
                <span className="text-slate-500"> · {city.country_name}</span>
              </button>
            </li>
          ))
        : openPanel === "wishlist"
          ? wishlist.map((country) => (
              <li key={country.code}>
                <button
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className="block w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800 hover:text-white"
                >
                  {country.name}
                </button>
              </li>
            ))
          : null;

  const panelEmpty =
    openPanel === "countries"
      ? countries.length === 0
      : openPanel === "cities"
        ? cities.length === 0
        : openPanel === "wishlist"
          ? wishlist.length === 0
          : true;

  return (
    <div ref={rootRef} className="relative flex flex-col gap-1 text-xs leading-snug sm:gap-2 sm:text-base">
      <p className="text-slate-300">
        <button
          type="button"
          onClick={() => togglePanel("countries")}
          className={segmentClass}
          aria-expanded={openPanel === "countries"}
        >
          {stats.countries} {t.countries.toLowerCase()}
        </button>
        <span className="text-slate-500"> · </span>
        <button
          type="button"
          onClick={() => togglePanel("cities")}
          className={segmentClass}
          aria-expanded={openPanel === "cities"}
        >
          {stats.cities} {t.cities.toLowerCase()}
        </button>{" "}
        <span className="text-slate-400">{p.visited}</span>
      </p>

      {wishlist.length > 0 && (
        <p className="text-slate-300">
          <button
            type="button"
            onClick={() => togglePanel("wishlist")}
            className={wishlistSegmentClass}
            aria-expanded={openPanel === "wishlist"}
          >
            {wishlist.length} {t.countries.toLowerCase()}
          </button>{" "}
          <span className="text-amber-700 dark:text-amber-200/80">{p.wantsToVisit}</span>
        </p>
      )}

      {openPanel && (
        <div className="absolute left-0 top-full z-30 mt-1 w-[min(100vw-2rem,20rem)] overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-xl">
          <div className="border-b border-slate-800 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {panelTitle}
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {panelEmpty ? (
              <li className="px-3 py-2 text-sm text-slate-500">{t.statsListEmpty}</li>
            ) : (
              panelItems
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
