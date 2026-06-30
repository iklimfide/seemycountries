import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { TravelMapFocusShell } from "@/components/map/TravelMapFocusShell";
import { HomeFeatures } from "@/components/home/HomeFeatures";
import { ProfileHeroCover } from "@/components/profile/ProfileHeroCover";
import { ProfileIdentityCard } from "@/components/profile/ProfileIdentityCard";
import { ProfileMapPanel } from "@/components/profile/ProfileMapPanel";
import { ProfileSummaryGrid } from "@/components/profile/ProfileSummaryGrid";
import { ProfileTripsRow } from "@/components/profile/ProfileTripsRow";
import {
  buildProfileSummary,
  buildProfileTrips,
  latestVisitedCountry,
  resolveProfileCoverUrl,
} from "@/lib/utils/profile-page";
import { resolveProfileDisplayName } from "@/lib/utils/display-name";
import { profileAllPath } from "@/lib/seo/site";
import type { PublicProfilePageData } from "@/lib/supabase/profile-page-data";

type PublicProfileViewProps = {
  data: PublicProfilePageData;
  profileDescription: string;
  isOwnProfile: boolean;
  isGuest: boolean;
  ownerTools?: ReactNode;
};

export async function PublicProfileView({
  data,
  profileDescription,
  isOwnProfile,
  isGuest,
  ownerTools,
}: PublicProfileViewProps) {
  const [t, tHome] = await Promise.all([getTranslations("profile"), getTranslations("home")]);

  const {
    profile,
    visitedCountries,
    visitedCities,
    visitedParks,
    wishlistCountries,
    stats,
    visitedCodes,
    wishlistCodes,
    isLoggedIn,
  } = data;

  const displayName = resolveProfileDisplayName(profile.display_name, profile.username);
  const wishlistPublic = profile.wishlist_public;
  const visibleWishlistCountries =
    isOwnProfile || wishlistPublic ? wishlistCountries : [];
  const visibleWishlistCodes =
    isOwnProfile || wishlistPublic ? wishlistCodes : [];
  const hasMapContent =
    visitedCountries.length > 0 ||
    visitedCities.length > 0 ||
    visitedParks.length > 0 ||
    visibleWishlistCodes.length > 0;

  const coverUrl = resolveProfileCoverUrl(visitedCities, visitedParks);
  const trips = buildProfileTrips(visitedCities);
  const summary = buildProfileSummary(
    visitedCountries,
    visitedCities,
    visitedParks,
    visibleWishlistCountries
  );
  const latestCountry = latestVisitedCountry(visitedCountries, visitedCities, visitedParks);

  return (
    <TravelMapFocusShell>
      <div className="profile-page">
        <div className="profile-shell">
          <ProfileHeroCover
            coverUrl={coverUrl}
            residence={profile.residence}
            heroTitle={isOwnProfile ? t("travelDiaryTitle") : t("travelDiaryTitleVisitor", { name: displayName })}
            heroSubtitle={t("travelDiarySubtitle")}
          />

          <main className="profile-main">
            <ProfileIdentityCard
              avatarUrl={profile.avatar_url}
              displayName={displayName}
              username={profile.username}
              bio={profile.bio}
              fallbackBio={profileDescription}
              stats={stats}
              isOwnProfile={isOwnProfile}
              countryCount={stats.countries}
              labels={{
                countries: t("statCountriesShort"),
                cities: t("statCitiesShort"),
                nationalParks: t("statNationalParksShort"),
                themeParks: t("statThemeParksShort"),
                share: t("shareProfile"),
                edit: t("editProfile"),
              }}
            />

            {hasMapContent ? (
              <ProfileMapPanel
                visitedCountryCodes={visitedCodes}
                wishlistCountryCodes={visibleWishlistCodes}
                visitedCountries={visitedCountries}
                wishlistCountries={visibleWishlistCountries}
                visitedCities={visitedCities}
                visitedParks={visitedParks}
                isLoggedIn={isLoggedIn}
                canEditMap={isOwnProfile}
                countryCount={stats.countries}
                latestCountry={latestCountry}
                title={t("worldMapTitle")}
                detailLabel={t("mapDetail")}
                markedLabel={t("countriesMarked", { count: stats.countries })}
                latestAddedPrefix={t("latestAddedPrefix")}
              />
            ) : (
              <section className="profile-section">
                <p className="profile-empty">{t("noCountries")}</p>
              </section>
            )}

            <ProfileTripsRow
              trips={trips}
              title={t("myTrips")}
              allLabel={t("tripsAll")}
              allHref={hasMapContent ? profileAllPath(profile.username) : undefined}
              badgeLabels={{
                recent: t("tripBadgeRecent"),
                favorite: t("tripBadgeFavorite"),
                dayTrip: t("tripBadgeDayTrip"),
              }}
              visitCountLabel={(count) => t("tripVisitCount", { count })}
              emptyNote={t("tripDefaultNote")}
            />

            {ownerTools ? (
              <div className="profile-dashboard-tools">{ownerTools}</div>
            ) : null}

            {!isOwnProfile && hasMapContent ? (
              <section className="profile-section">
                <HomeFeatures />
              </section>
            ) : null}

            {!isOwnProfile && isGuest ? (
              <section className="profile-cta">
                <div>
                  <p className="profile-cta-title">{tHome("ctaTitle")}</p>
                  <p className="profile-cta-hint">{tHome("ctaHint")}</p>
                </div>
                <div className="profile-cta-actions">
                  <Link href="/register" className="profile-cta-primary">
                    {t("createYourMap")}
                  </Link>
                  <Link href="/login" className="profile-cta-secondary">
                    {tHome("login")}
                  </Link>
                </div>
              </section>
            ) : null}

            <ProfileSummaryGrid
              summary={summary}
              title={t("summaryTitle")}
              labels={{
                topVisitTitle: t("summaryTopVisit"),
                topVisitEmpty: t("summaryTopVisitEmpty"),
                topVisitSuffix: t("summaryTopVisitSuffix"),
                nextRouteTitle: t("summaryNextRoute"),
                nextRouteEmpty: t("summaryNextRouteEmpty"),
                nextRouteSuffix: t("summaryNextRouteSuffix"),
                countriesTitle: t("summaryCountries"),
                countriesBody: (count) => t("summaryCountriesBody", { count }),
                favoritesTitle: t("summaryFavorites"),
                favoritesEmpty: t("summaryFavoritesEmpty"),
                favoritesBody: (count) => t("summaryFavoritesBody", { count }),
              }}
            />
          </main>
        </div>
      </div>
    </TravelMapFocusShell>
  );
}
