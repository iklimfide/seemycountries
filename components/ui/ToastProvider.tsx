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

type ToastContextValue = {
  show: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 4000;

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setMessage(null);
  }, []);

  const show = useCallback(
    (next: string) => {
      dismiss();
      setMessage(next);
      timerRef.current = setTimeout(dismiss, TOAST_DURATION_MS);
    },
    [dismiss]
  );

  useEffect(() => dismiss, [dismiss]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {message && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-6 left-1/2 z-[110] max-w-sm -translate-x-1/2 rounded-xl border border-slate-600 bg-slate-900/95 px-4 py-3 text-center text-sm text-slate-100 shadow-2xl backdrop-blur-sm"
        >
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}
