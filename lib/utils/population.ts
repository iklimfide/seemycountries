export function formatPopulation(population: number): string {
  if (population >= 1_000_000) {
    const millions = population / 1_000_000;
    return millions >= 10
      ? `${Math.round(millions)}M`
      : `${millions.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (population >= 1_000) {
    return `${Math.round(population / 1_000)}K`;
  }
  return population.toLocaleString("en-US");
}
