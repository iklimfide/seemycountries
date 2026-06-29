/** Prevent hung Supabase requests from blocking SSR for minutes. */
export const SUPABASE_FETCH_TIMEOUT_MS = 8_000;

export function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  return fetch(input, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(SUPABASE_FETCH_TIMEOUT_MS),
  });
}
