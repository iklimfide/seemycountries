"use client";

import { useMemo } from "react";
import { buildVisitedCountryList } from "@/lib/map/travel-lists";
import { countryCodeToFlagUrl } from "@/lib/utils/country-flag";
import type { VisitedCity, VisitedCountry, VisitedPark } from "@/types/database";

type VisitedCountryFlagsProps = {
  visitedCountries?: VisitedCountry[];
  userCities?: VisitedCity[];
  userParks?: VisitedPark[];
  countryCodes: string[];
  onCountryClick?: (country: { code: string; name: string }) => void;
  variant?: "default" | "landing";
};

function FlagTile({
  country,
  onClick,
  variant = "default",
}: {
  country: { code: string; name: string };
  onClick?: () => void;
  variant?: "default" | "landing";
}) {
  const shellClass =
    variant === "landing"
      ? "flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[#d8e1ef] bg-white sm:h-10 sm:w-10"
      : "flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-slate-700/80 bg-slate-900/70 sm:h-10 sm:w-10";
  const flag = (
    // eslint-disable-next-line @next/next/no-img-element -- many small lazy-loaded SVG tiles
    <img
      src={countryCodeToFlagUrl(country.code)}
      alt=""
      width={40}
      height={30}
      className="h-full w-full object-cover"
      loading="lazy"
      decoding="async"
    />
  );

  if (onClick) {
    return (
      <button
        type="button"
        role="listitem"
        title={country.name}
        aria-label={country.name}
        onClick={onClick}
        className={`${shellClass} transition-colors ${
          variant === "landing"
            ? "hover:border-[#93c5fd] hover:bg-[#f8fbff]"
            : "hover:border-slate-500 hover:bg-slate-800"
        }`}
      >
        {flag}
      </button>
    );
  }

  return (
    <span
      role="listitem"
      title={country.name}
      aria-label={country.name}
      className={shellClass}
    >
      {flag}
    </span>
  );
}

export function VisitedCountryFlags({
  visitedCountries = [],
  userCities = [],
  userParks = [],
  countryCodes,
  onCountryClick,
  variant = "default",
}: VisitedCountryFlagsProps) {
  const countries = useMemo(
    () => buildVisitedCountryList(visitedCountries, userCities, countryCodes, userParks),
    [visitedCountries, userCities, countryCodes, userParks]
  );

  if (countries.length === 0) return null;

  return (
    <div
      className={
        variant === "landing"
          ? "profile-panel-scroll scrollbar-thin"
          : "mt-2 max-w-full min-w-0 overflow-x-auto overscroll-x-contain scrollbar-thin sm:mt-3"
      }
    >
      <div
        className={`flex w-max items-center ${
          variant === "landing" ? "gap-2.5" : "gap-1.5 px-0.5 py-1 sm:gap-2"
        }`}
        role="list"
        aria-label="Visited countries"
      >
        {countries.map((country) => (
          <FlagTile
            key={country.code}
            country={country}
            onClick={onCountryClick ? () => onCountryClick(country) : undefined}
            variant={variant}
          />
        ))}
      </div>
    </div>
  );
}
