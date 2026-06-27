import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BRAND } from "@/lib/constants";

type HeaderProps = {
  username?: string | null;
  isLoggedIn?: boolean;
};

export async function Header({ username, isLoggedIn }: HeaderProps) {
  const t = await getTranslations("common");

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-white">
          {BRAND.name}
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="text-slate-300 hover:text-white"
              >
                {t("dashboard")}
              </Link>
              {username && (
                <Link
                  href={`/u/${username}`}
                  className="text-slate-300 hover:text-white"
                >
                  @{username}
                </Link>
              )}
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300 hover:border-slate-500 hover:text-white"
                >
                  {t("logout")}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-slate-300 hover:text-white">
                {t("login")}
              </Link>
              <Link
                href="/register"
                className="rounded-lg border border-slate-700 px-4 py-1.5 font-medium text-slate-300 hover:border-slate-500 hover:text-white"
              >
                {t("register")}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
