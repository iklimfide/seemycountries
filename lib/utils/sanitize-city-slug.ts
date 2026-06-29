const SLUG_PATTERN = /^[a-z0-9-]{1,50}$/;

export function sanitizeCitySlug(raw: string | null | undefined): string | null {
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
