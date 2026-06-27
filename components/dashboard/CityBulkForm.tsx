"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { VisitedCity, VisitedCountry } from "@/types/database";

type SearchCity = {
  id: string;
  name: string;
  subtitle: string;
  latitude: number;
  longitude: number;
  country_code: string;
  country_name: string;
};

const SEARCH_DEBOUNCE_MS = 400;
const MIN_QUERY_LENGTH = 2;
const ALL_COUNTRIES = "ALL";

type CityBulkFormProps = {
  visitedCountries: VisitedCountry[];
  existingCities: VisitedCity[];
  onAddCustom?: () => void;
  onSuccess?: () => void;
  onCancel?: () => void;
};

function encodeCountries(countries: VisitedCountry[]): string {
  return countries
    .map((c) => `${c.country_code}|${encodeURIComponent(c.country_name)}`)
    .join(",");
}

export function CityBulkForm({
  visitedCountries,
  existingCities,
  onAddCustom,
  onSuccess,
  onCancel,
}: CityBulkFormProps) {
  const t = useTranslations("city");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [countryFilter, setCountryFilter] = useState(ALL_COUNTRIES);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchCity[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selected, setSelected] = useState<Map<string, SearchCity>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const searchCountries = useMemo(() => {
    if (countryFilter === ALL_COUNTRIES) {
      return visitedCountries;
    }
    return visitedCountries.filter((c) => c.country_code === countryFilter);
  }, [countryFilter, visitedCountries]);

  const existingKeys = useMemo(() => {
    return new Set(
      existingCities.map((c) => `${c.country_code.toUpperCase()}:${c.city_name.toLowerCase()}`)
    );
  }, [existingCities]);

  function isAlreadyAdded(city: SearchCity): boolean {
    return existingKeys.has(`${city.country_code.toUpperCase()}:${city.name.toLowerCase()}`);
  }

  const runSearch = useCallback(async (q: string, countries: VisitedCountry[]) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (q.length < MIN_QUERY_LENGTH || countries.length === 0) {
      setResults([]);
      setLoadingSearch(false);
      return;
    }

    setLoadingSearch(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        countries: encodeCountries(countries),
        q,
      });
      const res = await fetch(`/api/cities/search?${params}`, {
        signal: controller.signal,
      });

      if (!res.ok) {
        setResults([]);
        setError("Could not search cities. Try again in a moment.");
        return;
      }

      const data = await res.json();
      setResults(data.cities ?? []);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setResults([]);
      setError("Could not search cities. Try again in a moment.");
    } finally {
      if (!controller.signal.aborted) {
        setLoadingSearch(false);
      }
    }
  }, []);

  useEffect(() => {
    setSelected(new Map());
    setResults([]);

    const q = query.trim();
    if (q.length < MIN_QUERY_LENGTH) {
      setLoadingSearch(false);
      return;
    }

    setLoadingSearch(true);
    const timer = window.setTimeout(() => {
      runSearch(q, searchCountries);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [query, searchCountries, runSearch]);

  function handleCountryFilterChange(value: string) {
    setCountryFilter(value);
    setSelected(new Map());
    setError(null);
  }

  function toggleCity(city: SearchCity) {
    if (isAlreadyAdded(city)) return;

    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(city.id)) next.delete(city.id);
      else next.set(city.id, city);
      return next;
    });
  }

  function toggleAllVisible() {
    const selectable = results.filter((city) => !isAlreadyAdded(city));
    const allSelected = selectable.every((city) => selected.has(city.id));

    setSelected((prev) => {
      const next = new Map(prev);
      if (allSelected) {
        selectable.forEach((city) => next.delete(city.id));
      } else {
        selectable.forEach((city) => next.set(city.id, city));
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selected.size === 0) return;

    setSaving(true);
    setError(null);

    try {
      const byCountry = new Map<string, { country_name: string; cities: SearchCity[] }>();

      for (const city of selected.values()) {
        const code = city.country_code.toUpperCase();
        const group = byCountry.get(code) ?? {
          country_name: city.country_name,
          cities: [],
        };
        group.cities.push(city);
        byCountry.set(code, group);
      }

      for (const [country_code, group] of byCountry) {
        const res = await fetch("/api/cities/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            country_code,
            country_name: group.country_name,
            cities: group.cities.map((city) => ({
              city_name: city.name,
              latitude: city.latitude,
              longitude: city.longitude,
            })),
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? "Failed to add cities");
          return;
        }
      }

      onSuccess?.();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const trimmedQuery = query.trim();
  const showIdle = trimmedQuery.length < MIN_QUERY_LENGTH;
  const selectableResults = results.filter((city) => !isAlreadyAdded(city));
  const allVisibleSelected =
    selectableResults.length > 0 &&
    selectableResults.every((city) => selected.has(city.id));

  const emptyMessage = showIdle
    ? t("searchIdle")
    : loadingSearch
      ? null
      : t("noCityResults");

  const showEmptyAddCustom =
    onAddCustom && !loadingSearch && !showIdle && results.length === 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-slate-700 bg-slate-900 p-5"
    >
      <h3 className="text-lg font-semibold text-white">{t("add")}</h3>

      <p className="text-xs text-slate-500">{t("searchHint")}</p>

      <div>
        <label className="mb-2 block text-sm text-slate-400">{t("searchIn")}</label>
        <select
          value={countryFilter}
          onChange={(e) => handleCountryFilterChange(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
        >
          <option value={ALL_COUNTRIES}>{t("allMyCountries")}</option>
          {visitedCountries.map((country) => (
            <option key={country.country_code} value={country.country_code}>
              {country.country_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-400">
          {t("searchCities")}
        </label>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchCitiesPlaceholder")}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
          autoComplete="off"
          autoFocus
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {showIdle
            ? t("searchMinChars")
            : t("cityCount", {
                count: results.length,
                selected: selected.size,
              })}
        </span>
        {selectableResults.length > 0 && (
          <button
            type="button"
            onClick={toggleAllVisible}
            className="text-blue-400 hover:text-blue-300"
          >
            {allVisibleSelected ? t("deselectAll") : t("selectAll")}
          </button>
        )}
      </div>

      <ul className="max-h-64 overflow-y-auto rounded-lg border border-slate-700 bg-slate-950 scrollbar-thin">
        {loadingSearch ? (
          <li className="px-3 py-5 text-center text-sm text-slate-500">
            {tCommon("loading")}
          </li>
        ) : results.length === 0 ? (
          <li className="flex flex-col items-center gap-3 px-3 py-5 text-center text-sm text-slate-500">
            {emptyMessage && <p>{emptyMessage}</p>}
            {showEmptyAddCustom && (
              <button
                type="button"
                onClick={onAddCustom}
                className="text-blue-400 hover:text-blue-300"
              >
                {t("addCustom")}
              </button>
            )}
          </li>
        ) : (
          results.map((city) => {
            const alreadyAdded = isAlreadyAdded(city);

            return (
              <li key={city.id}>
                <label
                  className={`flex items-center gap-3 px-3 py-2.5 ${
                    alreadyAdded
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer hover:bg-slate-800/80"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(city.id)}
                    disabled={alreadyAdded}
                    onChange={() => toggleCity(city)}
                    className="h-4 w-4 shrink-0 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm text-slate-200">{city.name}</span>
                    {city.subtitle && (
                      <span className="truncate text-xs text-slate-500">
                        {city.subtitle}
                      </span>
                    )}
                    {alreadyAdded && (
                      <span className="text-xs text-slate-600">
                        {t("alreadyOnMap")}
                      </span>
                    )}
                  </span>
                </label>
              </li>
            );
          })
        )}
      </ul>

      <p className="text-xs text-slate-500">{t("bulkHint")}</p>

      {onAddCustom && !showEmptyAddCustom && (
        <button
          type="button"
          onClick={onAddCustom}
          className="self-start text-sm text-blue-400 hover:text-blue-300"
        >
          {t("addCustom")}
        </button>
      )}

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || selected.size === 0}
          className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {saving
            ? tCommon("loading")
            : t("addSelected", { count: selected.size })}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-700 px-5 py-2 text-slate-300 hover:border-slate-500"
          >
            {tCommon("cancel")}
          </button>
        )}
      </div>
    </form>
  );
}
