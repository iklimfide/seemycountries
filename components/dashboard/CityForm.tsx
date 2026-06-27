"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { COUNTRY_LIST, getCountryName } from "@/lib/data/countries";
import { LIMITS } from "@/lib/constants";
import { isValidInstagramUrl } from "@/lib/utils/instagram";
import type { VisitedCity, VisitedCountry } from "@/types/database";

type CityFormProps = {
  city?: VisitedCity;
  visitedCountries: VisitedCountry[];
  onBackToList?: () => void;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function CityForm({ city, visitedCountries, onBackToList, onSuccess, onCancel }: CityFormProps) {
  const t = useTranslations("city");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const countryOptions =
    visitedCountries.length > 0
      ? visitedCountries.map((c) => ({
          code: c.country_code,
          name: c.country_name,
        }))
      : COUNTRY_LIST;

  const [cityName, setCityName] = useState(city?.city_name ?? "");
  const [countryCode, setCountryCode] = useState(
    city?.country_code ?? countryOptions[0]?.code ?? "US"
  );
  const [note, setNote] = useState(city?.note ?? "");
  const [mediaType, setMediaType] = useState<"photo" | "instagram" | "">(
    city?.media_type ?? ""
  );
  const [instagramUrl, setInstagramUrl] = useState(
    city?.media_type === "instagram" ? (city.media_url ?? "") : ""
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const countryName =
        countryOptions.find((c) => c.code === countryCode)?.name ??
        getCountryName(countryCode);
      let mediaUrl: string | null = city?.media_url ?? null;
      let finalMediaType: "photo" | "instagram" | null = null;

      if (mediaType === "instagram" && instagramUrl) {
        if (!isValidInstagramUrl(instagramUrl)) {
          setError("Invalid Instagram post URL");
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
          setError(data.error ?? "Upload failed");
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
        city_name: cityName,
        country_code: countryCode,
        country_name: countryName,
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
        setError(data.error ?? "Failed to save city");
        return;
      }

      onSuccess?.();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-slate-700 bg-slate-900 p-5">
      <h3 className="text-lg font-semibold text-white">
        {city ? t("edit") : t("addCustomTitle")}
      </h3>

      {!city && (
        <p className="text-xs text-slate-500">{t("customCityHint")}</p>
      )}

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
            {countryOptions.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs text-slate-500">{t("locationHint")}</p>

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
          None
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

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? tCommon("loading") : tCommon("save")}
        </button>
        {!city && onBackToList && (
          <button
            type="button"
            onClick={onBackToList}
            className="rounded-lg border border-slate-700 px-5 py-2 text-sm text-slate-300 hover:border-slate-500"
          >
            {t("addFromList")}
          </button>
        )}
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
