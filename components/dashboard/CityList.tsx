"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CityForm } from "@/components/dashboard/CityForm";
import { useModal } from "@/components/ui/ModalProvider";
import type { VisitedCity, VisitedCountry } from "@/types/database";

const ALL_COUNTRIES = "ALL";

type CityListProps = {
  cities: VisitedCity[];
  countries: VisitedCountry[];
};

function sortCities(cities: VisitedCity[], countryFilter: string): VisitedCity[] {
  return [...cities].sort((a, b) => {
    if (countryFilter === ALL_COUNTRIES) {
      const byCountry = a.country_name.localeCompare(b.country_name, undefined, {
        sensitivity: "base",
      });
      if (byCountry !== 0) return byCountry;
    }
    return a.city_name.localeCompare(b.city_name, undefined, { sensitivity: "base" });
  });
}

export function CityList({ cities, countries }: CityListProps) {
  const t = useTranslations("city");
  const tModal = useTranslations("modal");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const modal = useModal();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [countryFilter, setCountryFilter] = useState(ALL_COUNTRIES);

  const canAddCity = countries.length > 0;

  const countryOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const city of cities) {
      const code = city.country_code.toUpperCase();
      if (!map.has(code)) {
        map.set(code, city.country_name);
      }
    }
    return [...map.entries()]
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }, [cities]);

  const filteredCities = useMemo(() => {
    const list =
      countryFilter === ALL_COUNTRIES
        ? cities
        : cities.filter((city) => city.country_code.toUpperCase() === countryFilter);

    return sortCities(list, countryFilter);
  }, [cities, countryFilter]);

  async function handleDelete(id: string) {
    const confirmed = await modal.confirm(tModal("deleteCityMessage"), {
      title: tModal("deleteCityTitle"),
      destructive: true,
    });
    if (!confirmed) return;

    const res = await fetch(`/api/cities/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      await modal.alert(data.error ?? "Failed to delete city", { variant: "error" });
      return;
    }
    router.refresh();
  }

  if (adding) {
    return (
      <CityForm
        visitedCountries={countries}
        existingCities={cities}
        onSuccess={() => setAdding(false)}
        onCancel={() => setAdding(false)}
      />
    );
  }

  const editingCity = cities.find((c) => c.id === editingId);
  if (editingCity) {
    return (
      <CityForm
        city={editingCity}
        visitedCountries={countries}
        onSuccess={() => setEditingId(null)}
        onCancel={() => setEditingId(null)}
      />
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">
          {t("title")}
          <span className="ml-2 text-sm font-normal text-slate-500">
            · {t("visitedOnly")}
          </span>
        </h2>
        {canAddCity && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:border-slate-500 hover:text-white"
          >
            + {t("add")}
          </button>
        )}
      </div>

      {!canAddCity ? (
        <p className="text-sm text-slate-500">{t("addCountryFirst")}</p>
      ) : cities.length === 0 ? (
        <p className="text-sm text-slate-500">{t("empty")}</p>
      ) : (
        <>
          {countryOptions.length > 1 && (
            <div className="max-w-xs">
              <label htmlFor="city-list-country-filter" className="mb-1.5 block text-sm text-slate-400">
                {t("filterByCountry")}
              </label>
              <select
                id="city-list-country-filter"
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              >
                <option value={ALL_COUNTRIES}>{t("allCountries")}</option>
                {countryOptions.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {filteredCities.length === 0 ? (
            <p className="text-sm text-slate-500">{t("noCitiesInCountry")}</p>
          ) : (
            <ul className="max-h-[min(28rem,60vh)] divide-y divide-slate-800 overflow-y-auto rounded-xl border border-slate-700 scrollbar-thin">
              {filteredCities.map((city) => (
                <li
                  key={city.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">
                      {city.city_name}
                      {countryFilter === ALL_COUNTRIES ? (
                        <span className="font-normal text-slate-400">, {city.country_name}</span>
                      ) : null}
                    </p>
                    {city.media_type && (
                      <p className="text-xs text-slate-500 capitalize">{city.media_type}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(city.id)}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      {tCommon("edit")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(city.id)}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      {tCommon("delete")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
