export async function saveTravelShareSnapshot(): Promise<boolean> {
  try {
    const response = await fetch("/api/me/travel-share-snapshot", { method: "POST" });
    return response.ok;
  } catch {
    return false;
  }
}

/** Save snapshot then refresh on the next tick to avoid React mount/update races. */
export async function finalizeTravelShare(refresh: () => void): Promise<void> {
  await saveTravelShareSnapshot();
  queueMicrotask(() => refresh());
}
