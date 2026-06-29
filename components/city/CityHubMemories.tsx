"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { InstagramMemoryThumb } from "@/components/city/InstagramMemoryThumb";
import { InstagramEmbed } from "@/components/media/InstagramEmbed";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { formatVisitDatesList } from "@/lib/utils/visit-date";
import { getIntlLocale } from "@/lib/i18n/config";
import type { CityTravelerPin } from "@/lib/supabase/city-travelers";

type CityHubMemoriesProps = {
  cityName: string;
  pins: CityTravelerPin[];
  labels: {
    heading: string;
    viewMap: string;
    viewPin: string;
    close: string;
    instagramPost: string;
  };
};

function MemoryLightbox({
  pin,
  cityName,
  labels,
  onClose,
}: {
  pin: CityTravelerPin;
  cityName: string;
  labels: CityHubMemoriesProps["labels"];
  onClose: () => void;
}) {
  const visitDatesLabel =
    pin.visitDates.length > 0
      ? formatVisitDatesList(pin.visitDates, getIntlLocale())
      : null;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="city-page__memory-lightbox"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="city-memory-lightbox-title"
    >
      <div className="city-page__memory-lightbox-panel" onClick={(e) => e.stopPropagation()}>
        <div className="city-page__memory-lightbox-header">
          <Link href={pin.profilePath} className="city-page__traveler-link">
            <ProfileAvatar
              avatarUrl={pin.avatarUrl}
              displayName={pin.displayName}
              username={pin.username}
              size="sm"
            />
            <div className="min-w-0">
              <p id="city-memory-lightbox-title" className="city-page__traveler-name">
                {pin.displayName}
              </p>
              <p className="city-page__traveler-handle">@{pin.username}</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="city-page__memory-lightbox-close"
            aria-label={labels.close}
          >
            ✕
          </button>
        </div>

        {pin.mediaType === "photo" && pin.mediaUrl ? (
          <div className="city-page__memory-lightbox-media">
            <Image
              src={pin.mediaUrl}
              alt={`${cityName} — ${pin.displayName}`}
              width={900}
              height={675}
              className="city-page__memory-lightbox-photo"
              sizes="(max-width: 448px) 100vw, 448px"
            />
          </div>
        ) : null}

        {pin.mediaType === "instagram" && pin.mediaUrl ? (
          <div className="city-page__memory-lightbox-media city-page__memory-lightbox-media--instagram">
            <InstagramEmbed
              postUrl={pin.mediaUrl}
              title={`${cityName} — ${pin.displayName} on Instagram`}
            />
          </div>
        ) : null}

        {pin.note ? <p className="city-page__memory-lightbox-note">{pin.note}</p> : null}
        {visitDatesLabel ? (
          <p className="city-page__memory-lightbox-dates">{visitDatesLabel}</p>
        ) : null}

        <div className="city-page__memory-lightbox-footer">
          <Link href={pin.profilePath} className="city-page__memory-map-link">
            {labels.viewMap}
          </Link>
        </div>
      </div>
    </div>
  );
}

export function CityHubMemories({ cityName, pins, labels }: CityHubMemoriesProps) {
  const [expandedPin, setExpandedPin] = useState<CityTravelerPin | null>(null);

  if (pins.length === 0) return null;

  return (
    <>
      <section className="city-page__section" aria-labelledby="city-memories-heading">
        <h2 id="city-memories-heading" className="city-page__section-title">
          {labels.heading}
        </h2>
        <ul className="city-page__memories">
          {pins.map((pin) => {
            const visitDatesLabel =
              pin.visitDates.length > 0
                ? formatVisitDatesList(pin.visitDates, getIntlLocale())
                : null;
            const hasMedia = Boolean(pin.mediaUrl);
            const canExpand = hasMedia || Boolean(pin.note?.trim());

            return (
              <li key={pin.id} className="city-page__memory">
                {hasMedia ? (
                  <button
                    type="button"
                    className="city-page__memory-thumb-btn"
                    onClick={() => setExpandedPin(pin)}
                    aria-label={`${labels.viewPin} — ${pin.displayName}`}
                  >
                    {pin.mediaType === "photo" && pin.mediaUrl ? (
                      <Image
                        src={pin.mediaUrl}
                        alt=""
                        width={112}
                        height={112}
                        className="city-page__memory-thumb-image"
                        sizes="112px"
                      />
                    ) : null}
                    {pin.mediaType === "instagram" && pin.mediaUrl ? (
                      <InstagramMemoryThumb
                        postUrl={pin.mediaUrl}
                        alt={`${cityName} — ${pin.displayName}`}
                        instagramLabel={labels.instagramPost}
                      />
                    ) : null}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="city-page__memory-thumb-btn city-page__memory-thumb-btn--note"
                    onClick={() => canExpand && setExpandedPin(pin)}
                    disabled={!canExpand}
                    aria-label={`${labels.viewPin} — ${pin.displayName}`}
                  >
                    <span className="city-page__memory-thumb-note-preview">
                      {pin.note?.trim() ?? ""}
                    </span>
                  </button>
                )}

                <div className="city-page__memory-body">
                  <Link href={pin.profilePath} className="city-page__memory-author">
                    <ProfileAvatar
                      avatarUrl={pin.avatarUrl}
                      displayName={pin.displayName}
                      username={pin.username}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="city-page__traveler-name">{pin.displayName}</p>
                      <p className="city-page__traveler-handle">@{pin.username}</p>
                    </div>
                  </Link>

                  {pin.note && hasMedia ? (
                    <p className="city-page__memory-note-preview">{pin.note}</p>
                  ) : null}

                  {visitDatesLabel ? (
                    <p className="city-page__memory-dates-preview">{visitDatesLabel}</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {expandedPin ? (
        <MemoryLightbox
          pin={expandedPin}
          cityName={cityName}
          labels={labels}
          onClose={() => setExpandedPin(null)}
        />
      ) : null}
    </>
  );
}
