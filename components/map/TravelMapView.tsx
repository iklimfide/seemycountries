"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { WorldMap } from "@/components/map/WorldMap";
import { CountryPopup } from "@/components/map/CountryPopup";
import { CityPopup } from "@/components/map/CityPopup";
import { MapContinentControl } from "@/components/map/MapContinentControl";
import { MapCountrySearch } from "@/components/map/MapCountrySearch";
import { MapLegend } from "@/components/map/MapLegend";
import { useOptionalMapFocus, type MapFocusTarget } from "@/components/map/MapFocusContext";
import { useModal } from "@/components/ui/ModalProvider";
import { useToast } from "@/components/ui/ToastProvider";
import {
  addVisitedCountry,
  addWishlistCountry,
  removeVisitedCountry,
  removeWishlistCountry,
} from "@/lib/client/country-actions";
import { countryMessages, mapMessages } from "@/lib/i18n/client-messages";
import { getCountryContinent, type ContinentId } from "@/lib/map/continents";
import type { VisitedCity, VisitedCountry, WishlistCountry } from "@/types/database";

type CountrySelection = {
  code: string;
  name: string;
};

type TravelMapViewProps = {
  visitedCountryCodes: string[];
  wishlistCountryCodes?: string[];
  visitedCountries?: VisitedCountry[];
  wishlistCountries?: WishlistCountry[];
  userCities?: VisitedCity[];
  citiesCountryCodes?: string[];
  isLoggedIn?: boolean;
  interactive?: boolean;
  explorable?: boolean;
  showContinentFilter?: boolean;
};

