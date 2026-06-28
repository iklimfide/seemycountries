export type Theme = "light" | "dark";

export function parseTheme(value: string | null | undefined): Theme {
  if (value === "dark") return "dark";
  return "light";
}

export function themeCookieValue(theme: Theme): string {
  return `theme=${theme};path=/;max-age=31536000;SameSite=Lax`;
}
