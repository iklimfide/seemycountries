import Link from "next/link";
import { countryCodeToFlagUrl } from "@/lib/utils/country-flag";
import type { CountryHub } from "@/lib/data/country-hubs";

type CountryPageNavProps = {
  hub: CountryHub;
  labels: {
    home: string;
  };
};

export function CountryPageNav({ hub, labels }: CountryPageNavProps) {
  const flagUrl = countryCodeToFlagUrl(hub.code);

  return (
    <nav className="city-page__top-nav" aria-label="Breadcrumb navigation">
      <Link href="/dashboard" className="city-page__nav-badge city-page__nav-badge--icon" aria-label={labels.home}>
        <span aria-hidden>🧭</span>
      </Link>
      <span className="city-page__nav-badge city-page__nav-badge--active" aria-current="page">
        {flagUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={flagUrl} alt="" width={18} height={18} className="city-page__nav-flag" />
        ) : null}
        <span>{hub.name}</span>
      </span>
    </nav>
  );
}
