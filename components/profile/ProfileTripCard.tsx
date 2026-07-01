import Image from "next/image";
import type { ReactNode } from "react";
import { ProfileCityLink, ProfileCountryLink, ProfileParkLink } from "@/components/profile/ProfilePlaceLink";
import { countryCodeToFlagUrl } from "@/lib/utils/country-flag";
import { parkTypeLabel } from "@/lib/utils/park-type";
import type { ProfileTrip } from "@/lib/utils/profile-page";

type ProfileTripCardProps = {
  trip: ProfileTrip;
  badgeLabels: Record<NonNullable<ProfileTrip["badge"]>, string>;
  visitCountLabel: (count: number) => string;
  emptyNote: string;
  layout?: "row" | "grid";
  actions?: ReactNode;
};

export function ProfileTripCard({
  trip,
  badgeLabels,
  visitCountLabel,
  emptyNote,
  layout = "row",
  actions,
}: ProfileTripCardProps) {
  return (
    <article
      className={`profile-trip${layout === "grid" ? " profile-trip--grid" : ""}`}
    >
      <div className="profile-trip-image">
        <Image src={trip.imageUrl} alt="" fill sizes="245px" className="object-cover" />
        {trip.badge ? (
          <span className="profile-trip-badge">{badgeLabels[trip.badge]}</span>
        ) : trip.kind === "park" && trip.parkType ? (
          <span className="profile-trip-badge">{parkTypeLabel(trip.parkType)}</span>
        ) : null}
      </div>
      <div className="profile-trip-body">
        <h3>
          {trip.kind === "city" ? (
            <ProfileCityLink
              slug={trip.citySlug}
              name={trip.placeName}
              className="profile-trip-title-link"
            />
          ) : (
            <ProfileParkLink
              slug={trip.parkSlug}
              name={trip.placeName}
              className="profile-trip-title-link"
            />
          )}
        </h3>
        <p>{trip.note?.trim() || emptyNote}</p>
        <div className="profile-trip-meta">
          <span className="profile-chip">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={countryCodeToFlagUrl(trip.countryCode)}
              alt=""
              width={16}
              height={12}
              className="mr-1 inline-block rounded-sm"
            />
            <ProfileCountryLink
              slug={trip.countrySlug}
              name={trip.countryName}
              className="profile-chip-link"
            />
          </span>
          {trip.kind === "city" ? (
            <span className="profile-chip">{visitCountLabel(trip.visitCount)}</span>
          ) : null}
        </div>
        {actions}
      </div>
    </article>
  );
}
