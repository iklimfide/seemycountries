"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ToastActionOptions = {
  message: string;
  actionLabel: string;
  dismissLabel?: string;
  onAction: () => void | Promise<void>;
  onDismiss?: () => void;
  durationMs?: number;
};

type ToastContextValue = {
  show: (message: string, durationMs?: number) => void;
  showAction: (options: ToastActionOptions) => void;
  dismiss: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_TOAST_DURATION_MS = 4000;

type ToastState =
  | { kind: "message"; message: string }
  | {
      kind: "action";
      message: string;
      actionLabel: string;
      dismissLabel: string;
      onAction: () => void | Promise<void>;
      onDismiss?: () => void;
    }
  | null;

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setActionLoading(false);
    setToast(null);
  }, []);

  const show = useCallback(
    (message: string, durationMs = DEFAULT_TOAST_DURATION_MS) => {
      dismiss();
      setToast({ kind: "message", message });
      timerRef.current = setTimeout(dismiss, durationMs);
    },
    [dismiss]
  );

  const showAction = useCallback(
    (options: ToastActionOptions) => {
      dismiss();
      setToast({
        kind: "action",
        message: options.message,
        actionLabel: options.actionLabel,
        dismissLabel: options.dismissLabel ?? "No",
        onAction: options.onAction,
        onDismiss: options.onDismiss,
      });
      if (options.durationMs != null) {
        timerRef.current = setTimeout(dismiss, options.durationMs);
      }
    },
    [dismiss]
  );

  useEffect(() => dismiss, [dismiss]);

  function handleDismissClick() {
    if (!toast || toast.kind !== "action" || actionLoading) return;
    toast.onDismiss?.();
    dismiss();
  }

  async function handleActionClick() {
    if (!toast || toast.kind !== "action" || actionLoading) return;

    setActionLoading(true);
    try {
      await toast.onAction();
      dismiss();
    } catch {
      setActionLoading(false);
    }
  }

  return (
    <ToastContext.Provider value={{ show, showAction, dismiss }}>
      {children}
      {toast && (
        <div
          role={toast.kind === "action" ? "alertdialog" : "status"}
          aria-live="polite"
          className="pointer-events-auto fixed top-1/2 left-1/2 z-[110] w-[min(100vw-2rem,20rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-600 bg-slate-900/95 px-4 py-3 text-center text-sm text-slate-100 shadow-2xl backdrop-blur-sm"
        >
          <p>{toast.message}</p>
          {toast.kind === "action" && (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleDismissClick}
                disabled={actionLoading}
                className="flex-1 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {toast.dismissLabel}
              </button>
              <button
                type="button"
                onClick={handleActionClick}
                disabled={actionLoading}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading ? "…" : toast.actionLabel}
              </button>
            </div>
          )}
        </div>
      )}
    </ToastContext.Provider>
  );
}
