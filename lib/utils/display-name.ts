/** First letter uppercase for profile display names (e.g. fitalya → Fitalya). */
export function formatDisplayName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function resolveProfileDisplayName(
  displayName: string | null | undefined,
  username: string
): string {
  const raw = displayName?.trim() || username;
  return formatDisplayName(raw);
}
