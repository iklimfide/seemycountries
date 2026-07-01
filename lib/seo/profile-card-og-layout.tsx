import { BRAND } from "@/lib/constants";
import { WORLD_COUNTRY_TOTAL, worldCoveragePercent } from "@/lib/utils/profile-page";
import {
  getTravelerBadgeLabel,
  getTravelerBadgeTier,
  type TravelerBadgeTier,
} from "@/lib/utils/traveler-badge";
import type { TravelStats } from "@/types/database";

const T = {
  pageBg: "#f4f7fb",
  card: "#ffffff",
  text: "#152033",
  muted: "#728094",
  caption: "#7a8798",
  primary: "#2563eb",
  soft: "#f5f7fb",
  barTrack: "#dfe7f1",
  statDivider: "#dfe5ee",
  heroGradient: "linear-gradient(135deg, #729ac6 0%, #a9c4df 44%, #c7daf0 100%)",
  heroOverlay:
    "linear-gradient(180deg, rgba(15, 23, 42, 0.08) 0%, rgba(15, 23, 42, 0.35) 58%, rgba(15, 23, 42, 0.62) 100%)",
} as const;

const FONT = "system-ui, sans-serif";

const BADGE_STYLES: Record<
  TravelerBadgeTier,
  { background: string; border: string; color: string }
> = {
  explorer: { background: "#ecfdf5", border: "#6ee7b7", color: "#065f46" },
  globetrotter: { background: "#f0f9ff", border: "#7dd3fc", color: "#0c4a6e" },
  super_voyager: { background: "#f5f3ff", border: "#c4b5fd", color: "#5b21b6" },
  world_citizen: { background: "#fffbeb", border: "#fcd34d", color: "#78350f" },
};

export type ProfileCardOgLayoutProps = {
  displayName: string;
  username: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  residence: string | null;
  heroTitle: string;
  heroSubtitle: string;
  description: string;
  stats: TravelStats;
};

function profileInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

function ProfileAvatar({
  displayName,
  avatarUrl,
}: {
  displayName: string;
  avatarUrl: string | null;
}) {
  const size = 88;

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        width={size}
        height={size}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          objectFit: "cover",
          border: `4px solid ${T.primary}`,
          background: T.card,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        border: `4px solid ${T.primary}`,
        background: "#dbeafe",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT,
        fontSize: "36px",
        fontWeight: 800,
        color: T.primary,
      }}
    >
      {profileInitial(displayName)}
    </div>
  );
}

function TravelerBadgePill({ countryCount }: { countryCount: number }) {
  const tier = getTravelerBadgeTier(countryCount);
  const label = getTravelerBadgeLabel(countryCount);
  if (!tier || !label) return null;

  const theme = BADGE_STYLES[tier];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "4px 12px",
        borderRadius: "999px",
        background: theme.background,
        border: `1px solid ${theme.border}`,
        color: theme.color,
        fontFamily: FONT,
        fontSize: "14px",
        fontWeight: 600,
      }}
    >
      {label}
    </div>
  );
}

function StatCounters({ stats }: { stats: TravelStats }) {
  const items = [
    { value: stats.countries, label: "Countries" },
    { value: stats.cities, label: "Cities" },
    { value: stats.nationalParks, label: "Nat. parks" },
    { value: stats.themeParks, label: "Theme parks" },
  ];

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: FONT,
              fontSize: "24px",
              fontWeight: 800,
              color: T.text,
              lineHeight: 1,
            }}
          >
            {String(item.value)}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: FONT,
              fontSize: "13px",
              fontWeight: 600,
              color: T.caption,
            }}
          >
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileCardOgLayout({
  displayName,
  username,
  avatarUrl,
  coverUrl,
  residence,
  heroTitle,
  heroSubtitle,
  description,
  stats,
}: ProfileCardOgLayoutProps) {
  const coverage = worldCoveragePercent(stats.countries);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: T.pageBg,
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          height: "320px",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt=""
            width={1200}
            height={320}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: T.heroGradient,
            }}
          />
        )}
        {coverUrl ? (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: T.heroOverlay,
            }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            maxWidth: "700px",
          }}
        >
          {residence ? (
            <div
              style={{
                display: "flex",
                padding: "8px 14px",
                borderRadius: "999px",
                background: "rgba(255, 255, 255, 0.9)",
                color: "#17233a",
                fontSize: "15px",
                fontWeight: 700,
              }}
            >
              {residence}
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              fontSize: "34px",
              fontWeight: 800,
              color: T.card,
              lineHeight: 1.1,
            }}
          >
            {heroTitle}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "18px",
              color: "rgba(255, 255, 255, 0.92)",
              lineHeight: 1.35,
            }}
          >
            {heroSubtitle}
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 40px 28px",
          background: T.card,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <ProfileAvatar displayName={displayName} avatarUrl={avatarUrl} />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                display: "flex",
                fontSize: "36px",
                fontWeight: 800,
                color: T.text,
                lineHeight: 1.1,
              }}
            >
              {displayName}
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <TravelerBadgePill countryCount={stats.countries} />
              <div
                style={{
                  display: "flex",
                  fontSize: "18px",
                  color: T.primary,
                  fontWeight: 700,
                }}
              >
                {`${coverage}% world explored`}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "17px",
                color: T.muted,
                maxWidth: "520px",
                lineHeight: 1.4,
              }}
            >
              {description}
            </div>
            <div style={{ display: "flex", fontSize: "16px", color: T.caption }}>
              {`@${username}`}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "16px" }}>
          <StatCounters stats={stats} />
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: T.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: T.card,
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "22px",
                fontWeight: 700,
                color: T.text,
              }}
            >
              {BRAND.name}
            </div>
          </div>
          <div style={{ display: "flex", fontSize: "14px", color: T.caption }}>
            {`${stats.countries} of ${WORLD_COUNTRY_TOTAL} countries pinned`}
          </div>
        </div>
      </div>
    </div>
  );
}
