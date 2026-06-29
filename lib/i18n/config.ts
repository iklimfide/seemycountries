export const locales = ["en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

const intlLocaleByAppLocale: Record<Locale, string> = {
  en: "en-US",
};

/** BCP 47 locale for Intl (month names, date formatting). */
export function getIntlLocale(locale: Locale = defaultLocale): string {
  return intlLocaleByAppLocale[locale] ?? locale;
}
