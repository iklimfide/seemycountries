import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ProfileActionButtons } from "@/components/profile/ProfileActionButtons";
import { ProfileStatCounters } from "@/components/profile/ProfileStatCounters";
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
        <ProfileAvatar
          avatarUrl={avatarUrl}
          displayName={displayName}
          username={username}
          size="lg"
          className="profile-avatar !h-24 !w-24 !rounded-[30px] !text-3xl !ring-[6px] !ring-white"
        />
      </div>

      <h2 className="profile-name">{displayName}</h2>

      <div className="mt-2 flex justify-center">
        <TravelerBadge countryCount={countryCount} />
      </div>

      <p className="profile-desc">{bio?.trim() || fallbackBio}</p>

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
    </section>
  );
}
