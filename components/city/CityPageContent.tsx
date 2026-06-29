import type { ReactNode } from "react";
import Link from "next/link";
import { CityPageActions } from "@/components/city/CityPageActions";
import { CityPageNav } from "@/components/city/CityPageNav";
import { HubRecentTravelers } from "@/components/hub/HubRecentTravelers";
import { countryPath } from "@/lib/seo/site";
import { parkTypeLabel } from "@/lib/utils/park-type";
import type { CityHub } from "@/lib/data/city-hubs";
import type { CountryHub } from "@/lib/data/country-hubs";
import type { TouristCity } from "@/lib/data/tourist-cities";
import type { TouristPark } from "@/lib/data/tourist-park-search";
import type { CityVisitorState } from "@/lib/data/city-visitor-state";
import type { CountryTraveler } from "@/lib/supabase/country-travelers";

type CityPageContentProps = {
  hub: CityHub;
  touristCity: TouristCity | null;
  countryHub: CountryHub | null;
  parks: TouristPark[];
  travelers: CountryTraveler[];
  visitorState: CityVisitorState;
  loginHref: string;
  labels: {
    home: string;
    visited: string;
    wantToVisit: string;
    cityAdded: string;
    cityRemoved: string;
    wishlistAdded: string;
    wishlistRemoved: string;
    alreadyOnMap: string;
    country: string;
    currency: string;
    plugType: string;
    visa: string;
    language: string;
    parksInCity: string;
    recentTravelers: string;
    noTravelersYet: string;
    pinCity: string;
  };
};

export function CityPageContent({
  hub,
  touristCity,
  countryHub,
  parks,
  travelers,
  visitorState,
  loginHref,
  labels,
}: CityPageContentProps) {
  const rows: { label: string; value: ReactNode }[] = [];

  rows.push({
    label: labels.country,
    value: (
      <Link href={countryPath(hub.countrySlug)} className="city-page__link">
        {hub.countryName}
      </Link>
    ),
  });

  if (countryHub) {
    rows.push(
      { label: labels.currency, value: countryHub.currency },
      { label: labels.plugType, value: countryHub.plugType },
      { label: labels.visa, value: countryHub.visaNote },
      { label: labels.language, value: countryHub.language }
    );
  }

  if (parks.length > 0) {
    rows.push({
      label: labels.parksInCity,
      value: (
        <ul className="m-0 list-none p-0">
          {parks.map((park) => (
            <li key={`${park.parkType}:${park.name}`} className="py-1 first:pt-0 last:pb-0">
              {park.name}
              <span className="city-page__subtext">{parkTypeLabel(park.parkType)}</span>
            </li>
          ))}
        </ul>
      ),
    });
  }

  return (
    <div className="city-page">
      <CityPageNav hub={hub} labels={labels} />

      <div className="city-page__container">
        <section className="city-page__hero">
          {hub.heroImage ? (
            <div className="city-page__image-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hub.heroImage}
                alt={hub.heroImageAlt ?? hub.name}
                width={200}
                height={200}
              />
            </div>
          ) : null}

          <div>
            <h1 className="city-page__title">{hub.name}</h1>
            <CityPageActions
              cityName={hub.name}
              countryCode={hub.countryCode}
              countryName={hub.countryName}
              latitude={touristCity?.latitude ?? null}
              longitude={touristCity?.longitude ?? null}
              visitorState={visitorState}
              loginHref={loginHref}
              labels={labels}
            />
          </div>
        </section>

        {rows.length > 0 ? (
          <section className="city-page__sheet" aria-label="City details">
            {rows.map((row) => (
              <div key={row.label} className="city-page__row">
                <span className="city-page__label">{row.label}</span>
                <div className="city-page__value">{row.value}</div>
              </div>
            ))}
          </section>
        ) : null}

        <HubRecentTravelers
          travelers={travelers}
          headingId="city-travelers-heading"
          labels={{
            recentTravelers: labels.recentTravelers,
            noTravelersYet: labels.noTravelersYet,
            pinCta: labels.pinCity,
          }}
        />
      </div>
    </div>
  );
}
