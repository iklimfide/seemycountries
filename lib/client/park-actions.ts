import type { ParkBatchInput } from "@/lib/validations/park";
import type { ParkInput } from "@/lib/validations/park";

export async function addPark(
  payload: Pick<ParkInput, "park_name" | "park_type" | "country_code" | "country_name"> &
    Partial<Pick<ParkInput, "latitude" | "longitude" | "note" | "media_type" | "media_url">>
): Promise<{ ok: true; park: unknown } | { ok: false; error: string }> {
  const res = await fetch("/api/parks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: (data.error as string) ?? "Failed to add park" };
  }

  return { ok: true, park: await res.json() };
}

export async function addParksBatch(
  payload: ParkBatchInput
): Promise<
  | { ok: true; added: number; skipped: number }
  | { ok: false; error: string }
> {
  const res = await fetch("/api/parks/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: (data.error as string) ?? "Failed to add parks" };
  }

  const data = await res.json();
  return {
    ok: true,
    added: (data.added as number) ?? 0,
    skipped: (data.skipped as number) ?? 0,
  };
}
