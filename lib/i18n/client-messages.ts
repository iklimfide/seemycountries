import enMessages from "@/messages/en.json";

/** Static copy for client map components (English-only; avoids NextIntl provider edge cases). */
export const mapMessages = enMessages.map;
export const countryMessages = enMessages.country;
export const cityMessages = enMessages.city;
export const wishlistMessages = enMessages.wishlist;
export const popupMessages = enMessages.popup;
export const homeMessages = enMessages.home;
export const shareMessages = enMessages.share;

export function formatMessage(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in values ? String(values[key]) : `{${key}}`
  );
}
