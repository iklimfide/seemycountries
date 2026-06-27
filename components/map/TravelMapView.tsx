"use client";

import { useState } from "react";
import { WorldMap } from "@/components/map/WorldMap";
import { CityPopup } from "@/components/map/CityPopup";
import type { VisitedCity } from "@/types/database";

type TravelMapViewProps = {
  cities: VisitedCity[];
  visitedCountryCodes: string[];
  interactive?: boolean;
};

export function TravelMapView({
  cities,
  visitedCountryCodes,
  interactive = true,
}: TravelMapViewProps) {
  const [selectedCity, setSelectedCity] = useState<VisitedCity | null>(null);

  return (
    <>
      <WorldMap
        cities={cities}
        visitedCountryCodes={visitedCountryCodes}
        onCityClick={interactive ? setSelectedCity : undefined}
        interactive={interactive}
      />
      {selectedCity && (
        <CityPopup city={selectedCity} onClose={() => setSelectedCity(null)} />
      )}
    </>
  );
}
