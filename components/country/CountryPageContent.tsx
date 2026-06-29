import Link from "next/link";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { CountryPageActions } from "@/components/country/CountryPageActions";
import { CountryPageNav } from "@/components/country/CountryPageNav";
import { HubRecentTravelers } from "@/components/hub/HubRecentTravelers";
import { findCityHubSlug } from "@/lib/data/city-hubs";
import { countryCodeToFlagUrl } from "@/lib/utils/country-flag";
import { cityPath } from "@/lib/seo/site";
import type { CountryHub } from "@/lib/data/country-hubs";
import type { CountryVisitorState } from "@/lib/data/country-visitor-state";
import type { CountryTraveler } from "@/lib/supabase/country-travelers";

type CountryPageContentProps = {
  hub: CountryHub;
  travelers: CountryTraveler[];
  visitorState: CountryVisitorState;
  loginHref: string;
  labels: {
    home: string;
    visited: string;
    wantToVisit: string;
    countryAdded: string;
    countryRemoved: string;
    wishlistAdded: string;
    wishlistRemoved: string;
    removePlacesFirst: string;
    capital: string;
    currency: string;
    plugType: string;
    visa: string;
    language: string;
    recentTravelers: string;
    noTravelersYet: string;
    pinCountry: string;
  };
};

export function CountryPageContent({
  hub,
  travelers,
  visitorState,
  loginHref,
  labels,
}: CountryPageContentProps) {
  const flagUrl = countryCodeToFlagUrl(hub.code);
  const capitalCitySlug = findCityHubSlug(hub.code, hub.capital);

  const rows = [
    {
      label: labels.capital,
      value: capitalCitySlug ? (
        <Link href={cityPath(capitalCitySlug)} className="city-page__link">
          {hub.capital}
        </Link>
      ) : (
        hub.capital
      ),
    },
    { label: labels.currency, value: hub.currency },
    { label: labels.plugType, value: hub.plugType },
    { label: labels.visa, value: hub.visaNote },
    { label: labels.language, value: hub.language },
  ];

  return (
    <div className="city-page">
      <CountryPageNav hub={hub} labels={labels} />

      <div className="city-page__container">
        <section className="city-page__hero">
          {flagUrl ? (
            <div className="city-page__image-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={flagUrl} alt="" width={200} height={200} />
            </div>
          ) : null}

          <div>
            <h1 className="city-page__title">{hub.name}</h1>
            <CountryPageActions
              countryCode={hub.code}
              visitorState={visitorState}
              loginHref={loginHref}
              labels={labels}
            />
          </div>
        </section>

        <section className="city-page__sheet" aria-label="Country details">
          {rows.map((row) => (
            <div key={row.label} className="city-page__row">
              <span className="city-page__label">{row.label}</span>
              <div className="city-page__value">{row.value}</div>
            </div>
          ))}
        </section>

        <HubRecentTravelers
          travelers={travelers}
          headingId="country-travelers-heading"
          labels={{
            recentTravelers: labels.recentTravelers,
            noTravelersYet: labels.noTravelersYet,
            pinCta: labels.pinCountry,
          }}
        />
      </div>
    </div>
  );
}
