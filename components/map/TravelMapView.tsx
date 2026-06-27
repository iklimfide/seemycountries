"use client";

import { useState } from "react";
import { WorldMap } from "@/components/map/WorldMap";
import { CityPopup } from "@/components/map/CityPopup";
import { MapLegend } from "@/components/map/MapLegend";
import type { VisitedCity } from "@/types/database";

type TravelMapViewProps = {
  cities: VisitedCity[];
  visitedCountryCodes: string[];
  wishlistCountryCodes?: string[];
  interactive?: boolean;
};

export function TravelMapView({
  cities,
  visitedCountryCodes,
  wishlistCountryCodes = [],
  interactive = true,
}: TravelMapViewProps) {
  const [selectedCity, setSelectedCity] = useState<VisitedCity | null>(null);
  const showWishlist = wishlistCountryCodes.length > 0;

  return (
    <>
      <WorldMap
        cities={cities}
        visitedCountryCodes={visitedCountryCodes}
        wishlistCountryCodes={wishlistCountryCodes}
        onCityClick={interactive ? setSelectedCity : undefined}
        interactive={interactive}
      />
      <MapLegend showWishlist={showWishlist} />
      {selectedCity && (
        <CityPopup city={selectedCity} onClose={() => setSelectedCity(null)} />
      )}
    </>
  );
}
