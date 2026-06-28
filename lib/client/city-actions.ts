import type { CityBatchInput } from "@/lib/validations/city-batch";

export async function addCitiesBatch(
  payload: CityBatchInput
): Promise<
  | { ok: true; added: number; skipped: number }
  | { ok: false; error: string }
> {
  const res = await fetch("/api/cities/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: (data.error as string) ?? "Failed to add cities" };
  }

  const data = await res.json();
  return {
    ok: true,
    added: (data.added as number) ?? 0,
    skipped: (data.skipped as number) ?? 0,
  };
}
