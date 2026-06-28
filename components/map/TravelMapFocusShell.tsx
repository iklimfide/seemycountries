"use client";

import type { ReactNode } from "react";
import { MapFocusProvider } from "@/components/map/MapFocusContext";

export function TravelMapFocusShell({ children }: { children: ReactNode }) {
  return <MapFocusProvider>{children}</MapFocusProvider>;
}
