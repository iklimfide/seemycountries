"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CityForm } from "@/components/dashboard/CityForm";
import { useModal } from "@/components/ui/ModalProvider";
import type { VisitedCity, VisitedCountry } from "@/types/database";

type CityListProps = {
  cities: VisitedCity[];
  countries: VisitedCountry[];
};

export function CityList({ cities, countries }: CityListProps) {
  const t = useTranslations("city");
  const tModal = useTranslations("modal");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const modal = useModal();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const canAddCity = countries.length > 0;

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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{t("title")}</h2>
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
