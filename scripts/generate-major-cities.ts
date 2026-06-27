import cities from "all-the-cities";
import fs from "fs";
import path from "path";
import { LIMITS } from "../lib/constants";

const MIN_POPULATION = LIMITS.minCityPopulation;
const out: Record<
  string,
  Array<{ name: string; latitude: number; longitude: number; population: number }>
> = {};

for (const city of cities) {
  if (city.population < MIN_POPULATION) continue;
  const code = city.country;
  if (!out[code]) out[code] = [];
  out[code].push({
    name: city.name,
    latitude: city.loc.coordinates[1],
    longitude: city.loc.coordinates[0],
    population: city.population,
  });
}

for (const code of Object.keys(out)) {
  out[code].sort((a, b) => b.population - a.population || a.name.localeCompare(b.name));
}

const target = path.join(process.cwd(), "lib/data/major-cities.json");
fs.writeFileSync(target, JSON.stringify(out));

const total = Object.values(out).flat().length;
console.log(`Wrote ${Object.keys(out).length} countries, ${total} cities to ${target}`);
