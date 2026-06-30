/** Lowercase trimmed username for validation, URLs, and uniqueness checks. */
export function normalizeUsernameInput(username: string): string {
  return username.toLowerCase().trim();
}
