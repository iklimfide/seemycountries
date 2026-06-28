"use client";

import { ContinentSelect } from "@/components/map/ContinentSelect";
import type { ContinentId } from "@/lib/map/continents";

type MapContinentControlProps = {
  continent: ContinentId;
  onChange: (continent: ContinentId) => void;
};

export function MapContinentControl({ continent, onChange }: MapContinentControlProps) {
  return (
    <div className="w-full">
      <ContinentSelect value={continent} onChange={onChange} />
    </div>
  );
}
