import Link from "next/link";
import { ProfileTripCard } from "@/components/profile/ProfileTripCard";
import type { ProfileTrip } from "@/lib/utils/profile-page";

type ProfileTripsRowProps = {
  trips: ProfileTrip[];
  title: string;
  allLabel: string;
  allHref?: string;
  badgeLabels: Record<NonNullable<ProfileTrip["badge"]>, string>;
  visitCountLabel: (count: number) => string;
  emptyNote: string;
};

export function ProfileTripsRow({
  trips,
  title,
  allLabel,
  allHref,
  badgeLabels,
  visitCountLabel,
  emptyNote,
}: ProfileTripsRowProps) {
  if (trips.length === 0 && !allHref) return null;

  return (
    <section className="profile-section">
      <div className="profile-section-head">
        <h2 className="profile-section-title">{title}</h2>
        {allHref ? (
          <Link href={allHref} className="profile-see-all">
            {allLabel}
          </Link>
        ) : (
          <span className="profile-see-all">{allLabel}</span>
        )}
      </div>

      {trips.length > 0 ? (
        <div className="profile-map-panel profile-trips-panel">
          <div className="profile-panel-scroll scrollbar-thin">
            <div className="profile-cards-row" role="list" aria-label={title}>
              {trips.map((trip) => (
                <ProfileTripCard
                  key={trip.id}
                  trip={trip}
                  badgeLabels={badgeLabels}
                  visitCountLabel={visitCountLabel}
                  emptyNote={emptyNote}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
