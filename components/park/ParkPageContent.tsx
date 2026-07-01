import Link from "next/link";
import { HubPagePinCount } from "@/components/hub/HubPagePinCount";
import { HubPageTopBar } from "@/components/hub/HubPageTopBar";
import { HubRecentTravelers } from "@/components/hub/HubRecentTravelers";
import { ParkPageActions } from "@/components/park/ParkPageActions";
import { ParkPageNav } from "@/components/park/ParkPageNav";
import { countryPath } from "@/lib/seo/site";
import { getDefaultParkHeroImage } from "@/lib/utils/park-hero-image";
import { parkTypeLabel } from "@/lib/utils/park-type";
import type { ParkHub } from "@/lib/data/park-hubs";
import type { CountryHub } from "@/lib/data/country-hubs";
import type { ParkVisitorState } from "@/lib/data/park-visitor-state";
import type { CountryTraveler } from "@/lib/supabase/country-travelers";

type ParkPageContentProps = {
  hub: ParkHub;
  countryHub: CountryHub | null;
  travelers: CountryTraveler[];
  visitorState: ParkVisitorState;
  loginHref: string;
  registerHref: string;
  pinCountLabel: string;
  labels: {
    home: string;
    visited: string;
    wantToVisit: string;
    like: string;
    country: string;
    parkType: string;
    currency: string;
    plugType: string;
    parkAdded: string;
    parkRemoved: string;
    wishlistAdded: string;
    wishlistRemoved: string;
    recentTravelers: string;
    noTravelersYet: string;
    pinPark: string;
    login: string;
    register: string;
  };
};

export function ParkPageContent({
  hub,
  countryHub,
  travelers,
  visitorState,
  loginHref,
  registerHref,
  pinCountLabel,
  labels,
}: ParkPageContentProps) {
  const heroUrl = getDefaultParkHeroImage(hub.parkType);

  const rows = [
    {
      label: labels.country,
      value: (
        <Link href={countryPath(hub.countrySlug)} className="city-page__link">
          {hub.countryName}
        </Link>
      ),
    },
    {
      label: labels.parkType,
      value: parkTypeLabel(hub.parkType),
    },
  ];

  if (countryHub) {
    rows.push(
      { label: labels.currency, value: countryHub.currency },
      { label: labels.plugType, value: countryHub.plugType }
    );
  }

  return (
    <div className="city-page">
      <HubPageTopBar
        loginHref={loginHref}
        registerHref={registerHref}
        loginLabel={labels.login}
        registerLabel={labels.register}
        showAuthLinks={!visitorState.isLoggedIn}
      >
        <ParkPageNav hub={hub} labels={{ home: labels.home }} />
      </HubPageTopBar>

      <div className="city-page__container">
        <section className="city-page__hero city-page__hero--park-card">
          <div className="city-page__park-card-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroUrl} alt="" width={220} />
          </div>

          <div>
            <h1 className="city-page__title">{hub.name}</h1>
            <ParkPageActions
              parkName={hub.name}
              parkType={hub.parkType}
              countryCode={hub.countryCode}
              countryName={hub.countryName}
              latitude={hub.latitude}
              longitude={hub.longitude}
              visitorState={visitorState}
              loginHref={loginHref}
              labels={labels}
            />
            <HubPagePinCount label={pinCountLabel} />
          </div>
        </section>

        <section className="city-page__sheet" aria-label="Park details">
          {rows.map((row) => (
            <div key={row.label} className="city-page__row">
              <span className="city-page__label">{row.label}</span>
              <div className="city-page__value">{row.value}</div>
            </div>
          ))}
        </section>

        <HubRecentTravelers
          travelers={travelers}
          headingId="park-travelers-heading"
          labels={{
            recentTravelers: labels.recentTravelers,
            noTravelersYet: labels.noTravelersYet,
            pinCta: labels.pinPark,
          }}
        />
      </div>
    </div>
  );
}
