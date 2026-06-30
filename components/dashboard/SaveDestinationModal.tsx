"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  POPULAR_DESTINATIONS,
  type PopularDestination,
} from "@/lib/data/popular-destinations";
import { POPULAR_PARKS, type PopularPark } from "@/lib/data/popular-parks";
import { COUNTRY_LIST } from "@/lib/data/countries";
import { getPopularCountries } from "@/lib/data/popular-countries";
import {
  quickAddDestination,
  quickRemoveDestination,
} from "@/lib/client/destination-actions";
import { quickAddPark, quickRemovePark } from "@/lib/client/park-destination-actions";
import { saveDestinationMessages, destinationMessages, parkMessages } from "@/lib/i18n/client-messages";
import { countryCodeToFlagUrl } from "@/lib/utils/country-flag";
import { parkTypeLabel } from "@/lib/utils/park-type";
import { useToast } from "@/components/ui/ToastProvider";
import type { ParkType, VisitedCity, VisitedCountry, VisitedPark } from "@/types/database";

const WORLD_COUNTRY_TOTAL = 195;
const SEARCH_DEBOUNCE_MS = 280;

type SaveDestinationTab = "popular" | "countries" | "cities" | "parks";

type SearchCityResult = {
  cityName: string;
  countryCode: string;
  countryName: string;
  latitude: number;
  longitude: number;
};

type SearchParkResult = {
  parkName: string;
  parkType: ParkType;
  countryCode: string;
  countryName: string;
  latitude: number;
  longitude: number;
};

type DestinationRow =
  | {
      id: string;
      kind: "city";
      title: string;
      subtitle: string;
      countryCode: string;
      countryName: string;
      cityName: string;
      latitude: number;
      longitude: number;
    }
  | {
      id: string;
      kind: "country";
      title: string;
      subtitle: string;
      countryCode: string;
      countryName: string;
    }
  | {
      id: string;
      kind: "park";
      title: string;
      subtitle: string;
      countryCode: string;
      countryName: string;
      parkName: string;
      parkType: ParkType;
      latitude: number;
      longitude: number;
    };

type SaveDestinationModalProps = {
  open: boolean;
  onClose: () => void;
};

function destinationId(
  kind: "city" | "country" | "park",
  countryCode: string,
  name = "",
  parkType?: ParkType
): string {
  if (kind === "country") {
    return `country:${countryCode}`.toLowerCase();
  }
  if (kind === "park") {
    return `park:${countryCode}:${parkType}:${name}`.toLowerCase();
  }
  return `${countryCode}:${name}`.toLowerCase();
}

function popularToRow(destination: PopularDestination): DestinationRow {
  if (destination.kind === "country") {
    return {
      id: destinationId("country", destination.countryCode),
      kind: "country",
      title: destination.label,
      subtitle: destination.countryName,
      countryCode: destination.countryCode,
      countryName: destination.countryName,
    };
  }

  return {
    id: destinationId("city", destination.countryCode, destination.cityName),
    kind: "city",
    title: destination.label,
    subtitle: destination.countryName,
    countryCode: destination.countryCode,
    countryName: destination.countryName,
    cityName: destination.cityName,
    latitude: destination.latitude,
    longitude: destination.longitude,
  };
}

function countryToRow(country: { code: string; name: string }): DestinationRow {
  return {
    id: destinationId("country", country.code),
    kind: "country",
    title: country.name,
    subtitle: country.code,
    countryCode: country.code,
    countryName: country.name,
  };
}

function cityToRow(city: SearchCityResult): DestinationRow {
  return {
    id: destinationId("city", city.countryCode, city.cityName),
    kind: "city",
    title: city.cityName,
    subtitle: city.countryName,
    countryCode: city.countryCode,
    countryName: city.countryName,
    cityName: city.cityName,
    latitude: city.latitude,
    longitude: city.longitude,
  };
}

function parkToRow(park: SearchParkResult | PopularPark): DestinationRow {
  return {
    id: destinationId("park", park.countryCode, park.parkName, park.parkType),
    kind: "park",
    title: "label" in park ? park.label : park.parkName,
    subtitle: `${park.countryName} · ${parkTypeLabel(park.parkType)}`,
    countryCode: park.countryCode,
    countryName: park.countryName,
    parkName: park.parkName,
    parkType: park.parkType,
    latitude: park.latitude,
    longitude: park.longitude,
  };
}

function rowPayload(row: DestinationRow) {
  if (row.kind === "country") {
    return {
      kind: "country" as const,
      city_name: row.countryName,
      country_code: row.countryCode,
      country_name: row.countryName,
      latitude: 0,
      longitude: 0,
    };
  }

  if (row.kind === "city") {
    return {
      kind: "city" as const,
      city_name: row.cityName,
      country_code: row.countryCode,
      country_name: row.countryName,
      latitude: row.latitude,
      longitude: row.longitude,
    };
  }

  throw new Error("rowPayload is only for city and country rows");
}

