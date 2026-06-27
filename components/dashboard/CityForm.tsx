"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LIMITS } from "@/lib/constants";
import { isValidInstagramUrl } from "@/lib/utils/instagram";
import { useModal } from "@/components/ui/ModalProvider";
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

type CityFormProps = {
  city?: VisitedCity;
  visitedCountries: VisitedCountry[];
  existingCities?: VisitedCity[];
  onSuccess?: () => void;
  onCancel?: () => void;
};

function encodeCountries(countries: VisitedCountry[]): string {
  return countries
    .map((c) => `${c.country_code}|${encodeURIComponent(c.country_name)}`)
    .join(",");
}

export function CityForm({
  city,
  visitedCountries,
  existingCities = [],
  onSuccess,
  onCancel,
}: CityFormProps) {
  const isEdit = Boolean(city);
  const t = useTranslations("city");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const modal = useModal();
  const abortRef = useRef<AbortController | null>(null);

  const [countryCode, setCountryCode] = useState(
    city?.country_code ?? visitedCountries[0]?.country_code ?? ""
  );
  const [searchCountryFilter, setSearchCountryFilter] = useState(ALL_COUNTRIES);
  const [cityName, setCityName] = useState(city?.city_name ?? "");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(
    city ? { latitude: city.latitude, longitude: city.longitude } : null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchCity[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [note, setNote] = useState(city?.note ?? "");
  const [mediaType, setMediaType] = useState<"photo" | "instagram" | "">(
    city?.media_type ?? ""
  );
  const [instagramUrl, setInstagramUrl] = useState(
    city?.media_type === "instagram" ? (city.media_url ?? "") : ""
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedCountry = visitedCountries.find((c) => c.country_code === countryCode);

  const searchCountries = useMemo(() => {
    if (searchCountryFilter === ALL_COUNTRIES) {
      return visitedCountries;
    }
    return visitedCountries.filter((c) => c.country_code === searchCountryFilter);
  }, [searchCountryFilter, visitedCountries]);

  const existingKeys = useMemo(
    () =>
      new Set(
        existingCities.map(
          (c) => `${c.country_code.toUpperCase()}:${c.city_name.toLowerCase()}`
        )
      ),
    [existingCities]
  );

  const runSearch = useCallback(
    async (q: string, countries: VisitedCountry[]) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (q.length < MIN_QUERY_LENGTH || countries.length === 0) {
        setSearchResults([]);
        setLoadingSearch(false);
        return;
      }

      setLoadingSearch(true);

      try {
        const params = new URLSearchParams({
          countries: encodeCountries(countries),
          q,
        });
        const res = await fetch(`/api/cities/search?${params}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          setSearchResults([]);
          await modal.alert("Could not search cities. Try again in a moment.", {
            variant: "error",
          });
          return;
        }

        const data = await res.json();
        setSearchResults(data.cities ?? []);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setSearchResults([]);
        await modal.alert("Could not search cities. Try again in a moment.", {
          variant: "error",
        });
      } finally {
        if (!controller.signal.aborted) {
          setLoadingSearch(false);
        }
      }
    },
    [modal]
  );

  useEffect(() => {
    if (isEdit) return;

    const q = searchQuery.trim();
    if (q.length < MIN_QUERY_LENGTH) {
      setSearchResults([]);
      setLoadingSearch(false);
      return;
    }

    const countries = searchCountries;
    setLoadingSearch(true);
    const timer = window.setTimeout(() => {
      runSearch(q, countries);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchQuery, searchCountries, isEdit, runSearch]);

  function handleSearchCountryFilterChange(value: string) {
    setSearchCountryFilter(value);
    setCityName("");
    setCoords(null);
    setSearchQuery("");
    setSearchResults([]);
  }

  function pickSearchResult(result: SearchCity) {
    setCityName(result.name);
    setCountryCode(result.country_code);
    setCoords({ latitude: result.latitude, longitude: result.longitude });
    setSearchQuery(result.name);
    setSearchResults([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!cityName.trim()) {
      await modal.alert(t("pickCityFirst"), { variant: "error" });
      return;
    }

    const countryName =
      selectedCountry?.country_name ??
      visitedCountries.find((c) => c.country_code === countryCode)?.country_name;

    if (!countryName) {
      await modal.alert(t("addCountryFirst"), { variant: "error" });
      return;
    }

    if (!isEdit) {
      const key = `${countryCode.toUpperCase()}:${cityName.toLowerCase()}`;
      if (existingKeys.has(key)) {
        await modal.alert(t("alreadyOnMap"), { variant: "info" });
        return;
      }
    }

    setLoading(true);

    try {
      let mediaUrl: string | null = city?.media_url ?? null;
      let finalMediaType: "photo" | "instagram" | null = null;

      if (mediaType === "instagram" && instagramUrl) {
        if (!isValidInstagramUrl(instagramUrl)) {
          await modal.alert("Invalid Instagram post URL", { variant: "error" });
          return;
        }
        finalMediaType = "instagram";
        mediaUrl = instagramUrl;
      } else if (mediaType === "photo" && photoFile) {
        const formData = new FormData();
        formData.append("file", photoFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          const data = await uploadRes.json();
          await modal.alert(data.error ?? "Upload failed", { variant: "error" });
          return;
        }
        const { url } = await uploadRes.json();
        finalMediaType = "photo";
        mediaUrl = url;
      } else if (city?.media_type && city.media_url && !photoFile && !instagramUrl) {
        finalMediaType = city.media_type;
        mediaUrl = city.media_url;
      }

      const payload = {
        city_name: cityName.trim(),
        country_code: countryCode,
        country_name: countryName,
        ...(coords && !isEdit
          ? { latitude: coords.latitude, longitude: coords.longitude }
          : {}),
        note: note || null,
        media_type: finalMediaType,
        media_url: mediaUrl,
      };

      const url = city ? `/api/cities/${city.id}` : "/api/cities";
      const method = city ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        await modal.alert(data.error ?? "Failed to save city", { variant: "error" });
        return;
      }

      onSuccess?.();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-slate-700 bg-slate-900 p-5"
    >
      <h3 className="text-lg font-semibold text-white">
        {isEdit ? t("edit") : t("add")}
      </h3>

      {!isEdit && (
        <>
          <p className="text-xs text-slate-500">{t("searchHint")}</p>

          <div>
            <label className="mb-2 block text-sm text-slate-400">{t("searchIn")}</label>
            <select
              value={searchCountryFilter}
              onChange={(e) => handleSearchCountryFilterChange(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
            >
              <option value={ALL_COUNTRIES}>{t("allMyCountries")}</option>
              {visitedCountries.map((c) => (
                <option key={c.country_code} value={c.country_code}>
                  {c.country_name}
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
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value !== cityName) {
                  setCoords(null);
                }
              }}
              placeholder={t("searchCitiesPlaceholder")}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
              autoComplete="off"
              autoFocus
            />
          </div>

          {(loadingSearch || searchResults.length > 0) && (
            <ul className="max-h-48 overflow-y-auto rounded-lg border border-slate-700 bg-slate-950 scrollbar-thin">
              {loadingSearch ? (
                <li className="px-3 py-4 text-center text-sm text-slate-500">
                  {tCommon("loading")}
                </li>
              ) : (
                searchResults.map((result) => {
                  const alreadyAdded = existingKeys.has(
                    `${result.country_code.toUpperCase()}:${result.name.toLowerCase()}`
                  );

                  return (
                    <li key={result.id}>
                      <button
                        type="button"
                        disabled={alreadyAdded}
                        onClick={() => pickSearchResult(result)}
                        className={`flex w-full flex-col px-3 py-2.5 text-left ${
                          alreadyAdded
                            ? "cursor-not-allowed opacity-50"
                            : "hover:bg-slate-800/80"
                        }`}
                      >
                        <span className="text-sm text-slate-200">{result.name}</span>
                        {result.subtitle && (
                          <span className="truncate text-xs text-slate-500">
                            {result.subtitle}
                          </span>
                        )}
                        {alreadyAdded && (
                          <span className="text-xs text-slate-600">{t("alreadyOnMap")}</span>
                        )}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          )}

          {cityName && (
            <p className="text-sm text-blue-400">
              {t("selectedCity", { city: cityName, country: selectedCountry?.country_name ?? "" })}
            </p>
          )}
        </>
      )}

      {isEdit && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-slate-400">{t("cityName")}</label>
            <input
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">{t("country")}</label>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
            >
              {visitedCountries.map((c) => (
                <option key={c.country_code} value={c.country_code}>
                  {c.country_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {isEdit && <p className="text-xs text-slate-500">{t("locationHint")}</p>}

      <p className="text-xs text-slate-500">{t("mediaHint")}</p>

      <div className="flex flex-wrap gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
          <input
            type="radio"
            name="mediaType"
            checked={mediaType === "photo"}
            onChange={() => setMediaType("photo")}
          />
          {t("photo")}
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
          <input
            type="radio"
            name="mediaType"
            checked={mediaType === "instagram"}
            onChange={() => setMediaType("instagram")}
          />
          {t("instagram")}
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
          <input
            type="radio"
            name="mediaType"
            checked={mediaType === ""}
            onChange={() => setMediaType("")}
          />
          {t("mediaNone")}
        </label>
      </div>

      {mediaType === "photo" && (
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
          className="text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:text-white"
        />
      )}

      {mediaType === "instagram" && (
        <div>
          <input
            type="url"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="https://www.instagram.com/p/..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-slate-500">{t("instagramHint")}</p>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm text-slate-400">{t("note")}</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, LIMITS.noteMaxLength))}
          rows={4}
          placeholder={t("notePlaceholder")}
          className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
        />
        <p className="mt-1 text-right text-xs text-slate-500">
          {t("noteCount", { count: note.length, max: LIMITS.noteMaxLength })}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading || (!isEdit && !cityName.trim())}
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
