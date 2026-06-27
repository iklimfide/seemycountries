import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const t = await getTranslations("auth");

  return (
    <>
      <Header isLoggedIn={false} />
      <main className="mx-auto flex max-w-md flex-1 flex-col px-4 py-12">
        <h1 className="mb-8 text-2xl font-bold text-white">{t("loginTitle")}</h1>
        <AuthForm mode="login" />
        <p className="mt-6 text-center text-sm text-slate-500">
          {t("noAccount")}{" "}
          <Link href="/register" className="text-blue-400 hover:text-blue-300">
            Sign up
          </Link>
        </p>
      </main>
    </>
  );
}
