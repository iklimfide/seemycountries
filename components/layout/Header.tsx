import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { HeaderProfileIdentity } from "@/components/layout/HeaderProfileIdentity";
import { HeaderUserMenu } from "@/components/layout/HeaderUserMenu";
import { TravelerBadge } from "@/components/profile/TravelerBadge";
import { BRAND } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export type HeaderProfileLead = {
  avatarUrl: string | null;
  displayName: string;
  username: string;
  countryCount: number;
};

type HeaderProps = {
  username?: string | null;
  isLoggedIn?: boolean;
  profileLead?: HeaderProfileLead | null;
};

export async function Header({ isLoggedIn, profileLead = null }: HeaderProps) {
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

  const isOwnProfileLead =
    profileLead != null &&
    menuUser != null &&
    menuUser.username.toLowerCase() === profileLead.username.toLowerCase();

  const brandLink = (
    <Link
      href="/"
      className="min-w-0 truncate text-base font-bold tracking-tight text-header-fg transition-colors hover:text-blue-400 sm:text-lg"
    >
      {BRAND.name}
    </Link>
  );

  const navItems =
    isLoggedIn && menuUser && !isOwnProfileLead ? (
      <HeaderUserMenu
        username={menuUser.username}
        displayName={menuUser.displayName}
        avatarUrl={menuUser.avatarUrl}
      />
    ) : isLoggedIn && menuUser && isOwnProfileLead ? null : isLoggedIn ? null : (
      <div className="flex items-center gap-2 sm:gap-4">
        <Link href="/login" className="text-xs text-header-muted hover:text-header-fg sm:text-sm">
          {t("login")}
        </Link>
        <Link
          href="/register"
          className="rounded-lg border border-slate-600 px-2 py-1 text-xs font-medium text-header-muted hover:border-slate-400 hover:text-header-fg sm:px-4 sm:py-1.5 sm:text-sm"
        >
          {t("register")}
        </Link>
      </div>
    );

  const profileBlock =
    profileLead == null ? null : isOwnProfileLead && menuUser ? (
      <HeaderUserMenu
        username={menuUser.username}
        displayName={menuUser.displayName}
        avatarUrl={menuUser.avatarUrl}
        showInlineIdentity
        badge={<TravelerBadge countryCount={profileLead.countryCount} />}
      />
    ) : (
      <HeaderProfileIdentity
        avatarUrl={profileLead.avatarUrl}
        displayName={profileLead.displayName}
        username={profileLead.username}
        countryCount={profileLead.countryCount}
      />
    );

  return (
    <header className="relative z-50 border-b border-header-border bg-header-bg shadow-sm">
      <div className="mx-auto max-w-5xl px-4 py-3 sm:py-4">
        {profileLead ? (
          <>
            <div className="flex items-center justify-between gap-2 sm:hidden">
              {brandLink}
              <nav className="flex shrink-0 items-center gap-2 text-sm">{navItems}</nav>
            </div>
            <div className="mt-3 border-t border-slate-700 pt-3 sm:hidden">{profileBlock}</div>

            <div className="hidden items-center justify-between gap-4 sm:flex">
              <div className="flex min-w-0 items-center gap-4">
                {brandLink}
                <span className="h-5 w-px shrink-0 bg-slate-600" aria-hidden />
                {profileBlock}
              </div>
              <nav className="flex shrink-0 items-center gap-3 text-sm">{navItems}</nav>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between gap-4">
            {brandLink}
            <nav className="flex shrink-0 items-center gap-3 text-sm">{navItems}</nav>
          </div>
        )}
      </div>
    </header>
  );
}
