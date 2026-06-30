import Image from "next/image";
import { ProfileCityLink, ProfileCountryLink } from "@/components/profile/ProfilePlaceLink";
import { countryCodeToFlagUrl } from "@/lib/utils/country-flag";
import type { ProfileTrip } from "@/lib/utils/profile-page";

type ProfileTripsRowProps = {
  trips: ProfileTrip[];
  title: string;
  allLabel: string;
  badgeLabels: Record<NonNullable<ProfileTrip["badge"]>, string>;
  visitCountLabel: (count: number) => string;
  emptyNote: string;
};

function tripGradient(code: string): string {
  const hash = code.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const palettes = [
    "linear-gradient(135deg, #a9c4df, #f4c1a5)",
    "linear-gradient(135deg, #bbc7d7, #e6d7c6)",
    "linear-gradient(135deg, #ceb28c, #8f6d56)",
    "linear-gradient(135deg, #9cc6e7, #e9edf2)",
    "linear-gradient(135deg, #8fb3d9, #d4e8c4)",
  ];
  return palettes[hash % palettes.length];
}

export function ProfileTripsRow({
  trips,
  title,
  allLabel,
  badgeLabels,
  visitCountLabel,
  emptyNote,
}: ProfileTripsRowProps) {
  if (trips.length === 0) return null;

  return (
    <section className="profile-section">
      <div className="profile-section-head">
        <h2 className="profile-section-title">{title}</h2>
        <span className="profile-see-all">{allLabel}</span>
      </div>

      <div className="profile-map-panel profile-trips-panel">
        <div className="profile-panel-scroll scrollbar-thin">
          <div className="profile-cards-row" role="list" aria-label={title}>
            {trips.map((trip) => (
              <article key={trip.id} className="profile-trip">
                <div
                  className="profile-trip-image"
                  style={trip.imageUrl ? undefined : { background: tripGradient(trip.countryCode) }}
                >
                  {trip.imageUrl ? (
                    <Image
                      src={trip.imageUrl}
                      alt=""
                      fill
                      sizes="245px"
                      className="object-cover"
                    />
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
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