export function SaveDestinationModal({ open, onClose }: SaveDestinationModalProps) {
  const router = useRouter();
  const toast = useToast();

  const [tab, setTab] = useState<SaveDestinationTab>("popular");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [visitedCountries, setVisitedCountries] = useState<VisitedCountry[]>([]);
  const [visitedCities, setVisitedCities] = useState<VisitedCity[]>([]);
  const [visitedParks, setVisitedParks] = useState<VisitedPark[]>([]);
  const [searchCities, setSearchCities] = useState<SearchCityResult[]>([]);
  const [searchParks, setSearchParks] = useState<SearchParkResult[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(new Set());
  const [recentlyRemoved, setRecentlyRemoved] = useState<Set<string>>(new Set());

  const loadTravelState = useCallback(async () => {
    try {
      const res = await fetch("/api/me/travel-state");
      if (!res.ok) return;
      const data = await res.json();
      setVisitedCountries(data.visitedCountries ?? []);
      setVisitedCities(data.visitedCities ?? []);
      setVisitedParks(data.visitedParks ?? []);
    } catch {
      // keep previous state
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setTab("popular");
    setSearchCities([]);
    setSearchParks([]);
    setRecentlyAdded(new Set());
    setRecentlyRemoved(new Set());
    void loadTravelState();
  }, [open, loadTravelState]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const trimmedQuery = query.trim();
  const needle = trimmedQuery.toLowerCase();

  useEffect(() => {
    if (!open || trimmedQuery.length < 2) {
      setSearchCities([]);
      setSearchParks([]);
      setLoadingSearch(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoadingSearch(true);
      try {
        const res = await fetch(
          `/api/destinations/search?q=${encodeURIComponent(trimmedQuery)}`,
          { signal: controller.signal }
        );
        if (!res.ok) {
          setSearchCities([]);
          setSearchParks([]);
          return;
        }
        const data = await res.json();
        setSearchCities(data.cities ?? []);
        setSearchParks(data.parks ?? []);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setSearchCities([]);
        setSearchParks([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoadingSearch(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [open, trimmedQuery]);

  const citiesByCountry = useMemo(() => {
    const counts = new Map<string, number>();
    for (const city of visitedCities) {
      const code = city.country_code.toUpperCase();
      counts.set(code, (counts.get(code) ?? 0) + 1);
    }
    return counts;
  }, [visitedCities]);

  const addedIds = useMemo(() => {
    const ids = new Set<string>();

    for (const country of visitedCountries) {
      const code = country.country_code.toUpperCase();
      if ((citiesByCountry.get(code) ?? 0) === 0) {
        ids.add(destinationId("country", code));
      }
    }

    for (const city of visitedCities) {
      ids.add(destinationId("city", city.country_code, city.city_name));
    }

    for (const park of visitedParks) {
      ids.add(
        destinationId("park", park.country_code, park.park_name, park.park_type as ParkType)
      );
    }

    for (const id of recentlyAdded) ids.add(id);
    for (const id of recentlyRemoved) ids.delete(id);

    return ids;
  }, [visitedCountries, visitedCities, visitedParks, citiesByCountry, recentlyAdded, recentlyRemoved]);

  const visitedCountryCount = useMemo(() => {
    const codes = new Set<string>();
    for (const country of visitedCountries) {
      codes.add(country.country_code.toUpperCase());
    }
    for (const city of visitedCities) {
      codes.add(city.country_code.toUpperCase());
    }
    return codes.size;
  }, [visitedCountries, visitedCities]);

  const rows = useMemo((): DestinationRow[] => {
    if (trimmedQuery.length >= 2) {
      const countryRows = COUNTRY_LIST.filter((country) => country.searchText.includes(needle))
        .slice(0, 8)
        .map(countryToRow);
      const cityRows = searchCities.map(cityToRow);
      const parkRows = searchParks.map(parkToRow);
      const popularRows = POPULAR_DESTINATIONS.filter((destination) =>
        `${destination.label} ${destination.cityName} ${destination.countryName} ${destination.countryCode}`
          .toLowerCase()
          .includes(needle)
      ).map(popularToRow);

      const popularParkRows = POPULAR_PARKS.filter((park) =>
        `${park.label} ${park.parkName} ${park.countryName} ${park.countryCode}`
          .toLowerCase()
          .includes(needle)
      ).map(parkToRow);

      const merged = new Map<string, DestinationRow>();
      for (const row of [...popularRows, ...popularParkRows, ...cityRows, ...parkRows, ...countryRows]) {
        merged.set(row.id, row);
      }
      return [...merged.values()];
    }

    if (tab === "countries") {
      return getPopularCountries(40).map(countryToRow);
    }

    if (tab === "cities") {
      return POPULAR_DESTINATIONS.filter((destination) => destination.kind === "city")
        .slice(0, 40)
        .map(popularToRow);
    }

    if (tab === "parks") {
      return POPULAR_PARKS.slice(0, 40).map(parkToRow);
    }

    return POPULAR_DESTINATIONS.slice(0, 40).map(popularToRow);
  }, [needle, searchCities, searchParks, tab, trimmedQuery.length]);

  async function handleToggle(row: DestinationRow) {
    const id = row.id;
    if (busyId) return;

    const added = addedIds.has(id);
    setBusyId(id);

    try {
      if (row.kind === "park") {
        const parkPayload = {
          park_name: row.parkName,
          park_type: row.parkType,
          country_code: row.countryCode,
          country_name: row.countryName,
          latitude: row.latitude,
          longitude: row.longitude,
        };

        if (added) {
          const result = await quickRemovePark(parkPayload);
          if (!result.ok) {
            toast.show(result.error, 2500);
            return;
          }
          if (!result.removed) return;
          setRecentlyAdded((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          setRecentlyRemoved((prev) => new Set(prev).add(id));
          toast.show(parkMessages.removedToast, 1000);
        } else {
          const result = await quickAddPark(parkPayload);
          if (!result.ok) {
            toast.show(result.error, 2500);
            return;
          }
          setRecentlyRemoved((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          setRecentlyAdded((prev) => new Set(prev).add(id));
          if (result.added) {
            toast.show(parkMessages.addedToast, 1000);
          }
        }
      } else if (added) {
        const result = await quickRemoveDestination(rowPayload(row));
        if (!result.ok) {
          toast.show(result.error, 2500);
          return;
        }
        if (!result.removed) return;
        setRecentlyAdded((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setRecentlyRemoved((prev) => new Set(prev).add(id));
        toast.show(destinationMessages.removedToast, 1000);
      } else {
        const result = await quickAddDestination(rowPayload(row));
        if (!result.ok) {
          toast.show(result.error, 2500);
          return;
        }
        setRecentlyRemoved((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setRecentlyAdded((prev) => new Set(prev).add(id));
        if (result.added) {
          toast.show(destinationMessages.addedToast, 1000);
        }
      }

      router.refresh();
      void loadTravelState();
    } finally {
      setBusyId(null);
    }
  }

  if (!open) return null;

  const tabs: { id: SaveDestinationTab; label: string; icon: string }[] = [
    { id: "popular", label: saveDestinationMessages.tabPopular, icon: "🧳" },
    { id: "countries", label: saveDestinationMessages.tabCountries, icon: "🌍" },
    { id: "cities", label: saveDestinationMessages.tabCities, icon: "📍" },
    { id: "parks", label: saveDestinationMessages.tabParks, icon: "🏞️" },
  ];

  return (
    <div className="save-destination-modal" role="presentation">
      <button
        type="button"
        className="save-destination-modal__backdrop"
        aria-label={saveDestinationMessages.close}
        onClick={onClose}
      />

      <div
        className="save-destination-modal__sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-destination-title"
      >
        <div className="save-destination-modal__header">
          <div>
            <h2 id="save-destination-title" className="save-destination-modal__title">
              {saveDestinationMessages.title}
            </h2>
            <p className="save-destination-modal__subtitle">{saveDestinationMessages.subtitle}</p>
          </div>
          <button
            type="button"
            className="save-destination-modal__close"
            onClick={onClose}
            aria-label={saveDestinationMessages.close}
          >
            ✕
          </button>
        </div>

        <div className="save-destination-modal__search-wrap">
          <span className="save-destination-modal__search-icon" aria-hidden>
            <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={saveDestinationMessages.searchPlaceholder}
            className="save-destination-modal__search"
            autoComplete="off"
          />
        </div>

        {trimmedQuery.length < 2 ? (
          <div className="save-destination-modal__tabs" role="tablist">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                className={`save-destination-modal__tab${tab === item.id ? " save-destination-modal__tab--active" : ""}`}
                onClick={() => setTab(item.id)}
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="save-destination-modal__status">
          {saveDestinationMessages.visitedCount
            .replace("{visited}", String(visitedCountryCount))
            .replace("{total}", String(WORLD_COUNTRY_TOTAL))}
        </div>

        <ul className="save-destination-modal__list scrollbar-thin">
          {loadingSearch && trimmedQuery.length >= 2 ? (
            <li className="save-destination-modal__empty">{saveDestinationMessages.loading}</li>
          ) : rows.length === 0 ? (
            <li className="save-destination-modal__empty">{saveDestinationMessages.empty}</li>
          ) : (
            rows.map((row) => {
              const added = addedIds.has(row.id);
              const busy = busyId === row.id;

              return (
                <li key={row.id}>
                  <button
                    type="button"
                    className="save-destination-modal__row"
                    disabled={busy}
                    onClick={() => void handleToggle(row)}
                  >
                    <span className="save-destination-modal__flag">
                      <Image
                        src={countryCodeToFlagUrl(row.countryCode)}
                        alt=""
                        width={28}
                        height={28}
                        className="rounded-full object-cover"
                      />
                    </span>
                    <span className="save-destination-modal__text">
                      <span className="save-destination-modal__name">{row.title}</span>
                      <span className="save-destination-modal__meta">{row.subtitle}</span>
                    </span>
                    <span
                      className={`save-destination-modal__check${added ? " save-destination-modal__check--on" : ""}`}
                      aria-hidden
                    >
                      {added ? "✓" : "+"}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
