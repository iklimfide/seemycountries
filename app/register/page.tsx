import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { AuthForm } from "@/components/auth/AuthForm";

export default async function RegisterPage() {
  const t = await getTranslations("auth");

  return (
    <>
      <Header isLoggedIn={false} />
      <main className="mx-auto flex max-w-md flex-1 flex-col px-4 py-12">
        <h1 className="mb-8 text-2xl font-bold text-white">{t("registerTitle")}</h1>
        <AuthForm mode="register" />
        <p className="mt-6 text-center text-sm text-slate-500">
          {t("hasAccount")}{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300">
            Log in
          </Link>
        </p>
      </main>
    </>
  );
}
