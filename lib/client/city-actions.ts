import type { CityBatchInput } from "@/lib/validations/city-batch";
import type { CityInput } from "@/lib/validations/city";

export async function addCity(
  payload: Pick<CityInput, "city_name" | "country_code" | "country_name"> &
    Partial<Pick<CityInput, "latitude" | "longitude">>
): Promise<{ ok: true; city: unknown } | { ok: false; error: string }> {
  const res = await fetch("/api/cities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: (data.error as string) ?? "Failed to add city" };
  }

  const city = await res.json();
  return { ok: true, city };
}

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
