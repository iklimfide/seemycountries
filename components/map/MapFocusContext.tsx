"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

export type MapFocusTarget = {
  code: string;
  name: string;
};

type FocusHandler = (country: MapFocusTarget) => void;

type MapFocusContextValue = {
  focusCountry: (country: MapFocusTarget) => void;
  registerFocusHandler: (handler: FocusHandler | null) => void;
};

const MapFocusContext = createContext<MapFocusContextValue | null>(null);

export function MapFocusProvider({ children }: { children: ReactNode }) {
  const handlerRef = useRef<FocusHandler | null>(null);

  const registerFocusHandler = useCallback((handler: FocusHandler | null) => {
    handlerRef.current = handler;
  }, []);

  const focusCountry = useCallback((country: MapFocusTarget) => {
    handlerRef.current?.(country);
    document.getElementById("travel-map")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const value = useMemo(
    () => ({ focusCountry, registerFocusHandler }),
    [focusCountry, registerFocusHandler]
  );

  return <MapFocusContext.Provider value={value}>{children}</MapFocusContext.Provider>;
}

export function useMapFocus() {
  const context = useContext(MapFocusContext);
  if (!context) {
    throw new Error("useMapFocus must be used within MapFocusProvider");
  }
  return context;
}

export function useOptionalMapFocus() {
  return useContext(MapFocusContext);
}
