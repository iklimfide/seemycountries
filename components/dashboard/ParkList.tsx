"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ParkForm } from "@/components/dashboard/ParkForm";
import { useModal } from "@/components/ui/ModalProvider";
import { parkTypeLabel } from "@/lib/utils/park-type";
import type { ParkType, VisitedCountry, VisitedPark } from "@/types/database";

const ALL_COUNTRIES = "ALL";

type ParkListProps = {
  parks: VisitedPark[];
  countries: VisitedCountry[];
};

function sortParks(parks: VisitedPark[], countryFilter: string): VisitedPark[] {
  return [...parks].sort((a, b) => {
    if (countryFilter === ALL_COUNTRIES) {
      const byCountry = a.country_name.localeCompare(b.country_name, undefined, {
        sensitivity: "base",
      });
      if (byCountry !== 0) return byCountry;
    }
    const byType = a.park_type.localeCompare(b.park_type);
    if (byType !== 0) return byType;
    return a.park_name.localeCompare(b.park_name, undefined, { sensitivity: "base" });
  });
}

export function ParkList({ parks, countries }: ParkListProps) {
  const t = useTranslations("park");
  const tModal = useTranslations("modal");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const modal = useModal();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [countryFilter, setCountryFilter] = useState(ALL_COUNTRIES);

  const canAddPark = countries.length > 0;

  const countryOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const park of parks) {
      const code = park.country_code.toUpperCase();
      if (!map.has(code)) {
        map.set(code, park.country_name);
      }
    }
    return [...map.entries()]
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }, [parks]);

  const filteredParks = useMemo(() => {
    const list =
      countryFilter === ALL_COUNTRIES
        ? parks
        : parks.filter((park) => park.country_code.toUpperCase() === countryFilter);

    return sortParks(list, countryFilter);
  }, [parks, countryFilter]);

  async function handleDelete(id: string) {
    const confirmed = await modal.confirm(tModal("deleteParkMessage"), {
      title: tModal("deleteParkTitle"),
      destructive: true,
    });
    if (!confirmed) return;

    const res = await fetch(`/api/parks/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      await modal.alert(data.error ?? "Failed to delete park", { variant: "error" });
      return;
    }
    router.refresh();
  }

  if (adding) {
    return (
      <ParkForm
        visitedCountries={countries}
        existingParks={parks}
        onSuccess={() => setAdding(false)}
        onCancel={() => setAdding(false)}
      />
    );
  }

  const editingPark = parks.find((p) => p.id === editingId);
  if (editingPark) {
    return (
      <ParkForm
        park={editingPark}
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
        {canAddPark && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:border-slate-500 hover:text-white"
          >
            + {t("add")}
          </button>
        )}
      </div>

      {!canAddPark ? (
        <p className="text-sm text-slate-500">{t("addCountryFirst")}</p>
      ) : parks.length === 0 ? (
        <p className="text-sm text-slate-500">{t("empty")}</p>
      ) : (
        <>
          {countryOptions.length > 1 && (
            <div className="max-w-xs">
              <label htmlFor="park-list-country-filter" className="mb-1.5 block text-sm text-slate-400">
                {t("filterByCountry")}
              </label>
              <select
                id="park-list-country-filter"
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
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

          {filteredParks.length === 0 ? (
            <p className="text-sm text-slate-500">{t("noParksInCountry")}</p>
          ) : (
            <ul className="max-h-[min(28rem,60vh)] divide-y divide-slate-800 overflow-y-auto rounded-xl border border-slate-700 scrollbar-thin">
              {filteredParks.map((park) => (
                <li
                  key={park.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">
                      {park.park_name}
                      {countryFilter === ALL_COUNTRIES ? (
                        <span className="font-normal text-slate-400">, {park.country_name}</span>
                      ) : null}
                    </p>
                    <p className="text-xs text-slate-500">
                      {parkTypeLabel(park.park_type)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(park.id)}
                      className="text-sm text-emerald-400 hover:text-emerald-300"
                    >
                      {tCommon("edit")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(park.id)}
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
