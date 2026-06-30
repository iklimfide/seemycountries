"use client";

import { useEffect, useRef, useState } from "react";
import { LIMITS } from "@/lib/constants";
import { translateAuth, translateCommon } from "@/lib/i18n/client-messages";
import { createClient } from "@/lib/supabase/client";
import { formatDisplayName } from "@/lib/utils/display-name";
import { resolveAuthenticatedHomePath } from "@/lib/client/authenticated-home";
import { useModal } from "@/components/ui/ModalProvider";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "@/lib/validations/auth";

type AuthFormProps = {
  mode: "login" | "register";
};

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "reserved" | "invalid";

const USERNAME_CHECK_DEBOUNCE_MS = 400;

export function AuthForm({ mode }: AuthFormProps) {
  const t = translateAuth;
  const tCommon = translateCommon;
  const supabase = createClient();
  const modal = useModal();
  const abortRef = useRef<AbortController | null>(null);

  const [form, setForm] = useState<LoginInput & Partial<RegisterInput>>({
    email: "",
    password: "",
    username: "",
  });
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");

  const trimmedUsername = (form.username ?? "").trim();

  useEffect(() => {
    if (mode !== "register") return;

    if (trimmedUsername.length < LIMITS.usernameMin) {
      setUsernameStatus("idle");
      return;
    }

    const timer = window.setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setUsernameStatus("checking");

      fetch(
        `/api/auth/username-available?username=${encodeURIComponent(trimmedUsername)}`,
        { signal: controller.signal }
      )
        .then(async (res) => {
          if (!res.ok) {
            setUsernameStatus("idle");
            return;
          }
          const data = (await res.json()) as {
            available: boolean;
            reason?: "invalid" | "reserved" | "taken";
          };

          if (controller.signal.aborted) return;

          if (data.available) {
            setUsernameStatus("available");
            return;
          }

          if (data.reason === "taken") setUsernameStatus("taken");
          else if (data.reason === "reserved") setUsernameStatus("reserved");
          else setUsernameStatus("invalid");
        })
        .catch(() => {
          if (!controller.signal.aborted) setUsernameStatus("idle");
        });
    }, USERNAME_CHECK_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [mode, trimmedUsername]);

  async function ensureUsernameAvailable(username: string): Promise<boolean> {
    const res = await fetch(
      `/api/auth/username-available?username=${encodeURIComponent(username)}`
    );
    if (!res.ok) return false;

    const data = (await res.json()) as {
      available: boolean;
      reason?: "invalid" | "reserved" | "taken";
    };

    if (data.available) {
      setUsernameStatus("available");
      return true;
    }

    if (data.reason === "taken") setUsernameStatus("taken");
    else if (data.reason === "reserved") setUsernameStatus("reserved");
    else setUsernameStatus("invalid");

    return false;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "register") {
        const parsed = registerSchema.safeParse(form);
        if (!parsed.success) {
          await modal.alert(parsed.error.issues[0]?.message ?? "Invalid input", {
            variant: "error",
          });
          return;
        }

        const available = await ensureUsernameAvailable(parsed.data.username);
        if (!available) {
          await modal.alert(
            usernameStatus === "taken"
              ? t("usernameTaken")
              : usernameStatus === "reserved"
                ? t("usernameReserved")
                : t("usernameInvalid"),
            { variant: "error" }
          );
          return;
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            data: {
              username: parsed.data.username,
              display_name: formatDisplayName(parsed.data.username),
            },
          },
        });

        if (signUpError) {
          const message = signUpError.message.toLowerCase().includes("duplicate")
            ? t("usernameTaken")
            : signUpError.message;
          await modal.alert(message, { variant: "error" });
          return;
        }

        window.location.assign(await resolveAuthenticatedHomePath(supabase));
      } else {
        const parsed = loginSchema.safeParse(form);
        if (!parsed.success) {
          await modal.alert(parsed.error.issues[0]?.message ?? "Invalid input", {
            variant: "error",
          });
          return;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });

        if (signInError) {
          await modal.alert(signInError.message, { variant: "error" });
          return;
        }

        window.location.assign(await resolveAuthenticatedHomePath(supabase));
      }
    } finally {
      setLoading(false);
    }
  }

  const usernameStatusMessage =
    usernameStatus === "checking"
      ? t("usernameChecking")
      : usernameStatus === "available"
        ? t("usernameAvailable")
        : usernameStatus === "taken"
          ? t("usernameTaken")
          : usernameStatus === "reserved"
            ? t("usernameReserved")
            : usernameStatus === "invalid"
              ? t("usernameInvalid")
              : null;

  const usernameStatusClass =
    usernameStatus === "available"
      ? "text-emerald-400"
      : usernameStatus === "checking" || usernameStatus === "idle"
        ? "text-slate-500"
        : "text-red-400";

  const registerBlocked =
    mode === "register" &&
    (usernameStatus !== "available" || trimmedUsername.length < LIMITS.usernameMin);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {mode === "register" && (
        <div>
          <label htmlFor="username" className="mb-1 block text-sm text-slate-400">
            {t("username")}
          </label>
          <input
            id="username"
            type="text"
            value={form.username ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, username: e.target.value.toLowerCase() }))
            }
            className={`w-full rounded-lg border bg-slate-900 px-4 py-2.5 text-white outline-none focus:ring-1 ${
              usernameStatus === "taken" ||
              usernameStatus === "reserved" ||
              usernameStatus === "invalid"
                ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/40"
                : usernameStatus === "available"
                  ? "border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/40"
                  : "border-slate-700 focus:border-blue-500 focus:ring-blue-500/40"
            }`}
            required
            autoComplete="username"
            maxLength={LIMITS.usernameMax}
          />
          <p className="mt-1 text-xs text-slate-500">
            {t("usernameHint", { username: form.username || "yourname" })}
          </p>
          {usernameStatusMessage ? (
            <p className={`mt-1 text-xs ${usernameStatusClass}`} role="status">
              {usernameStatusMessage}
            </p>
          ) : null}
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-1 block text-sm text-slate-400">
          {t("email")}
        </label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-white outline-none focus:border-blue-500"
          required
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm text-slate-400">
          {t("password")}
        </label>
        <input
          id="password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-white outline-none focus:border-blue-500"
          required
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          minLength={LIMITS.passwordMin}
        />
      </div>

      <button
        type="submit"
        disabled={loading || registerBlocked}
        className="mt-2 rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? tCommon("loading") : mode === "register" ? tCommon("register") : tCommon("login")}
      </button>
    </form>
  );
}
