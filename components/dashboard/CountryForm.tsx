"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CountryPicker } from "@/components/dashboard/CountryPicker";
import { COUNTRY_LIST, getCountryName } from "@/lib/data/countries";

type CountryFormProps = {
  existingCodes: string[];
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function CountryForm({
  existingCodes,
  onSuccess,
  onCancel,
}: CountryFormProps) {
  const t = useTranslations("country");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const availableCountries = COUNTRY_LIST.filter(
    (c) => !existingCodes.map((x) => x.toUpperCase()).includes(c.code)
  );

  const [countryCode, setCountryCode] = useState(
    availableCountries[0]?.code ?? "US"
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/countries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country_code: countryCode,
          country_name: getCountryName(countryCode),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save country");
        return;
      }

      onSuccess?.();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (availableCountries.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 text-sm text-slate-400">
        {t("allAdded")}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-slate-700 bg-slate-900 p-5"
    >
      <h3 className="text-lg font-semibold text-white">{t("add")}</h3>

      <p className="text-xs text-slate-500">{t("allCountriesHint")}</p>

      <div>
        <label className="mb-2 block text-sm text-slate-400">{t("name")}</label>
        <CountryPicker
          countries={availableCountries}
          value={countryCode}
          onChange={setCountryCode}
          searchPlaceholder={t("searchPlaceholder")}
          noResultsLabel={t("noResults")}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || !countryCode}
          className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? tCommon("loading") : tCommon("save")}
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
