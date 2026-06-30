import Image from "next/image";
import type { ReactNode } from "react";
import { ProfileCityLink, ProfileCountryLink } from "@/components/profile/ProfilePlaceLink";
import { profileCardGradient } from "@/components/profile/profile-card-gradient";
import { countryCodeToFlagUrl } from "@/lib/utils/country-flag";
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
      <div
        className="profile-trip-image"
        style={trip.imageUrl ? undefined : { background: profileCardGradient(trip.countryCode) }}
      >
        {trip.imageUrl ? (
          <Image src={trip.imageUrl} alt="" fill sizes="245px" className="object-cover" />
        ) : null}
        {trip.badge ? (
          <span className="profile-trip-badge">{badgeLabels[trip.badge]}</span>
        ) : null}
      </div>
      <div className="profile-trip-body">
        <h3>
          <ProfileCityLink
            slug={trip.citySlug}
            name={trip.cityName}
            className="profile-trip-title-link"
          />
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
          <span className="profile-chip">{visitCountLabel(trip.visitCount)}</span>
        </div>
        {actions}
      </div>
    </article>
  );
}
