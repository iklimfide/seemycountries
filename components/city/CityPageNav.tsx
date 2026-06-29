import Link from "next/link";
import { countryCodeToFlagUrl } from "@/lib/utils/country-flag";
import { countryPath } from "@/lib/seo/site";
import type { CityHub } from "@/lib/data/city-hubs";

type CityPageNavProps = {
  hub: CityHub;
  labels: {
    home: string;
  };
};

export function CityPageNav({ hub, labels }: CityPageNavProps) {
  const flagUrl = countryCodeToFlagUrl(hub.countryCode);

  return (
    <nav className="city-page__top-nav" aria-label="Breadcrumb navigation">
      <Link href="/dashboard" className="city-page__nav-badge city-page__nav-badge--icon" aria-label={labels.home}>
        <span aria-hidden>🧭</span>
      </Link>
      <Link href={countryPath(hub.countrySlug)} className="city-page__nav-badge">
        {flagUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={flagUrl} alt="" width={18} height={18} className="city-page__nav-flag" />
        ) : null}
        <span>{hub.countryName}</span>
      </Link>
      <span className="city-page__nav-badge city-page__nav-badge--active" aria-current="page">
        {hub.name}
      </span>
    </nav>
  );
}
