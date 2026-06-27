"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useModal } from "@/components/ui/ModalProvider";
import { COUNTRY_LIST, getCountryName } from "@/lib/data/countries";
import type { VisitedCountry, WishlistCountry } from "@/types/database";

type CountryManagerProps = {
  visitedCountries: VisitedCountry[];
  wishlistCountries: WishlistCountry[];
  visitedCountryCodes: string[];
};

type CountryRow = {
  code: string;
  name: string;
  visitedId?: string;
  wishlistId?: string;
  isVisited: boolean;
  visitedViaCitiesOnly: boolean;
  isWishlist: boolean;
};

export function CountryManager({
  visitedCountries,
  wishlistCountries,
  visitedCountryCodes,
}: CountryManagerProps) {
  const t = useTranslations("country");
  const tWishlist = useTranslations("wishlist");
  const router = useRouter();
  const modal = useModal();
  const [query, setQuery] = useState("");
  const [busyCode, setBusyCode] = useState<string | null>(null);

  const visitedByCode = useMemo(() => {
    const map = new Map<string, VisitedCountry>();
    for (const c of visitedCountries) {
      map.set(c.country_code.toUpperCase(), c);
    }
    return map;
  }, [visitedCountries]);

  const wishlistByCode = useMemo(() => {
    const map = new Map<string, WishlistCountry>();
    for (const c of wishlistCountries) {
      map.set(c.country_code.toUpperCase(), c);
    }
    return map;
  }, [wishlistCountries]);

  const visitedCodeSet = useMemo(
    () => new Set(visitedCountryCodes.map((c) => c.toUpperCase())),
    [visitedCountryCodes]
  );

  const rows = useMemo((): CountryRow[] => {
    const q = query.trim().toLowerCase();

    const source = q
      ? COUNTRY_LIST.filter((c) => c.searchText.includes(q))
      : COUNTRY_LIST.filter(
          (c) =>
            visitedCodeSet.has(c.code) || wishlistByCode.has(c.code)
        );

    return source.map((c) => {
      const visited = visitedByCode.get(c.code);
      const wishlist = wishlistByCode.get(c.code);
      const isVisited = visitedCodeSet.has(c.code);

      return {
        code: c.code,
        name: c.name,
        visitedId: visited?.id,
        wishlistId: wishlist?.id,
        isVisited,
        visitedViaCitiesOnly: isVisited && !visited,
        isWishlist: wishlistByCode.has(c.code),
      };
    });
  }, [query, visitedByCode, wishlistByCode, visitedCodeSet]);

  async function addVisited(code: string) {
    const res = await fetch("/api/countries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        country_code: code,
        country_name: getCountryName(code),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      await modal.alert(data.error ?? "Failed to add country", { variant: "error" });
      return false;
    }
    return true;
  }

  async function removeVisited(row: CountryRow) {
    if (row.visitedViaCitiesOnly) {
      await modal.alert(t("removeCitiesFirst"), { variant: "info" });
      return false;
    }
    if (!row.visitedId) return false;

    const res = await fetch(`/api/countries/${row.visitedId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      await modal.alert(data.error ?? "Failed to remove country", { variant: "error" });
      return false;
    }
    return true;
  }

  async function addWishlist(code: string) {
    const res = await fetch("/api/wishlist/countries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        country_code: code,
        country_name: getCountryName(code),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      await modal.alert(data.error ?? "Failed to add to wishlist", { variant: "error" });
      return false;
    }
    return true;
  }

  async function removeWishlist(row: CountryRow) {
    if (!row.wishlistId) return false;

    const res = await fetch(`/api/wishlist/countries/${row.wishlistId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json();
      await modal.alert(data.error ?? "Failed to remove from wishlist", { variant: "error" });
      return false;
    }
    return true;
  }

  async function handleVisitedToggle(row: CountryRow, checked: boolean) {
    if (busyCode) return;
    setBusyCode(row.code);

    try {
      const ok = checked ? await addVisited(row.code) : await removeVisited(row);
      if (ok) router.refresh();
    } finally {
      setBusyCode(null);
    }
  }

  async function handleWishlistToggle(row: CountryRow, checked: boolean) {
    if (busyCode || row.isVisited) return;
    setBusyCode(row.code);

    try {
      const ok = checked ? await addWishlist(row.code) : await removeWishlist(row);
      if (ok) router.refresh();
    } finally {
      setBusyCode(null);
    }
  }

  const showIdle = query.trim().length === 0 && rows.length === 0;

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-slate-700 bg-slate-900 p-5">
      <div>
        <h2 className="text-lg font-semibold text-white">{t("title")}</h2>
        <p className="mt-1 text-xs text-slate-500">{t("toggleHint")}</p>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
        autoComplete="off"
      />

      <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
        <div className="grid grid-cols-[1fr_5rem_5rem] gap-2 border-b border-slate-800 px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          <span>{t("name")}</span>
          <span className="text-center text-blue-400">{t("columnVisited")}</span>
          <span className="text-center text-amber-400">{t("columnWant")}</span>
        </div>

        <ul className="max-h-72 overflow-y-auto scrollbar-thin">
          {showIdle ? (
            <li className="px-3 py-6 text-center text-sm text-slate-500">
              {t("searchIdle")}
            </li>
          ) : rows.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-slate-500">
              {t("noResults")}
            </li>
          ) : (
            rows.map((row) => {
              const loading = busyCode === row.code;

              return (
                <li
                  key={row.code}
                  className="grid grid-cols-[1fr_5rem_5rem] items-center gap-2 border-b border-slate-800/80 px-3 py-2.5 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-200">{row.name}</p>
                    <p className="text-xs text-slate-600">{row.code}</p>
                  </div>

                  <div className="flex justify-center">
                    <input
                      type="checkbox"
                      checked={row.isVisited}
                      disabled={loading || (row.isVisited && row.visitedViaCitiesOnly)}
                      title={row.visitedViaCitiesOnly ? t("lockedViaCities") : undefined}
                      onChange={(e) => handleVisitedToggle(row, e.target.checked)}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-500/40 disabled:opacity-60"
                      aria-label={`${t("columnVisited")}: ${row.name}`}
                    />
                  </div>

                  <div className="flex justify-center">
                    <input
                      type="checkbox"
                      checked={row.isWishlist && !row.isVisited}
                      disabled={loading || row.isVisited}
                      onChange={(e) => handleWishlistToggle(row, e.target.checked)}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-500/40 disabled:opacity-40"
                      aria-label={`${tWishlist("columnWant")}: ${row.name}`}
                    />
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </section>
  );
}
