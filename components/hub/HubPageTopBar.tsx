import type { ReactNode } from "react";
import { PublicGuestAuthLinks } from "@/components/nav/PublicGuestAuthLinks";

type HubPageTopBarProps = {
  children: ReactNode;
  loginHref: string;
  registerHref: string;
  loginLabel: string;
  registerLabel: string;
  showAuthLinks: boolean;
};

export function HubPageTopBar({
  children,
  loginHref,
  registerHref,
  loginLabel,
  registerLabel,
  showAuthLinks,
}: HubPageTopBarProps) {
  return (
    <div className="city-page__top-bar">
      {children}
      {showAuthLinks ? (
        <PublicGuestAuthLinks
          loginHref={loginHref}
          registerHref={registerHref}
          loginLabel={loginLabel}
          registerLabel={registerLabel}
          className="city-page__auth-links"
        />
      ) : null}
    </div>
  );
}
