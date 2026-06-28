"use client";

import { ContinentSelect } from "@/components/map/ContinentSelect";
import type { ContinentId } from "@/lib/map/continents";

type MapContinentControlProps = {
  continent: ContinentId;
  onChange: (continent: ContinentId) => void;
};

export function MapContinentControl({ continent, onChange }: MapContinentControlProps) {
  return (
    <div className="absolute left-3 top-3 z-10 w-[min(100%-1.5rem,14rem)] sm:w-52">
      <ContinentSelect value={continent} onChange={onChange} />
    </div>
  );
}
