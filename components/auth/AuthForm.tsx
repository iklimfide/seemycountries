"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LIMITS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
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

export function AuthForm({ mode }: AuthFormProps) {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const supabase = createClient();
  const modal = useModal();

  const [form, setForm] = useState<LoginInput & Partial<RegisterInput>>({
    email: "",
    password: "",
    username: "",
  });
  const [loading, setLoading] = useState(false);

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

        const { error: signUpError } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            data: {
              username: parsed.data.username,
              display_name: parsed.data.username,
            },
          },
        });

        if (signUpError) {
          await modal.alert(signUpError.message, { variant: "error" });
          return;
        }

        router.push("/dashboard");
        router.refresh();
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

        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

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
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-white outline-none focus:border-blue-500"
            required
            autoComplete="username"
          />
          <p className="mt-1 text-xs text-slate-500">
            {t("usernameHint", { username: form.username || "yourname" })}
          </p>
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
        disabled={loading}
        className="mt-2 rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? tCommon("loading") : mode === "register" ? tCommon("register") : tCommon("login")}
      </button>
    </form>
  );
}
