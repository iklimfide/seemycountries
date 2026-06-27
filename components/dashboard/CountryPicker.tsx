"use client";

import { useMemo, useState } from "react";
import type { CountryOption } from "@/lib/data/countries";

export type { CountryOption };

type CountryPickerProps = {
  countries: CountryOption[];
  value: string;
  onChange: (code: string) => void;
  searchPlaceholder: string;
  noResultsLabel: string;
};

export function CountryPicker({
  countries,
  value,
  onChange,
  searchPlaceholder,
  noResultsLabel,
}: CountryPickerProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter((c) => c.searchText.includes(q));
  }, [countries, query]);

  return (
    <div className="flex flex-col gap-2">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={searchPlaceholder}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
        autoComplete="off"
      />

      <ul
        className="max-h-52 overflow-y-auto rounded-lg border border-slate-700 bg-slate-950 scrollbar-thin"
        role="listbox"
        aria-label={searchPlaceholder}
      >
        {filtered.length === 0 ? (
          <li className="px-3 py-4 text-center text-sm text-slate-500">
            {noResultsLabel}
          </li>
        ) : (
          filtered.map((country) => {
            const selected = country.code === value;
            return (
              <li key={country.code} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => onChange(country.code)}
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors ${
                    selected
                      ? "bg-blue-600/20 text-blue-100"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span>{country.name}</span>
                  <span className="text-xs text-slate-500">{country.code}</span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
