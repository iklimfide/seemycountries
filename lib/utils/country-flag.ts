/** Self-hosted SVG flag path (see scripts/copy-country-flags.mjs). */
export function countryCodeToFlagUrl(code: string): string {
  const normalized = code.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) return "";
  return `/flags/${normalized}.svg`;
}
