import { getIntlLocale } from "@/lib/i18n/config";

const YEAR_MONTH_RE = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function isValidVisitYearMonth(value: string): boolean {
  return YEAR_MONTH_RE.test(value);
}

/** Parse YYYY-MM to a local Date (1st of month). */
export function visitYearMonthToDate(yearMonth: string): Date | null {
  const match = YEAR_MONTH_RE.exec(yearMonth);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  return new Date(year, month - 1, 1);
}

/** Display as "November 2024" (month name + year). */
export function formatVisitMonthYear(
  yearMonth: string,
  locale = getIntlLocale()
): string {
  const date = visitYearMonthToDate(yearMonth);
  if (!date) return yearMonth;
  const formatted = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(date);
  return formatted.charAt(0).toLocaleUpperCase(locale) + formatted.slice(1);
}

export function normalizeVisitDates(dates: string[]): string[] {
  const unique = [...new Set(dates.filter(isValidVisitYearMonth))];
  return unique.sort((a, b) => b.localeCompare(a));
}

export function formatVisitDatesList(dates: string[], locale: string): string {
  return normalizeVisitDates(dates)
    .map((d) => formatVisitMonthYear(d, locale))
    .join(", ");
}

export function formatVisitDatesSummary(
  dates: string[],
  formatVisitCount: (count: number) => string,
  locale = getIntlLocale()
): string | null {
  const normalized = normalizeVisitDates(dates);
  if (normalized.length === 0) return null;

  const formatted = formatVisitDatesList(normalized, locale);
  if (normalized.length === 1) return formatted;

  return `${formatVisitCount(normalized.length)} · ${formatted}`;
}

export function visitDatesCount(dates: string[] | undefined | null): number {
  return normalizeVisitDates(dates ?? []).length;
}

/** Total visits for a pinned city (at least one when on the map). */
export function cityVisitCount(city: { visit_dates?: string[] | null }): number {
  const dated = visitDatesCount(city.visit_dates);
  return dated > 0 ? dated : 1;
}
