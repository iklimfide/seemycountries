"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CityForm } from "@/components/dashboard/CityForm";
import { ParkForm } from "@/components/dashboard/ParkForm";
import { ProfileCountryDestinationCard } from "@/components/profile/ProfileCountryDestinationCard";
import { ProfileDestinationCardActions } from "@/components/profile/ProfileDestinationCardActions";
import { ProfileParkDestinationCard } from "@/components/profile/ProfileParkDestinationCard";
import { ProfileTripCard } from "@/components/profile/ProfileTripCard";
import { ProfileWishlistDestinationCard } from "@/components/profile/ProfileWishlistDestinationCard";
import { useModal } from "@/components/ui/ModalProvider";
import { useToast } from "@/components/ui/ToastProvider";
import {
  commonMessages,
  countryMessages,
  formatMessage,
  modalMessages,
  profileDestinationCityCountLabel,
  profileDestinationParkCountLabel,
  profileMessages,
  profileVisitCountLabel,
} from "@/lib/i18n/client-messages";
import { profilePath } from "@/lib/seo/site";
import {
  countryHasMappedPlaces,
  isCountryRemoveBlockedByPlacesError,
} from "@/lib/utils/country-remove";
import type { ProfileAllDestinations } from "@/lib/utils/profile-all-destinations";
import type { ProfileTrip } from "@/lib/utils/profile-page";
import type { VisitedCity, VisitedCountry, VisitedPark } from "@/types/database";

type ProfileAllDestinationsViewProps = {
  username: string;
  displayName: string;
  isOwnProfile: boolean;
  destinations: ProfileAllDestinations;
  visitedCountries: VisitedCountry[];
  visitedCities: VisitedCity[];
  visitedParks: VisitedPark[];
};

function DestinationSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: ReactNode;
}) {
  if (count === 0) return null;

  return (
    <section className="profile-all-section">
      <div className="profile-section-head">
        <h2 className="profile-section-title">{title}</h2>
        <span className="profile-all-section__count">{count}</span>
      </div>
      <div className="profile-all-grid" role="list" aria-label={title}>
        {children}
      </div>
    </section>
  );
}

