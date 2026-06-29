/** "rust" → "Rust", "new york" → "New York" */
export function formatCityDisplayName(name: string): string {
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (!trimmed) return trimmed;

  return trimmed
    .split(" ")
    .map((word) => {
      if (!word) return word;
      const lower = word.toLocaleLowerCase("tr");
      const first = lower.charAt(0);
      if (!first) return word;
      return first.toLocaleUpperCase("tr") + lower.slice(1);
    })
    .join(" ");
}
