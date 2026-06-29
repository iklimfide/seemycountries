"use client";

import { useEffect } from "react";

/** Drops stale service workers that can hammer localhost with repeat navigations. */
export function ClearPwaArtifacts() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        void registration.unregister();
      }
    });
  }, []);

  return null;
}
