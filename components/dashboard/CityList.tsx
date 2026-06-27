"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CityBulkForm } from "@/components/dashboard/CityBulkForm";
import { CityForm } from "@/components/dashboard/CityForm";
import type { VisitedCity, VisitedCountry } from "@/types/database";

type CityListProps = {
  cities: VisitedCity[];
  countries: VisitedCountry[];
};

type AddMode = false | "bulk" | "custom";

export function CityList({ cities, countries }: CityListProps) {
  const t = useTranslations("city");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addMode, setAddMode] = useState<AddMode>(false);

  const canAddCity = countries.length > 0;

  async function handleDelete(id: string) {
    if (!confirm("Delete this city?")) return;
    await fetch(`/api/cities/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (addMode === "bulk") {
    return (
      <CityBulkForm
        visitedCountries={countries}
        existingCities={cities}
        onAddCustom={() => setAddMode("custom")}
        onSuccess={() => setAddMode(false)}
        onCancel={() => setAddMode(false)}
      />
    );
  }

  if (addMode === "custom") {
    return (
      <CityForm
        visitedCountries={countries}
        onBackToList={() => setAddMode("bulk")}
        onSuccess={() => setAddMode(false)}
        onCancel={() => setAddMode(false)}
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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{t("title")}</h2>
        {canAddCity && (
          <button
            type="button"
            onClick={() => setAddMode("bulk")}
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
        <ul className="divide-y divide-slate-800 rounded-xl border border-slate-700">
          {cities.map((city) => (
            <li
              key={city.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <p className="font-medium text-white">
                  {city.city_name}, {city.country_name}
                </p>
                {city.media_type && (
                  <p className="text-xs text-slate-500 capitalize">{city.media_type}</p>
                )}
              </div>
              <div className="flex gap-2">
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
    </section>
  );
}
