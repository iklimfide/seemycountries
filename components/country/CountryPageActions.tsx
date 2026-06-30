"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  addVisitedCountry,
  addWishlistCountry,
  removeVisitedCountry,
  removeWishlistCountry,
} from "@/lib/client/country-actions";
import { useModal } from "@/components/ui/ModalProvider";
import { useToast } from "@/components/ui/ToastProvider";
import type { CountryVisitorState } from "@/lib/data/country-visitor-state";
import { isCountryRemoveBlockedByPlacesError } from "@/lib/utils/country-remove";

type CountryPageActionsProps = {
  countryCode: string;
  visitorState: CountryVisitorState;
  loginHref: string;
  labels: {
    visited: string;
    wantToVisit: string;
    countryAdded: string;
    countryRemoved: string;
    wishlistAdded: string;
    wishlistRemoved: string;
    removePlacesFirst: string;
  };
};

export function CountryPageActions({
  countryCode,
  visitorState: initialState,
  loginHref,
  labels,
}: CountryPageActionsProps) {
  const router = useRouter();
  const modal = useModal();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState(initialState);

  useEffect(() => {
    setState(initialState);
  }, [initialState]);

  const onMap = state.isOnMap;
  const onWishlist = Boolean(state.wishlistId);
  const visitedLocked = onMap && state.visitedViaPlacesOnly;
  const wishlistDisabled = onMap;

  async function handleVisited() {
    if (!state.isLoggedIn) {
      router.push(loginHref);
      return;
    }
    if (busy || visitedLocked) return;

    setBusy(true);
    try {
      if (onMap && state.visitedId) {
        const result = await removeVisitedCountry(state.visitedId);
        if (!result.ok) {
          if (isCountryRemoveBlockedByPlacesError(result.error)) {
            toast.show(labels.removePlacesFirst);
            return;
          }
          await modal.alert(result.error, { variant: "error" });
          return;
        }
        setState((current) => ({
          ...current,
          visitedId: null,
          isOnMap: current.visitedViaPlacesOnly,
        }));
        toast.show(labels.countryRemoved);
      } else if (!onMap) {
        const result = await addVisitedCountry(countryCode);
        if (!result.ok) {
          await modal.alert(result.error, { variant: "error" });
          return;
        }
        setState((current) => ({
          ...current,
          isOnMap: true,
          wishlistId: null,
        }));
        toast.show(labels.countryAdded);
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleWantToVisit() {
    if (!state.isLoggedIn) {
      router.push(loginHref);
      return;
    }
    if (busy || wishlistDisabled) return;

    setBusy(true);
    try {
      if (onWishlist && state.wishlistId) {
        const result = await removeWishlistCountry(state.wishlistId);
        if (!result.ok) {
          await modal.alert(result.error, { variant: "error" });
          return;
        }
        setState((current) => ({ ...current, wishlistId: null }));
        toast.show(labels.wishlistRemoved);
      } else {
        const result = await addWishlistCountry(countryCode);
        if (!result.ok) {
          await modal.alert(result.error, { variant: "error" });
          return;
        }
        toast.show(labels.wishlistAdded);
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="city-page__actions">
      <button
        type="button"
        onClick={handleVisited}
        disabled={busy || visitedLocked}
        aria-pressed={onMap}
        className={`city-page__btn city-page__btn--visited ${onMap ? "city-page__btn--active" : ""}`}
      >
        <span aria-hidden>✓</span>
        {labels.visited}
      </button>
      <button
        type="button"
        onClick={handleWantToVisit}
        disabled={busy || wishlistDisabled}
        aria-pressed={onWishlist}
        className={`city-page__btn city-page__btn--wish ${onWishlist ? "city-page__btn--active" : ""}`}
      >
        <span aria-hidden>🔖</span>
        {labels.wantToVisit}
      </button>
    </div>
  );
}