export function TravelMapView({
  visitedCountryCodes,
  wishlistCountryCodes = [],
  visitedCountries = [],
  wishlistCountries = [],
  userCities = [],
  citiesCountryCodes = [],
  isLoggedIn = false,
  interactive = true,
  explorable = false,
  showContinentFilter = false,
}: TravelMapViewProps) {
  const router = useRouter();
  const modal = useModal();
  const toast = useToast();
  const mapFocus = useOptionalMapFocus();
  const [selectedCountry, setSelectedCountry] = useState<CountrySelection | null>(null);
  const [selectedCity, setSelectedCity] = useState<VisitedCity | null>(null);
  const [continent, setContinent] = useState<ContinentId>("world");
  const [focusRequest, setFocusRequest] = useState<{ code: string; nonce: number } | null>(
    null
  );
  const [pinnedCountryCode, setPinnedCountryCode] = useState<string | null>(null);
  const [cityPickerFirst, setCityPickerFirst] = useState(false);
  const [busyCode, setBusyCode] = useState<string | null>(null);
  const [optimisticVisitedCodes, setOptimisticVisitedCodes] = useState<Set<string>>(
    () => new Set()
  );
  const showWishlist = wishlistCountryCodes.length > 0;

  const visitedCodeSet = useMemo(() => {
    const codes = new Set(visitedCountryCodes.map((c) => c.toUpperCase()));
    for (const code of optimisticVisitedCodes) {
      codes.add(code);
    }
    return codes;
  }, [visitedCountryCodes, optimisticVisitedCodes]);

  const wishlistCodeSet = useMemo(
    () => new Set(wishlistCountryCodes.map((c) => c.toUpperCase())),
    [wishlistCountryCodes]
  );

  const citiesCodeSet = useMemo(
    () => new Set(citiesCountryCodes.map((c) => c.toUpperCase())),
    [citiesCountryCodes]
  );

  const visitedByCode = useMemo(() => {
    const map = new Map<string, VisitedCountry>();
    for (const country of visitedCountries) {
      map.set(country.country_code.toUpperCase(), country);
    }
    return map;
  }, [visitedCountries]);

  const wishlistByCode = useMemo(() => {
    const map = new Map<string, WishlistCountry>();
    for (const country of wishlistCountries) {
      map.set(country.country_code.toUpperCase(), country);
    }
    return map;
  }, [wishlistCountries]);

  const selectedStatus = useMemo(() => {
    if (!selectedCountry) return null;

    const code = selectedCountry.code.toUpperCase();
    const visitedRecord = visitedByCode.get(code);
    const wishlistRecord = wishlistByCode.get(code);
    const isVisitedOnMap = visitedCodeSet.has(code);
    const isUserVisited =
      Boolean(visitedRecord) ||
      optimisticVisitedCodes.has(code) ||
      (isVisitedOnMap && citiesCodeSet.has(code));
    const visitedViaCitiesOnly = isVisitedOnMap && !visitedRecord && citiesCodeSet.has(code);
    const isUserWishlist = wishlistCodeSet.has(code) && !isUserVisited;

    return {
      code,
      isVisitedOnMap,
      isUserVisited,
      isUserWishlist,
      visitedId: visitedRecord?.id,
      wishlistId: wishlistRecord?.id,
      visitedViaCitiesOnly,
      canPickCities: isLoggedIn && isUserVisited,
    };
  }, [
    selectedCountry,
    visitedByCode,
    wishlistByCode,
    visitedCodeSet,
    wishlistCodeSet,
    citiesCodeSet,
    optimisticVisitedCodes,
    isLoggedIn,
  ]);

  const existingCityNamesForSelected = useMemo(() => {
    if (!selectedStatus) return [];
    return userCities
      .filter((city) => city.country_code.toUpperCase() === selectedStatus.code)
      .map((city) => city.city_name);
  }, [selectedStatus, userCities]);

  const requireLogin = () => {
    toast.show(mapMessages.loginToMark);
  };

  const handleCountryClick = (country: CountrySelection) => {
    setCityPickerFirst(false);
    setSelectedCountry(country);
    setPinnedCountryCode(country.code);
  };

  const handleVisitedChange = async (checked: boolean) => {
    if (!selectedStatus || !selectedCountry) return;
    if (!isLoggedIn) {
      requireLogin();
      return;
    }
    if (busyCode) return;

    setBusyCode(selectedStatus.code);

    try {
      if (checked) {
        const result = await addVisitedCountry(selectedStatus.code);
        if (!result.ok) {
          await modal.alert(result.error, { variant: "error" });
          return;
        }
        setOptimisticVisitedCodes((prev) => new Set(prev).add(selectedStatus.code));
        setCityPickerFirst(true);
      } else {
        if (selectedStatus.visitedViaCitiesOnly) {
          await modal.alert(countryMessages.removeCitiesFirst, { variant: "info" });
          return;
        }
        if (!selectedStatus.visitedId) return;

        const result = await removeVisitedCountry(selectedStatus.visitedId);
        if (!result.ok) {
          await modal.alert(result.error, { variant: "error" });
          return;
        }
        setOptimisticVisitedCodes((prev) => {
          const next = new Set(prev);
          next.delete(selectedStatus.code);
          return next;
        });
      }

      router.refresh();
    } finally {
      setBusyCode(null);
    }
  };

  const handleWishlistChange = async (checked: boolean) => {
    if (!selectedStatus) return;
    if (!isLoggedIn) {
      requireLogin();
      return;
    }
    if (busyCode || selectedStatus.isUserVisited) return;

    setBusyCode(selectedStatus.code);

    try {
      if (checked) {
        const result = await addWishlistCountry(selectedStatus.code);
        if (!result.ok) {
          await modal.alert(result.error, { variant: "error" });
          return;
        }
      } else {
        if (!selectedStatus.wishlistId) return;

        const result = await removeWishlistCountry(selectedStatus.wishlistId);
        if (!result.ok) {
          await modal.alert(result.error, { variant: "error" });
          return;
        }
      }

      router.refresh();
    } finally {
      setBusyCode(null);
    }
  };

  const handleCitiesAdded = () => {
    router.refresh();
    setSelectedCountry(null);
    setPinnedCountryCode(null);
    setCityPickerFirst(false);
  };

  const handleCountrySearch = (country: { code: string; name: string }) => {
    focusCountryOnMap(country);
  };

  const focusCountryOnMap = useCallback(
    (country: MapFocusTarget) => {
      const code = country.code.toUpperCase();
      const countryContinent = getCountryContinent(code);
      setCityPickerFirst(false);
      setPinnedCountryCode(code);
      if (explorable) {
        setSelectedCountry({ code, name: country.name });
      }
      if (countryContinent) {
        setContinent(countryContinent);
      }
      setFocusRequest({ code, nonce: Date.now() });
    },
    [explorable]
  );

  useEffect(() => {
    if (!mapFocus) return;
    mapFocus.registerFocusHandler(focusCountryOnMap);
    return () => mapFocus.registerFocusHandler(null);
  }, [focusCountryOnMap, mapFocus]);

  return (
    <>
      <div
        id="travel-map"
        className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 scroll-mt-24"
      >
        {showContinentFilter && (
          <>
            <MapContinentControl
              continent={continent}
              onChange={(next) => {
                setContinent(next);
                setPinnedCountryCode(null);
              }}
            />
            <div className="absolute right-3 top-3 z-10 w-[min(100%-1.5rem,14rem)] sm:w-52">
              <MapCountrySearch onSelect={handleCountrySearch} />
            </div>
          </>
        )}
        <WorldMap
          visitedCountryCodes={[...visitedCodeSet]}
          wishlistCountryCodes={wishlistCountryCodes}
          userCities={userCities}
          onCountryClick={explorable ? handleCountryClick : undefined}
          onCityClick={userCities.length > 0 ? (city) => setSelectedCity(city) : undefined}
          interactive={interactive}
          explorable={explorable}
          continent={continent}
          focusRequest={focusRequest}
          onFocusComplete={() => setFocusRequest(null)}
          pinnedCountryCode={pinnedCountryCode}
        />
      </div>
      {explorable && (
        <p className="mt-2 hidden text-center text-xs text-slate-500 sm:block">
          {showContinentFilter ? mapMessages.demoExploreHint : mapMessages.exploreHint}
        </p>
      )}
      <MapLegend showWishlist={showWishlist} />
      {selectedCountry && selectedStatus && (
        <CountryPopup
          countryName={selectedCountry.name}
          countryCode={selectedCountry.code}
          isVisited={isLoggedIn ? selectedStatus.isUserVisited : selectedStatus.isVisitedOnMap}
          isWishlist={
            isLoggedIn
              ? selectedStatus.isUserWishlist
              : wishlistCodeSet.has(selectedStatus.code) && !selectedStatus.isVisitedOnMap
          }
          visitedViaCitiesOnly={selectedStatus.visitedViaCitiesOnly}
          busy={busyCode === selectedStatus.code}
          showCityPicker={selectedStatus.canPickCities}
          existingCityNames={existingCityNamesForSelected}
          onVisitedChange={handleVisitedChange}
          onWishlistChange={handleWishlistChange}
          onCitiesAdded={handleCitiesAdded}
          cityPickerFirst={cityPickerFirst}
          onClose={() => {
            setSelectedCountry(null);
            setPinnedCountryCode(null);
            setCityPickerFirst(false);
          }}
        />
      )}
      {selectedCity && (
        <CityPopup city={selectedCity} onClose={() => setSelectedCity(null)} />
      )}
    </>
  );
}
