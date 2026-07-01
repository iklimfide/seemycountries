import type { ReactNode } from "react";
import Link from "next/link";
import { CityPageNav } from "@/components/city/CityPageNav";
import { CityPageActions } from "@/components/city/CityPageActions";
import { HubPageTopBar } from "@/components/hub/HubPageTopBar";
import { CityHubMemories } from "@/components/city/CityHubMemories";
import { HubPagePinCount } from "@/components/hub/HubPagePinCount";
import { HubRecentTravelers } from "@/components/hub/HubRecentTravelers";
import { ensureParkHubFromTouristPark } from "@/lib/data/park-hubs";
import { DEFAULT_CITY_HERO_IMAGE } from "@/lib/constants";
import { countryPath, parkPath } from "@/lib/seo/site";
import { parkTypeLabel } from "@/lib/utils/park-type";
import type { CityHub } from "@/lib/data/city-hubs";
import type { CountryHub } from "@/lib/data/country-hubs";
import type { TouristCity } from "@/lib/data/tourist-cities";
import type { TouristPark } from "@/lib/data/tourist-park-search";
import type { CityVisitorState } from "@/lib/data/city-visitor-state";
import type { CityTravelerPin } from "@/lib/supabase/city-travelers";
import type { CountryTraveler } from "@/lib/supabase/country-travelers";

type CityPageContentProps = {
  hub: CityHub;
  touristCity: TouristCity | null;
  countryHub: CountryHub | null;
  parks: TouristPark[];
  travelers: CountryTraveler[];
  memoryPins: CityTravelerPin[];
  visitorState: CityVisitorState;
  loginHref: string;
  registerHref: string;
  pinCountLabel: string;
  labels: {
    home: string;
    visited: string;
    wantToVisit: string;
    like: string;
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
    travelerMemories: string;
    viewTravelMap: string;
    viewPin: string;
    close: string;
    instagramPost: string;
    recentTravelers: string;
    noTravelersYet: string;
    pinCity: string;
    login: string;
    register: string;
  };
};

export function CityPageContent({
  hub,
  touristCity,
  countryHub,
  parks,
  travelers,
  memoryPins,
  visitorState,
  loginHref,
  registerHref,
  pinCountLabel,
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
          {parks.map((park) => {
            const parkHub = ensureParkHubFromTouristPark(park);
            return (
              <li key={`${park.parkType}:${park.name}`} className="py-1 first:pt-0 last:pb-0">
                <Link href={parkPath(parkHub.slug)} className="city-page__link">
                  {park.name}
                </Link>
                <span className="city-page__subtext">{parkTypeLabel(park.parkType)}</span>
              </li>
            );
          })}
        </ul>
      ),
    });
  }

  const pinWithPhoto = memoryPins.find((pin) => pin.mediaPreviewUrl || pin.mediaUrl);
  const heroUrl =
    pinWithPhoto?.mediaPreviewUrl ?? pinWithPhoto?.mediaUrl ?? DEFAULT_CITY_HERO_IMAGE;

  return (
    <div className="city-page">
      <HubPageTopBar
        loginHref={loginHref}
        registerHref={registerHref}
        loginLabel={labels.login}
        registerLabel={labels.register}
        showAuthLinks={!visitorState.isLoggedIn}
      >
        <CityPageNav hub={hub} labels={labels} />
      </HubPageTopBar>

      <div className="city-page__container">
        <section className="city-page__hero">
          <div className="city-page__image-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroUrl} alt="" width={200} height={200} />
          </div>

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
            <HubPagePinCount label={pinCountLabel} />
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

        <CityHubMemories
          cityName={hub.name}
          pins={memoryPins}
          labels={{
            heading: labels.travelerMemories,
            viewMap: labels.viewTravelMap,
            viewPin: labels.viewPin,
            close: labels.close,
            instagramPost: labels.instagramPost,
          }}
        />

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
