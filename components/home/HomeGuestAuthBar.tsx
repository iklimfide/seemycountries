import { PublicGuestAuthLinks } from "@/components/nav/PublicGuestAuthLinks";

type HomeGuestAuthBarProps = {
  loginHref: string;
  registerHref: string;
  loginLabel: string;
  registerLabel: string;
};

export function HomeGuestAuthBar({
  loginHref,
  registerHref,
  loginLabel,
  registerLabel,
}: HomeGuestAuthBarProps) {
  return (
    <div className="mb-4 flex justify-end sm:mb-5">
      <PublicGuestAuthLinks
        loginHref={loginHref}
        registerHref={registerHref}
        loginLabel={loginLabel}
        registerLabel={registerLabel}
        className="home-guest-auth"
        linkClassName="home-guest-auth__link"
        primaryClassName="home-guest-auth__link home-guest-auth__link--primary"
      />
    </div>
  );
}
