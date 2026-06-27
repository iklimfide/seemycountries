"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CountryForm } from "@/components/dashboard/CountryForm";
import type { VisitedCountry } from "@/types/database";

type CountryListProps = {
  countries: VisitedCountry[];
};

export function CountryList({ countries }: CountryListProps) {
  const t = useTranslations("country");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);

  const existingCodes = countries.map((c) => c.country_code);

  async function handleDelete(id: string) {
    if (!confirm("Remove this country?")) return;

    const res = await fetch(`/api/countries/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error ?? "Failed to remove country");
      return;
    }
    router.refresh();
  }

  if (showAdd) {
    return (
      <CountryForm
        existingCodes={existingCodes}
        onSuccess={() => setShowAdd(false)}
        onCancel={() => setShowAdd(false)}
      />
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{t("title")}</h2>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          + {t("add")}
        </button>
      </div>

      {countries.length === 0 ? (
        <p className="text-sm text-slate-500">{t("empty")}</p>
      ) : (
        <ul className="divide-y divide-slate-800 rounded-xl border border-slate-700">
          {countries.map((country) => (
            <li
              key={country.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <p className="font-medium text-white">{country.country_name}</p>
              <button
                type="button"
                onClick={() => handleDelete(country.id)}
                className="text-sm text-red-400 hover:text-red-300"
              >
                {tCommon("delete")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
