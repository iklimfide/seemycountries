"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SaveDestinationModal, type SaveDestinationInitialTab } from "@/components/dashboard/SaveDestinationModal";

type DashboardAddContextValue = {
  openAddModal: (tab?: SaveDestinationInitialTab) => void;
  closeAddModal: () => void;
};

const DashboardAddContext = createContext<DashboardAddContextValue | null>(null);

export function useDashboardAdd(): DashboardAddContextValue {
  const ctx = useContext(DashboardAddContext);
  if (!ctx) {
    throw new Error("useDashboardAdd must be used within DashboardAddProvider");
  }
  return ctx;
}

export type { SaveDestinationInitialTab } from "@/components/dashboard/SaveDestinationModal";

export function DashboardAddProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [initialTab, setInitialTab] = useState<SaveDestinationInitialTab>("popular");

  const openAddModal = useCallback((tab?: SaveDestinationInitialTab) => {
    if (tab) setInitialTab(tab);
    setOpen(true);
  }, []);

  const closeAddModal = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ openAddModal, closeAddModal }),
    [openAddModal, closeAddModal]
  );

  return (
    <DashboardAddContext.Provider value={value}>
      {children}
      <SaveDestinationModal open={open} initialTab={initialTab} onClose={closeAddModal} />
    </DashboardAddContext.Provider>
  );
}
