"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboardAdd } from "@/components/dashboard/DashboardAddProvider";
import { dashboardNavMessages } from "@/lib/i18n/client-messages";
import { profilePath } from "@/lib/seo/site";

type DashboardBottomBarProps = {
  username: string;
};

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.8 4 6 4 9s-1.5 6.2-4 9M12 3c-2.5 2.8-4 6-4 9s1.5 6.2 4 9" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 19.5c1.2-3 3.4-4.5 6.5-4.5s5.3 1.5 6.5 4.5" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="3" />
      <path
        d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width={26} height={26} aria-hidden fill="none" stroke="currentColor" strokeWidth={2.4}>
      <path d="M12 6v12M6 12h12" strokeLinecap="round" />
    </svg>
  );
}

type NavItem = {
  href: string;
  label: string;
  isActive: (pathname: string) => boolean;
  icon: ReactNode;
};

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = item.isActive(pathname);

  return (
    <Link
      href={item.href}
      className={`dashboard-bottom-bar__item${active ? " dashboard-bottom-bar__item--active" : ""}`}
      aria-current={active ? "page" : undefined}
    >
      <span className="dashboard-bottom-bar__icon">{item.icon}</span>
      <span className="dashboard-bottom-bar__label">{item.label}</span>
    </Link>
  );
}

export function DashboardBottomBar({ username }: DashboardBottomBarProps) {
  const pathname = usePathname();
  const { openAddModal } = useDashboardAdd();
  const publicProfileHref = profilePath(username);

  const mapItem: NavItem = {
    href: "/dashboard",
    label: dashboardNavMessages.map,
    isActive: (path) => path === "/dashboard",
    icon: <MapIcon />,
  };

  const profileItem: NavItem = {
    href: publicProfileHref,
    label: dashboardNavMessages.profile,
    isActive: (path) => path === publicProfileHref,
    icon: <ProfileIcon />,
  };

  const settingsItem: NavItem = {
    href: "/dashboard/settings",
    label: dashboardNavMessages.settings,
    isActive: (path) => path.startsWith("/dashboard/settings"),
    icon: <SettingsIcon />,
  };

  return (
    <nav className="dashboard-bottom-bar" aria-label="Dashboard navigation">
      <div className="dashboard-bottom-bar__inner">
        <div className="dashboard-bottom-bar__side dashboard-bottom-bar__side--left">
          <NavLink item={mapItem} pathname={pathname} />
        </div>

        <div className="dashboard-bottom-bar__center">
          <button
            type="button"
            className="dashboard-bottom-bar__add"
            aria-label={dashboardNavMessages.add}
            onClick={openAddModal}
          >
            <PlusIcon />
          </button>
        </div>

        <div className="dashboard-bottom-bar__side dashboard-bottom-bar__side--right">
          <NavLink item={profileItem} pathname={pathname} />
          <NavLink item={settingsItem} pathname={pathname} />
        </div>
      </div>
    </nav>
  );
}
