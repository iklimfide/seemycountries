import { ProfileCityLink, ProfileCountryLink } from "@/components/profile/ProfilePlaceLink";
import type { ProfileSummary } from "@/lib/utils/profile-page";

type ProfileSummaryGridProps = {
  summary: ProfileSummary;
  title: string;
  labels: {
    topVisitTitle: string;
    topVisitEmpty: string;
    topVisitSuffix: string;
    nextRouteTitle: string;
    nextRouteEmpty: string;
    nextRouteSuffix: string;
    countriesTitle: string;
    countriesBody: (count: number) => string;
    favoritesTitle: string;
    favoritesEmpty: string;
    favoritesBody: (count: number) => string;
  };
};

export function ProfileSummaryGrid({ summary, title, labels }: ProfileSummaryGridProps) {
  const favoritesBody =
    summary.repeatCityCount > 0
      ? labels.favoritesBody(summary.repeatCityCount)
      : labels.favoritesEmpty;

  return (
    <section className="profile-section">
      <div className="profile-section-head">
        <h2 className="profile-section-title">{title}</h2>
      </div>

      <div className="profile-summary-grid">
        <div className="profile-summary-card">
          <div className="profile-summary-emoji">📌</div>
          <b>{labels.topVisitTitle}</b>
          <p>
            {summary.topCity ? (
              <>
                <ProfileCityLink slug={summary.topCity.citySlug} name={summary.topCity.name} />
                {labels.topVisitSuffix}
              </>
            ) : (
              labels.topVisitEmpty
            )}
          </p>
        </div>

        <div className="profile-summary-card">
          <div className="profile-summary-emoji">🧭</div>
          <b>{labels.nextRouteTitle}</b>
          <p>
            {summary.nextWishlist ? (
              <>
                <ProfileCountryLink
                  slug={summary.nextWishlist.countrySlug}
                  name={summary.nextWishlist.name}
                />
                {labels.nextRouteSuffix}
              </>
            ) : (
              labels.nextRouteEmpty
            )}
          </p>
        </div>

        <div className="profile-summary-card">
          <div className="profile-summary-emoji">🌍</div>
          <b>{labels.countriesTitle}</b>
          <p>{labels.countriesBody(summary.countryCount)}</p>
        </div>

        <div className="profile-summary-card">
          <div className="profile-summary-emoji">⭐</div>
          <b>{labels.favoritesTitle}</b>
          <p>{favoritesBody}</p>
        </div>
      </div>
    </section>
  );
}
