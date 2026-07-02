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
import { useAuthGate } from "@/components/auth/useAuthGate";
import type { CountryVisitorState } from "@/lib/data/country-visitor-state";
import { isCountryRemoveBlockedByPlacesError } from "@/lib/utils/country-remove";
import { HubPageLikeButton } from "@/components/hub/HubPageLikeButton";

type CountryPageActionsProps = {
  countryCode: string;
  visitorState: CountryVisitorState;
  loginHref: string;
  labels: {
    visited: string;
    wantToVisit: string;
    like: string;
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
  const authGate = useAuthGate();
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
      authGate.requireLogin();
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
      authGate.requireLogin();
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
      <label
        className={`city-page__btn city-page__btn--visited ${onMap ? "city-page__btn--active" : ""}`}
      >
        <input
          type="checkbox"
          className="city-page__btn-check"
          checked={onMap}
          disabled={busy || visitedLocked}
          onChange={() => void handleVisited()}
          aria-label={labels.visited}
        />
        <span>{labels.visited}</span>
      </label>
      <div className="city-page__actions-secondary">
        <label
          className={`city-page__btn city-page__btn--wish ${onWishlist ? "city-page__btn--active" : ""}`}
        >
          <input
            type="checkbox"
            className="city-page__btn-check city-page__btn-check--wish"
            checked={onWishlist}
            disabled={busy || wishlistDisabled}
            onChange={() => void handleWantToVisit()}
            aria-label={labels.wantToVisit}
          />
          <span>{labels.wantToVisit}</span>
        </label>
        <HubPageLikeButton
          label={labels.like}
          loginHref={loginHref}
          isLoggedIn={state.isLoggedIn}
          disabled={busy}
        />
      </div>
    </div>
  );
}
