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

  const visitedSegmentClass =
    "rounded-full px-2 py-0.5 transition-colors hover:bg-blue-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50";

  const wishlistSegmentClass =
    "rounded-full px-2 py-0.5 transition-colors hover:bg-amber-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50";

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
    <div ref={rootRef} className="relative flex flex-col items-center gap-3">
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-medium capitalize text-slate-500 dark:text-slate-400">
          {p.visited}
        </span>
        <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-3 rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-2.5 text-lg font-semibold tracking-wide text-blue-800 sm:px-6 sm:py-3 dark:text-blue-100">
          <button
            type="button"
            onClick={() => togglePanel("countries")}
            className={`inline-flex items-center gap-2 ${visitedSegmentClass}`}
            aria-expanded={openPanel === "countries"}
          >
            <span className="text-2xl font-bold text-foreground">{stats.countries}</span>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-200">{t.countries}</span>
          </button>
          <span className="text-blue-500/60 dark:text-blue-400/60" aria-hidden>
            |
          </span>
          <button
            type="button"
            onClick={() => togglePanel("cities")}
            className={`inline-flex items-center gap-2 ${visitedSegmentClass}`}
            aria-expanded={openPanel === "cities"}
          >
            <span className="text-2xl font-bold text-foreground">{stats.cities}</span>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-200">{t.cities}</span>
          </button>
        </div>
      </div>

      {wishlist.length > 0 && (
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm font-medium capitalize text-amber-700 dark:text-amber-200/80">
            {p.wantsToVisit}
          </span>
          <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-3 rounded-full border border-amber-500/35 bg-amber-500/10 px-5 py-2.5 text-lg font-semibold tracking-wide sm:px-6 sm:py-3">
            <button
              type="button"
              onClick={() => togglePanel("wishlist")}
              className={`inline-flex items-center gap-2 ${wishlistSegmentClass}`}
              aria-expanded={openPanel === "wishlist"}
            >
              <span className="text-2xl font-bold text-foreground">{wishlist.length}</span>
              <span className="text-sm font-medium text-amber-800 dark:text-amber-200">{t.countries}</span>
            </button>
          </div>
        </div>
      )}

      {openPanel && (
        <div className="absolute left-1/2 top-full z-30 mt-2 w-[min(100vw-2rem,20rem)] -translate-x-1/2 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-xl">
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
