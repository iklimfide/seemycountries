import type { QuickParkInput } from "@/lib/validations/park";

export async function quickAddPark(
  payload: QuickParkInput
): Promise<
  | { ok: true; added: boolean; alreadyHad: boolean }
  | { ok: false; error: string }
> {
  const res = await fetch("/api/parks/quick-add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: (data.error as string) ?? "Failed to add park" };
  }

  const data = await res.json();
  return {
    ok: true,
    added: Boolean(data.added),
    alreadyHad: Boolean(data.alreadyHad),
  };
}

export async function quickRemovePark(
  payload: Pick<QuickParkInput, "park_name" | "park_type" | "country_code">
): Promise<
  | { ok: true; removed: boolean; countryRemoved: boolean }
  | { ok: false; error: string }
> {
  const res = await fetch("/api/parks/quick-remove", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: (data.error as string) ?? "Failed to remove park" };
  }

  const data = await res.json();
  return {
    ok: true,
    removed: Boolean(data.removed),
    countryRemoved: Boolean(data.countryRemoved),
  };
}
