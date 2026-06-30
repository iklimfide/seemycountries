"use client";

import { TravelMapView } from "@/components/map/TravelMapView";
import { VisitedCountryFlags } from "@/components/map/VisitedCountryFlags";
import { ProfileCountryLink } from "@/components/profile/ProfilePlaceLink";
import { worldCoveragePercent, type LatestVisitedCountry } from "@/lib/utils/profile-page";
import type { VisitedCity, VisitedCountry, VisitedPark, WishlistCountry } from "@/types/database";

type ProfileMapPanelProps = {
  visitedCountryCodes: string[];
  wishlistCountryCodes: string[];
  visitedCountries: VisitedCountry[];
  wishlistCountries: WishlistCountry[];
  visitedCities: VisitedCity[];
  visitedParks: VisitedPark[];
  isLoggedIn: boolean;
  canEditMap: boolean;
  countryCount: number;
  latestCountry: LatestVisitedCountry | null;
  title: string;
  detailLabel: string;
  markedLabel: string;
  latestAddedPrefix: string;
};

export function ProfileMapPanel({
  visitedCountryCodes,
  wishlistCountryCodes,
  visitedCountries,
  wishlistCountries,
  visitedCities,
  visitedParks,
  isLoggedIn,
  canEditMap,
  countryCount,
  latestCountry,
  title,
  detailLabel,
  markedLabel,
  latestAddedPrefix,
}: ProfileMapPanelProps) {
  const coverage = worldCoveragePercent(countryCount);

  return (
    <section className="profile-section">
      <div className="profile-section-head">
        <h2 className="profile-section-title">{title}</h2>
        <a href="#travel-map" className="profile-see-all">
          {detailLabel}
        </a>
      </div>

      <div className="profile-map-panel">
        <div className="profile-mini-map">
          <TravelMapView
            visitedCountryCodes={visitedCountryCodes}
            wishlistCountryCodes={wishlistCountryCodes}
            visitedCountries={visitedCountries}
            wishlistCountries={wishlistCountries}
            userCities={visitedCities}
            userParks={visitedParks}
            citiesCountryCodes={[
              ...new Set(visitedCities.map((c) => c.country_code.toUpperCase())),
            ]}
            parksCountryCodes={[
              ...new Set(visitedParks.map((p) => p.country_code.toUpperCase())),
            ]}
            isLoggedIn={isLoggedIn}
            canEditMap={canEditMap}
            explorable={false}
            interactive={false}
            showContinentFilter={false}
            compactProfile
          />
        </div>

        <div className="profile-map-caption">
          <div>
            <b>{markedLabel}</b>
            <br />
            {latestCountry ? (
              <span>
                {latestAddedPrefix}
                <ProfileCountryLink
                  slug={latestCountry.countrySlug}
                  name={latestCountry.name}
                />
              </span>
            ) : (
              <span>&nbsp;</span>
            )}
          </div>
          <span>🌍 %{coverage}</span>
        </div>

        <VisitedCountryFlags
          visitedCountries={visitedCountries}
          userCities={visitedCities}
          userParks={visitedParks}
          countryCodes={visitedCountryCodes}
          variant="landing"
        />
      </div>
    </section>
  );
}
