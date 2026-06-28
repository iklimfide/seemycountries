"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

type HeaderUserMenuProps = {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  showInlineIdentity?: boolean;
  badge?: ReactNode;
};

export function HeaderUserMenu({
  username,
  displayName,
  avatarUrl,
  showInlineIdentity = false,
  badge = null,
}: HeaderUserMenuProps) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const itemClass =
    "block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-slate-100 dark:hover:bg-slate-800";

  return (
    <div
      className={`flex min-w-0 items-center gap-3 ${showInlineIdentity ? "" : "relative"}`}
      ref={rootRef}
    >
      <div className="relative z-50 shrink-0">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={t("openMenu")}
          className="rounded-full outline-none ring-offset-2 ring-offset-header-bg focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <ProfileAvatar
            avatarUrl={avatarUrl}
            displayName={displayName}
            username={username}
            size={showInlineIdentity ? "sm" : "xs"}
            className="ring-1 ring-slate-600"
          />
        </button>

        {open && (
          <div
            role="menu"
            className={`absolute top-full z-50 mt-2 w-56 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-2xl dark:border-slate-700 dark:bg-slate-950 ${
              showInlineIdentity ? "left-0" : "right-0"
            }`}
          >
            {!showInlineIdentity && (
              <div className="border-b border-slate-200 px-3 py-2.5 dark:border-slate-800">
                <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
                <p className="truncate text-xs text-slate-500">@{username}</p>
              </div>
            )}

            <Link
              href="/dashboard"
              role="menuitem"
              className={itemClass}
              onClick={() => setOpen(false)}
            >
              {t("dashboard")}
            </Link>
            <Link
              href="/dashboard/settings"
              role="menuitem"
              className={itemClass}
              onClick={() => setOpen(false)}
            >
              {t("profile")}
            </Link>

            <ThemeToggle variant="menu" onToggled={() => setOpen(false)} />

            <div className="my-1 border-t border-slate-200 dark:border-slate-800" />

            <form action="/auth/signout" method="post" role="none">
              <button type="submit" role="menuitem" className={itemClass}>
                {t("logout")}
              </button>
            </form>
          </div>
        )}
      </div>

      {showInlineIdentity && (
        <div className="min-w-0 flex flex-col gap-0.5">
          <h1 className="truncate text-base font-bold leading-tight text-header-fg sm:text-lg">
            {displayName}
          </h1>
          {badge}
        </div>
      )}
    </div>
  );
}
