"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";

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
    "block w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800 hover:text-white";

  return (
    <div className={`flex min-w-0 items-center gap-3 ${showInlineIdentity ? "" : "relative"}`} ref={rootRef}>
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={t("openMenu")}
          className="rounded-full outline-none ring-offset-2 ring-offset-slate-950 focus-visible:ring-2 focus-visible:ring-blue-500"
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
            className="absolute left-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 py-1 shadow-xl sm:left-auto sm:right-0"
          >
            {!showInlineIdentity && (
              <div className="border-b border-slate-800 px-3 py-2.5">
                <p className="truncate text-sm font-medium text-white">{displayName}</p>
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

            <div className="my-1 border-t border-slate-800" />

            <form action="/auth/signout" method="post" role="none">
              <button type="submit" role="menuitem" className={itemClass}>
                {t("logout")}
              </button>
            </form>
          </div>
        )}
      </div>

      {showInlineIdentity && (
        <div className="min-w-0 flex flex-col gap-1">
          <h1 className="truncate text-base font-bold leading-tight text-foreground sm:text-lg">
            {displayName}
          </h1>
          {badge}
        </div>
      )}
    </div>
  );
}
