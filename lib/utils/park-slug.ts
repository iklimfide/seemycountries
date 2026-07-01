const SLUG_PATTERN = /^[a-z0-9-]{1,80}$/;

export function buildParkSlug(parkName: string, countryCode: string): string {
  const namePart = parkName
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const codePart = countryCode.trim().toLowerCase();
  return `${namePart}-${codePart}`;
}

export function sanitizeParkSlug(raw: string | null | undefined): string | null {
  if (raw == null) return null;

  let value = raw;
  try {
    value = decodeURIComponent(raw);
  } catch {
    return null;
  }

  value = value.trim().toLowerCase();

  if (!value || value.includes("..") || value.includes("/") || value.includes("\\")) {
    return null;
  }

  if (!SLUG_PATTERN.test(value)) return null;

  return value;
}