export function ProfileAllDestinationsView({
  username,
  displayName,
  isOwnProfile,
  destinations,
  visitedCountries,
  visitedCities,
  visitedParks,
}: ProfileAllDestinationsViewProps) {
  const router = useRouter();
  const modal = useModal();
  const toast = useToast();
  const [editingCityId, setEditingCityId] = useState<string | null>(null);
  const [editingParkId, setEditingParkId] = useState<string | null>(null);

  const title = isOwnProfile
    ? profileMessages.allDestinationsTitle
    : formatMessage(profileMessages.allDestinationsTitleVisitor, { name: displayName });

  const badgeLabels: Record<NonNullable<ProfileTrip["badge"]>, string> = {
    recent: profileMessages.tripBadgeRecent,
    favorite: profileMessages.tripBadgeFavorite,
    dayTrip: profileMessages.tripBadgeDayTrip,
  };

  const totalCount =
    destinations.countries.length +
    destinations.cities.length +
    destinations.parks.length +
    destinations.wishlist.length;

  const editingCity = visitedCities.find((city) => city.id === editingCityId);
  const editingPark = visitedParks.find((park) => park.id === editingParkId);

  async function handleDeleteCity(id: string) {
    const confirmed = await modal.confirm(modalMessages.deleteCityMessage, {
      title: modalMessages.deleteCityTitle,
      destructive: true,
    });
    if (!confirmed) return;

    const res = await fetch(`/api/cities/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      await modal.alert(data.error ?? "Failed to delete city", { variant: "error" });
      return;
    }
    router.refresh();
  }

  async function handleDeletePark(id: string) {
    const confirmed = await modal.confirm(modalMessages.deleteParkMessage, {
      title: modalMessages.deleteParkTitle,
      destructive: true,
    });
    if (!confirmed) return;

    const res = await fetch(`/api/parks/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      await modal.alert(data.error ?? "Failed to delete park", { variant: "error" });
      return;
    }
    router.refresh();
  }

  async function handleRemoveCountry(country: ProfileAllDestinations["countries"][number]) {
    const blockedByPlaces =
      country.cityCount > 0 ||
      country.parkCount > 0 ||
      country.visitedViaPlacesOnly ||
      countryHasMappedPlaces(country.code, visitedCities, visitedParks);

    if (blockedByPlaces) {
      toast.show(countryMessages.removePlacesFirst);
      return;
    }
    if (!country.visitedId) return;

    const confirmed = await modal.confirm(modalMessages.deleteCountryMessage, {
      title: modalMessages.deleteCountryTitle,
      destructive: true,
    });
    if (!confirmed) return;

    const res = await fetch(`/api/countries/${country.visitedId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      if (isCountryRemoveBlockedByPlacesError(data.error)) {
        toast.show(countryMessages.removePlacesFirst);
        return;
      }
      await modal.alert(data.error ?? "Failed to remove country", { variant: "error" });
      return;
    }
    router.refresh();
  }

  async function handleRemoveWishlist(id: string) {
    const confirmed = await modal.confirm(modalMessages.deleteWishlistCountryMessage, {
      title: modalMessages.deleteWishlistCountryTitle,
      destructive: true,
    });
    if (!confirmed) return;

    const res = await fetch(`/api/wishlist/countries/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      await modal.alert(data.error ?? "Failed to remove from wishlist", { variant: "error" });
      return;
    }
    router.refresh();
  }

  const ownerActions = isOwnProfile
    ? {
        editLabel: commonMessages.edit,
        removeLabel: commonMessages.delete,
      }
    : null;

  return (
    <div className="profile-page profile-all-page">
      <div className="profile-shell">
        <header className="profile-all-header">
          <Link href={profilePath(username)} className="profile-all-back">
            ← {profileMessages.allDestinationsBack}
          </Link>
          <h1 className="profile-all-title">{title}</h1>
        </header>

        {editingCity ? (
          <div className="profile-all-edit-panel">
            <CityForm
              city={editingCity}
              visitedCountries={visitedCountries}
              onSuccess={() => setEditingCityId(null)}
              onCancel={() => setEditingCityId(null)}
            />
          </div>
        ) : null}

        {editingPark ? (
          <div className="profile-all-edit-panel">
            <ParkForm
              park={editingPark}
              visitedCountries={visitedCountries}
              onSuccess={() => setEditingParkId(null)}
              onCancel={() => setEditingParkId(null)}
            />
          </div>
        ) : null}

        {totalCount === 0 ? (
          <p className="profile-empty">{profileMessages.allDestinationsEmpty}</p>
        ) : (
          <main className="profile-all-main">
            <DestinationSection
              title={profileMessages.allDestinationsCountries}
              count={destinations.countries.length}
            >
              {destinations.countries.map((country) => (
                <ProfileCountryDestinationCard
                  key={country.code}
                  country={country}
                  cityCountLabel={profileDestinationCityCountLabel}
                  parkCountLabel={profileDestinationParkCountLabel}
                  actions={
                    ownerActions ? (
                      <ProfileDestinationCardActions
                        removeLabel={ownerActions.removeLabel}
                        editLabel={ownerActions.editLabel}
                        onRemove={() => handleRemoveCountry(country)}
                      />
                    ) : null
                  }
                />
              ))}
            </DestinationSection>

            <DestinationSection
              title={profileMessages.allDestinationsCities}
              count={destinations.cities.length}
            >
              {destinations.cities.map((trip) => (
                <ProfileTripCard
                  key={trip.id}
                  trip={trip}
                  badgeLabels={badgeLabels}
                  visitCountLabel={profileVisitCountLabel}
                  emptyNote={profileMessages.tripDefaultNote}
                  layout="grid"
                  actions={
                    ownerActions ? (
                      <ProfileDestinationCardActions
                        editLabel={ownerActions.editLabel}
                        removeLabel={ownerActions.removeLabel}
                        onEdit={() => setEditingCityId(trip.id)}
                        onRemove={() => handleDeleteCity(trip.id)}
                      />
                    ) : null
                  }
                />
              ))}
            </DestinationSection>

            <DestinationSection
              title={profileMessages.allDestinationsParks}
              count={destinations.parks.length}
            >
              {destinations.parks.map((park) => (
                <ProfileParkDestinationCard
                  key={park.id}
                  park={park}
                  emptyNote={profileMessages.tripDefaultNote}
                  actions={
                    ownerActions ? (
                      <ProfileDestinationCardActions
                        editLabel={ownerActions.editLabel}
                        removeLabel={ownerActions.removeLabel}
                        onEdit={() => setEditingParkId(park.id)}
                        onRemove={() => handleDeletePark(park.id)}
                      />
                    ) : null
                  }
                />
              ))}
            </DestinationSection>

            <DestinationSection
              title={profileMessages.wishlistCountries}
              count={destinations.wishlist.length}
            >
              {destinations.wishlist.map((country) => (
                <ProfileWishlistDestinationCard
                  key={country.id}
                  country={country}
                  wantLabel={profileMessages.wantsToVisit}
                  actions={
                    ownerActions ? (
                      <ProfileDestinationCardActions
                        removeLabel={ownerActions.removeLabel}
                        editLabel={ownerActions.editLabel}
                        onRemove={() => handleRemoveWishlist(country.id)}
                      />
                    ) : null
                  }
                />
              ))}
            </DestinationSection>
          </main>
        )}
      </div>
    </div>
  );
}
