import Link from "next/link";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import type { CountryTraveler } from "@/lib/supabase/country-travelers";

type HubRecentTravelersProps = {
  travelers: CountryTraveler[];
  headingId: string;
  labels: {
    recentTravelers: string;
    noTravelersYet: string;
    pinCta: string;
  };
  registerHref?: string;
};

export function HubRecentTravelers({
  travelers,
  headingId,
  labels,
  registerHref = "/register",
}: HubRecentTravelersProps) {
  return (
    <section className="city-page__section" aria-labelledby={headingId}>
      <h2 id={headingId} className="city-page__section-title">
        {labels.recentTravelers}
      </h2>
      {travelers.length > 0 ? (
        <ul className="city-page__travelers">
          {travelers.map((traveler) => (
            <li key={traveler.username}>
              <Link href={traveler.profilePath} className="city-page__traveler-link">
                <ProfileAvatar
                  avatarUrl={traveler.avatarUrl}
                  displayName={traveler.displayName}
                  username={traveler.username}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="city-page__traveler-name">{traveler.displayName}</p>
                  <p className="city-page__traveler-handle">@{traveler.username}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="city-page__empty">
          {labels.noTravelersYet}{" "}
          <Link href={registerHref} className="city-page__link">
            {labels.pinCta}
          </Link>
        </p>
      )}
    </section>
  );
}
