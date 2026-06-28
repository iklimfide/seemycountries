import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { HeaderUserMenu } from "@/components/layout/HeaderUserMenu";
import { BRAND } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

type HeaderProps = {
  username?: string | null;
  isLoggedIn?: boolean;
};

export async function Header({ isLoggedIn }: HeaderProps) {
  const t = await getTranslations("common");

  let menuUser: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
  } | null = null;

  if (isLoggedIn) {
    const supabase = await createClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: extended } = await supabase
          .from("profiles")
          .select("username, display_name, avatar_url")
          .eq("id", user.id)
          .single();

        const profile =
          extended ??
          (
            await supabase
              .from("profiles")
              .select("username, display_name")
              .eq("id", user.id)
              .single()
          ).data;

        if (profile?.username) {
          const avatarUrl =
            extended && typeof extended.avatar_url === "string" ? extended.avatar_url : null;

          menuUser = {
            username: profile.username,
            displayName: profile.display_name ?? profile.username,
            avatarUrl,
          };
        }
      }
    }
  }

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-white">
          {BRAND.name}
        </Link>
        <nav className="flex items-center text-sm">
          {isLoggedIn && menuUser ? (
            <HeaderUserMenu
              username={menuUser.username}
              displayName={menuUser.displayName}
              avatarUrl={menuUser.avatarUrl}
            />
          ) : isLoggedIn ? null : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-slate-300 hover:text-white">
                {t("login")}
              </Link>
              <Link
                href="/register"
                className="rounded-lg border border-slate-700 px-4 py-1.5 font-medium text-slate-300 hover:border-slate-500 hover:text-white"
              >
                {t("register")}
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
