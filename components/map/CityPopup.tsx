"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { popupMessages } from "@/lib/i18n/client-messages";
import { toInstagramEmbedUrl } from "@/lib/utils/instagram";
import { formatVisitDatesList } from "@/lib/utils/visit-date";
import { getIntlLocale } from "@/lib/i18n/config";
import type { VisitedCity } from "@/types/database";

type CityPopupProps = {
  city: VisitedCity;
  onClose: () => void;
};

export function CityPopup({ city, onClose }: CityPopupProps) {
  const embedContainerRef = useRef<HTMLDivElement>(null);
  const visitDatesLabel =
    city.visit_dates && city.visit_dates.length > 0
      ? formatVisitDatesList(city.visit_dates, getIntlLocale())
      : null;

  useEffect(() => {
    if (city.media_type !== "instagram" || !city.media_url) return;

    const embedUrl = toInstagramEmbedUrl(city.media_url);
    if (!embedUrl || !embedContainerRef.current) return;

    const iframe = document.createElement("iframe");
    iframe.src = embedUrl;
    iframe.className = "h-full w-full border-0";
    iframe.loading = "lazy";
    iframe.title = `${city.city_name} Instagram post`;
    iframe.allow = "encrypted-media";
    iframe.setAttribute("referrerPolicy", "no-referrer-when-downgrade");

    embedContainerRef.current.innerHTML = "";
    embedContainerRef.current.appendChild(iframe);

    return () => {
      if (embedContainerRef.current) {
        embedContainerRef.current.innerHTML = "";
      }
    };
  }, [city]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="city-popup-title"
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
          <div>
            <h2 id="city-popup-title" className="text-lg font-semibold text-white">
              {city.city_name}
            </h2>
            <p className="text-sm text-slate-400">{city.country_name}</p>
            {visitDatesLabel ? (
              <p className="mt-1 text-sm text-blue-300/90">{visitDatesLabel}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label={popupMessages.close}
          >
            ✕
          </button>
        </div>

        {city.media_type === "photo" && city.media_url && (
          <div className="relative aspect-[4/3] w-full bg-slate-800">
            <Image
              src={city.media_url}
              alt={`${city.city_name}, ${city.country_name}`}
              fill
              className="object-cover"
              sizes="(max-width: 448px) 100vw, 448px"
            />
          </div>
        )}

        {city.media_type === "instagram" && city.media_url && (
          <div
            ref={embedContainerRef}
            className="aspect-square w-full bg-slate-800"
          />
        )}

        {city.note && (
          <div className="max-h-40 overflow-y-auto px-5 py-4 text-sm leading-relaxed text-slate-300 scrollbar-thin">
            <p className="whitespace-pre-wrap">{city.note}</p>
          </div>
        )}
      </div>
    </div>
  );
}
