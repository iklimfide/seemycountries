"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LIMITS } from "@/lib/constants";
import { addPark } from "@/lib/client/park-actions";
import { formatCityDisplayName } from "@/lib/utils/city-name";
import { useModal } from "@/components/ui/ModalProvider";
import { useToast } from "@/components/ui/ToastProvider";
import type { ParkType, VisitedCountry, VisitedPark } from "@/types/database";

type SearchPark = {
  parkType: ParkType;
  name: string;
  latitude: number;
  longitude: number;
  country_code: string;
  country_name: string;
};

const SEARCH_DEBOUNCE_MS = 400;
const MIN_QUERY_LENGTH = 2;
const CUSTOM_PARK_TOAST_DELAY_MS = 500;
const ALL_COUNTRIES = "ALL";

type ParkFormProps = {
  park?: VisitedPark;
  visitedCountries: VisitedCountry[];
  existingParks?: VisitedPark[];
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function ParkForm({
  park,
  visitedCountries,
  existingParks = [],
  onSuccess,
  onCancel,
}: ParkFormProps) {
  const isEdit = Boolean(park);
  const t = useTranslations("park");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const modal = useModal();
  const toast = useToast();
  const abortRef = useRef<AbortController | null>(null);
  const lastPromptKeyRef = useRef<string | null>(null);

  const [countryCode, setCountryCode] = useState(
    park?.country_code ?? visitedCountries[0]?.country_code ?? ""
  );
  const [parkType, setParkType] = useState<ParkType>(park?.park_type ?? "national_park");
  const [parkName, setParkName] = useState(park?.park_name ?? "");
  const [searchCountryFilter, setSearchCountryFilter] = useState(ALL_COUNTRIES);
  const [customCountryCode, setCustomCountryCode] = useState(
    park?.country_code ?? visitedCountries[0]?.country_code ?? ""
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchPark[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [note, setNote] = useState(park?.note ?? "");
  const [loading, setLoading] = useState(false);

  const selectedCountry = visitedCountries.find((c) => c.country_code === countryCode);

  const customTargetCountryCode =
    searchCountryFilter !== ALL_COUNTRIES ? searchCountryFilter : customCountryCode;

  const customTargetCountry = visitedCountries.find(
    (c) => c.country_code === customTargetCountryCode
  );

  const searchCountries = useMemo(() => {
    if (searchCountryFilter === ALL_COUNTRIES) {
      return visitedCountries;
    }
    return visitedCountries.filter((c) => c.country_code === searchCountryFilter);
  }, [searchCountryFilter, visitedCountries]);

  const existingKeys = useMemo(
    () =>
      new Set(
        existingParks.map(
          (p) => `${p.country_code.toUpperCase()}:${p.park_type}:${p.park_name.toLowerCase()}`
        )
      ),
    [existingParks]
  );

  const trimmedQuery = searchQuery.trim();

  const canAddCustomPark = useMemo(() => {
    if (isEdit || trimmedQuery.length < MIN_QUERY_LENGTH || !customTargetCountryCode) return false;
    if (loadingSearch) return false;
    if (searchResults.length > 0) return false;

    const key = `${customTargetCountryCode.toUpperCase()}:${parkType}:${trimmedQuery.toLowerCase()}`;
    if (existingKeys.has(key)) return false;

    return true;
  }, [
    customTargetCountryCode,
    existingKeys,
    isEdit,
    loadingSearch,
    parkType,
    searchResults.length,
    trimmedQuery,
  ]);

  const handleAddCustomPark = useCallback(async () => {
    if (!customTargetCountry || trimmedQuery.length < MIN_QUERY_LENGTH) return;

    setLoading(true);
    try {
      const result = await addPark({
        park_name: trimmedQuery,
        park_type: parkType,
        country_code: customTargetCountry.country_code,
        country_name: customTargetCountry.country_name,
        note: note || undefined,
      });

      if (!result.ok) {
        await modal.alert(result.error, { variant: "error" });
        throw new Error(result.error);
      }

      toast.show(t("parkAdded"));
      router.refresh();
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  }, [
    customTargetCountry,
    modal,
    note,
    onSuccess,
    parkType,
    router,
    t,
    toast,
    trimmedQuery,
  ]);

  useEffect(() => {
    if (isEdit || trimmedQuery.length < MIN_QUERY_LENGTH || searchCountries.length === 0) {
      setSearchResults([]);
      return;
    }

    const timer = window.setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoadingSearch(true);

      const codes =
        searchCountryFilter === ALL_COUNTRIES
          ? searchCountries.map((c) => c.country_code)
          : [searchCountryFilter];

      Promise.all(
        codes.map(async (code) => {
          const country = visitedCountries.find((c) => c.country_code === code);
          if (!country) return [];

          const params = new URLSearchParams({
            country: code,
            q: trimmedQuery,
            type: parkType,
          });
          const res = await fetch(`/api/parks/tourist?${params}`, {
            signal: controller.signal,
          });
          if (!res.ok) return [];
          const data = await res.json();
          return (data.parks ?? []).map((item: SearchPark) => ({
            ...item,
            country_code: code,
            country_name: country.country_name,
          }));
        })
      )
        .then((groups) => {
          if (controller.signal.aborted) return;
          const merged = groups.flat();
          const seen = new Set<string>();
          setSearchResults(
            merged.filter((result) => {
              const dedupeKey = `${result.country_code}:${result.name.toLocaleLowerCase("tr")}`;
              if (seen.has(dedupeKey)) return false;
              seen.add(dedupeKey);
              return true;
            })
          );
        })
        .catch(() => {
          if (!controller.signal.aborted) setSearchResults([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoadingSearch(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [
    isEdit,
    parkType,
    searchCountries,
    searchCountryFilter,
    trimmedQuery,
    visitedCountries,
  ]);

  useEffect(() => {
    if (isEdit || loadingSearch || loading || !canAddCustomPark || parkName) return;

    const promptKey = `${customTargetCountryCode}:${parkType}:${trimmedQuery.toLowerCase()}`;
    const timer = window.setTimeout(() => {
      if (lastPromptKeyRef.current === promptKey) return;
      lastPromptKeyRef.current = promptKey;

      toast.showAction({
        message: t("customParkNotFound", {
          park: formatCityDisplayName(trimmedQuery),
          country: customTargetCountry?.country_name ?? "",
        }),
        actionLabel: t("customParkAdd"),
        dismissLabel: tCommon("no"),
        onAction: handleAddCustomPark,
      });
    }, CUSTOM_PARK_TOAST_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [
    canAddCustomPark,
    customTargetCountry?.country_name,
    customTargetCountryCode,
    handleAddCustomPark,
    isEdit,
    loading,
    loadingSearch,
    parkName,
    parkType,
    t,
    tCommon,
    toast,
    trimmedQuery,
  ]);

  useEffect(() => {
    if (!canAddCustomPark) {
      lastPromptKeyRef.current = null;
      toast.dismiss();
    }
  }, [canAddCustomPark, toast]);

  function handleSearchCountryFilterChange(value: string) {
    setSearchCountryFilter(value);
    if (value !== ALL_COUNTRIES) {
      setCountryCode(value);
    }
    setParkName("");
    setSearchQuery("");
    setSearchResults([]);
    lastPromptKeyRef.current = null;
  }

  function pickPark(result: SearchPark) {
    setParkName(result.name);
    setParkType(result.parkType);
    setCountryCode(result.country_code);
    setSearchQuery("");
    setSearchResults([]);
    lastPromptKeyRef.current = null;
  }

  async function handleSave() {
    if (!selectedCountry || !parkName.trim()) {
      await modal.alert(t("pickParkFirst"), { variant: "info" });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        park_name: parkName,
        park_type: parkType,
        country_code: selectedCountry.country_code,
        country_name: selectedCountry.country_name,
        note: note || null,
        media_type: null,
        media_url: null,
      };

      const res = await fetch(isEdit ? `/api/parks/${park!.id}` : "/api/parks", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        await modal.alert(data.error ?? "Failed to save park", { variant: "error" });
        return;
      }

      router.refresh();
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  }

  if (isEdit) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
        <h3 className="mb-4 text-lg font-semibold text-white">{t("edit")}</h3>

        <div className="mb-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-slate-400">{t("parkName")}</label>
            <input
              value={parkName}
              onChange={(e) => setParkName(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-slate-400">{t("parkType")}</label>
            <select
              value={parkType}
              onChange={(e) => setParkType(e.target.value as ParkType)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            >
              <option value="national_park">{t("nationalPark")}</option>
              <option value="theme_park">{t("themePark")}</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-slate-400">{t("country")}</label>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            >
              {visitedCountries.map((country) => (
                <option key={country.id} value={country.country_code}>
                  {country.country_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-slate-400">{t("note")}</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={LIMITS.noteMaxLength}
              rows={3}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {tCommon("save")}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300"
          >
            {tCommon("cancel")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
      <h3 className="mb-4 text-lg font-semibold text-white">{t("add")}</h3>

      <div className="mb-4 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm text-slate-400">{t("parkType")}</label>
          <select
            value={parkType}
            onChange={(e) => {
              setParkType(e.target.value as ParkType);
              setParkName("");
              setSearchQuery("");
            }}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          >
            <option value="national_park">{t("nationalPark")}</option>
            <option value="theme_park">{t("themePark")}</option>
          </select>
        </div>

        {visitedCountries.length > 1 && (
          <div>
            <label className="mb-1.5 block text-sm text-slate-400">{t("searchIn")}</label>
            <select
              value={searchCountryFilter}
              onChange={(e) => handleSearchCountryFilterChange(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            >
              <option value={ALL_COUNTRIES}>{t("allMyCountries")}</option>
              {visitedCountries.map((country) => (
                <option key={country.id} value={country.country_code}>
                  {country.country_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {searchCountryFilter === ALL_COUNTRIES && trimmedQuery.length >= MIN_QUERY_LENGTH && (
          <div>
            <label className="mb-1.5 block text-sm text-slate-400">{t("country")}</label>
            <select
              value={customCountryCode}
              onChange={(e) => {
                setCustomCountryCode(e.target.value);
                lastPromptKeyRef.current = null;
              }}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            >
              {visitedCountries.map((country) => (
                <option key={country.id} value={country.country_code}>
                  {country.country_name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm text-slate-400">{t("searchParks")}</label>
          <input
            value={searchQuery}
            onChange={(e) => {
              lastPromptKeyRef.current = null;
              setSearchQuery(e.target.value);
              setParkName("");
            }}
            placeholder={t("searchParksPlaceholder")}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
        </div>

        {(searchResults.length > 0 || loadingSearch) && !parkName && (
          <ul className="max-h-48 overflow-y-auto rounded-lg border border-slate-700 bg-slate-950">
            {loadingSearch ? (
              <li className="px-3 py-4 text-sm text-slate-500">{tCommon("loading")}</li>
            ) : (
              searchResults.map((result) => {
                const key = `${result.country_code}:${result.name.toLocaleLowerCase("tr")}`;
                const onMap = existingKeys.has(
                  `${result.country_code.toUpperCase()}:${result.parkType}:${result.name.toLowerCase()}`
                );

                return (
                  <li key={key} className="border-b border-slate-800 last:border-b-0">
                    <button
                      type="button"
                      disabled={onMap}
                      onClick={() => pickPark(result)}
                      className="block w-full px-3 py-2.5 text-left hover:bg-slate-900 disabled:cursor-default disabled:opacity-50"
                    >
                      <span className="text-sm text-white">{result.name}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {result.country_name}
                        {onMap ? ` · ${t("alreadyOnMap")}` : ""}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        )}

        {parkName && selectedCountry ? (
          <p className="text-sm text-emerald-300">
            {t("selectedPark", {
              park: parkName,
              country: selectedCountry.country_name,
            })}
          </p>
        ) : null}

        {parkName ? (
          <div>
            <label className="mb-1.5 block text-sm text-slate-400">{t("note")}</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={LIMITS.noteMaxLength}
              rows={3}
              placeholder={t("notePlaceholder")}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            />
          </div>
        ) : null}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || !parkName}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {tCommon("save")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300"
        >
          {tCommon("cancel")}
        </button>
      </div>
    </div>
  );
}
