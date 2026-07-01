import Link from "next/link";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ProfileActionButtons } from "@/components/profile/ProfileActionButtons";
import { ProfileStatCounters } from "@/components/profile/ProfileStatCounters";
import { ProfileWorldProgress } from "@/components/profile/ProfileWorldProgress";
import { TravelerBadge } from "@/components/profile/TravelerBadge";
import type { TravelStats } from "@/types/database";

type ProfileIdentityCardProps = {
  avatarUrl: string | null;
  displayName: string;
  username: string;
  bio: string | null;
  fallbackBio: string;
  stats: TravelStats;
  isOwnProfile: boolean;
  countryCount: number;
  labels: {
    countries: string;
    cities: string;
    nationalParks: string;
    themeParks: string;
    share: string;
    edit: string;
  };
  profileHref?: string;
};

export async function ProfileIdentityCard({
  avatarUrl,
  displayName,
  username,
  bio,
  fallbackBio,
  stats,
  isOwnProfile,
  countryCount,
  labels,
  profileHref,
}: ProfileIdentityCardProps) {
  return (
    <section className="profile-card">
      <ProfileActionButtons
        username={username}
        displayName={displayName}
        stats={stats}
        isOwnProfile={isOwnProfile}
        shareLabel={labels.share}
        editLabel={labels.edit}
      />

      <div className="profile-avatar-shell">
        {profileHref ? (
          <Link href={profileHref} className="profile-avatar-link" aria-label={`${displayName}'s profile`}>
            <ProfileAvatar
              avatarUrl={avatarUrl}
              displayName={displayName}
              username={username}
              size="lg"
              className="profile-avatar !h-28 !w-28 !rounded-[32px] !text-[38px] !ring-8 !ring-[#eef3f9]"
            />
          </Link>
        ) : (
          <ProfileAvatar
            avatarUrl={avatarUrl}
            displayName={displayName}
            username={username}
            size="lg"
            className="profile-avatar !h-28 !w-28 !rounded-[32px] !text-[38px] !ring-8 !ring-[#eef3f9]"
          />
        )}
      </div>

      {profileHref ? (
        <h2 className="profile-name">
          <Link href={profileHref} className="profile-name-link">
            {displayName}
          </Link>
        </h2>
      ) : (
        <h2 className="profile-name">{displayName}</h2>
      )}

      <div className="mt-2 flex justify-center">
        <TravelerBadge countryCount={countryCount} />
      </div>

      <p className="profile-desc">{bio?.trim() || fallbackBio}</p>

      <div className="profile-metrics">
        <ProfileWorldProgress countryCount={countryCount} />

        <ProfileStatCounters
          countries={stats.countries}
          cities={stats.cities}
          nationalParks={stats.nationalParks}
          themeParks={stats.themeParks}
          countriesLabel={labels.countries}
          citiesLabel={labels.cities}
          nationalParksLabel={labels.nationalParks}
          themeParksLabel={labels.themeParks}
        />
      </div>
    </section>
  );
}
