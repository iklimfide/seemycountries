import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { HeaderProfileIdentity } from "@/components/layout/HeaderProfileIdentity";
import { HeaderUserMenu } from "@/components/layout/HeaderUserMenu";
import { TravelerBadge } from "@/components/profile/TravelerBadge";
import { BRAND } from "@/lib/constants";
import { getAuthUser } from "@/lib/supabase/auth";
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
  variant?: "default" | "landing";
};

export async function Header({
  isLoggedIn,
  profileLead = null,
  variant = "default",
}: HeaderProps) {
  const t = await getTranslations("common");

  let menuUser: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
  } | null = null;

  const user = isLoggedIn === false ? null : await getAuthUser();
  const resolvedLoggedIn = Boolean(user);

  if (resolvedLoggedIn && user) {
    const supabase = await createClient();

    if (supabase) {
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

  const isOwnProfileLead =
    profileLead != null &&
    menuUser != null &&
    menuUser.username.toLowerCase() === profileLead.username.toLowerCase();

  const brandLink = (
    <Link
      href="/"
      className={
        variant === "landing"
          ? "flex min-w-0 items-center gap-2.5 truncate text-[22px] font-extrabold tracking-[-0.04em] text-header-fg max-sm:text-[19px]"
          : "flex min-w-0 items-center gap-2 truncate text-base font-bold tracking-tight text-header-fg transition-colors hover:text-blue-400 sm:text-lg"
      }
      aria-label={`${BRAND.name} home`}
    >
      <Image
        src="/icon.svg"
        alt=""
        width={32}
        height={32}
        className="shrink-0 rounded-md max-sm:h-7 max-sm:w-7"
      />
      <span className="truncate">{BRAND.domain}</span>
    </Link>
  );

  const navItems =
    resolvedLoggedIn && menuUser && !isOwnProfileLead ? (
      <HeaderUserMenu
        username={menuUser.username}
        displayName={menuUser.displayName}
        avatarUrl={menuUser.avatarUrl}
      />
    ) : resolvedLoggedIn && menuUser && isOwnProfileLead ? null : resolvedLoggedIn ? null : (
      <div className="flex items-center gap-4 sm:gap-5">
        <Link
          href="/login"
          className={
            variant === "landing"
              ? "text-[15px] font-semibold text-header-fg transition hover:text-white"
              : "text-xs font-semibold text-header-fg transition hover:text-white sm:text-sm"
          }
        >
          {t("login")}
        </Link>
        <Link
          href="/register"
          className={
            variant === "landing"
              ? "text-[15px] font-semibold text-header-fg transition hover:text-white"
              : "text-xs font-semibold text-header-fg transition hover:text-white sm:text-sm"
          }
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
    <header
      className={
        variant === "landing"
          ? "sticky top-0 z-50 bg-[#0b1220] px-[34px] text-header-fg shadow-[0_4px_18px_rgba(15,23,42,0.22)] max-sm:px-4 lg:px-10 xl:px-12"
          : "relative z-50 border-b border-header-border bg-header-bg shadow-sm"
      }
    >
      {variant === "landing" ? (
        <div className="mx-auto flex h-[76px] w-full max-w-[1200px] items-center justify-between lg:max-w-[1400px] xl:max-w-[1520px] max-sm:h-[68px]">
          {brandLink}
          <nav className="flex shrink-0 items-center gap-3 text-sm" aria-label="Main navigation">
            {navItems}
          </nav>
        </div>
      ) : (
      <div className="mx-auto w-full min-w-0 max-w-5xl overflow-x-clip px-4 py-3 sm:py-4">
        {profileLead ? (
          <>
            <div className="flex min-w-0 items-center justify-between gap-2 sm:hidden">
              {brandLink}
              <nav className="flex shrink-0 items-center gap-2 text-sm">{navItems}</nav>
            </div>
            <div className="mt-3 border-t border-slate-700 pt-3 sm:hidden">{profileBlock}</div>

            <div className="hidden min-w-0 items-center justify-between gap-4 sm:flex">
              <div className="flex min-w-0 items-center gap-4">
                {brandLink}
                <span className="h-5 w-px shrink-0 bg-slate-600" aria-hidden />
                {profileBlock}
              </div>
              <nav className="flex shrink-0 items-center gap-3 text-sm">{navItems}</nav>
            </div>
          </>
        ) : (
          <div className="flex min-w-0 items-center justify-between gap-4">
            {brandLink}
            <nav className="flex shrink-0 items-center gap-3 text-sm">{navItems}</nav>
          </div>
        )}
      </div>
      )}
    </header>
  );
}
