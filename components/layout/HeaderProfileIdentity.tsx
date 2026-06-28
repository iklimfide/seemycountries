import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { TravelerBadge } from "@/components/profile/TravelerBadge";

type HeaderProfileIdentityProps = {
  avatarUrl: string | null;
  displayName: string;
  username: string;
  countryCount: number;
};

export function HeaderProfileIdentity({
  avatarUrl,
  displayName,
  username,
  countryCount,
}: HeaderProfileIdentityProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <ProfileAvatar
        avatarUrl={avatarUrl}
        displayName={displayName}
        username={username}
        size="sm"
      />
      <div className="flex min-w-0 flex-col gap-0.5">
        <h1 className="truncate text-base font-bold leading-tight text-header-fg sm:text-lg">
          {displayName}
        </h1>
        <TravelerBadge countryCount={countryCount} />
      </div>
    </div>
  );
}
