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
const SHELL_W = 560;
const AVATAR = 112;
const AVATAR_LEFT = (SHELL_W - AVATAR) / 2;

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
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        width={AVATAR}
        height={AVATAR}
        style={{
          width: `${AVATAR}px`,
          height: `${AVATAR}px`,
          borderRadius: "32px",
          objectFit: "cover",
          border: "8px solid #eef3f9",
          background: T.card,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: `${AVATAR}px`,
        height: `${AVATAR}px`,
        borderRadius: "32px",
        border: "8px solid #eef3f9",
        background: "#dbeafe",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT,
        fontSize: "38px",
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
  if (!tier || !label) {
    return <div style={{ display: "flex", height: "8px" }} />;
  }

  const theme = BADGE_STYLES[tier];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "5px 14px",
        borderRadius: "999px",
        background: theme.background,
        border: `1px solid ${theme.border}`,
        color: theme.color,
        fontFamily: FONT,
        fontSize: "13px",
        fontWeight: 600,
      }}
    >
      {label}
    </div>
  );
}

function WorldProgress({ countryCount }: { countryCount: number }) {
  const coverage = worldCoveragePercent(countryCount);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: T.soft,
        borderRadius: "24px",
        padding: "18px",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: FONT,
            fontSize: "16px",
            fontWeight: 800,
            color: "#142033",
          }}
        >
          World explored
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: FONT,
            fontSize: "30px",
            fontWeight: 900,
            color: T.primary,
            lineHeight: 1,
          }}
        >
          {`${coverage}%`}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          height: "12px",
          background: T.barTrack,
          borderRadius: "999px",
          overflow: "hidden",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            width: `${coverage}%`,
            height: "100%",
            background: T.primary,
            borderRadius: "999px",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          fontFamily: FONT,
          fontSize: "14px",
          fontWeight: 600,
          color: T.caption,
        }}
      >
        {`${countryCount} of ${WORLD_COUNTRY_TOTAL} countries pinned`}
      </div>
    </div>
  );
}

function StatCounters({ stats }: { stats: TravelStats }) {
  const items = [
    { value: stats.countries, label: "Country" },
    { value: stats.cities, label: "City" },
    { value: stats.nationalParks, label: "Nat. park" },
    { value: stats.themeParks, label: "Theme park" },
  ];

  return (
    <div
      style={{
        display: "flex",
        background: T.soft,
        borderRadius: "24px",
        padding: "18px 10px",
        width: "100%",
      }}
    >
      {items.map((item, index) => (
        <div
          key={item.label}
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            alignItems: "center",
            padding: "0 4px",
            borderRight:
              index < items.length - 1 ? `1px solid ${T.statDivider}` : "0px solid transparent",
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: FONT,
              fontSize: "25px",
              fontWeight: 800,
              color: "#142033",
              lineHeight: 1,
              marginBottom: "4px",
            }}
          >
            {String(item.value)}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: FONT,
              fontSize: "12px",
              fontWeight: 600,
              color: "#7b8798",
              textAlign: "center",
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
  avatarUrl,
  coverUrl,
  residence,
  heroTitle,
  heroSubtitle,
  description,
  stats,
}: ProfileCardOgLayoutProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: T.pageBg,
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          display: "flex",
          width: `${SHELL_W}px`,
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "relative",
            height: "210px",
            padding: "24px 22px 78px",
            borderRadius: "0 0 30px 30px",
            overflow: "hidden",
            background: T.heroGradient,
          }}
        >
          {coverUrl ? (
            <img
              src={coverUrl}
              alt=""
              width={SHELL_W}
              height={210}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : null}
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
              display: "flex",
              flexDirection: "column",
              position: "relative",
              width: "100%",
              gap: "14px",
            }}
          >
            {residence ? (
              <div
                style={{
                  display: "flex",
                  alignSelf: "flex-start",
                  alignItems: "center",
                  padding: "10px 16px",
                  borderRadius: "24px",
                  background: "rgba(255, 255, 255, 0.86)",
                  color: "#17233a",
                  fontSize: "15px",
                  fontWeight: 800,
                }}
              >
                {residence}
              </div>
            ) : null}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", color: T.card }}>
              <div
                style={{
                  display: "flex",
                  fontSize: "34px",
                  fontWeight: 800,
                  lineHeight: 1.05,
                  maxWidth: "360px",
                }}
              >
                {heroTitle}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "16px",
                  lineHeight: 1.45,
                  color: "rgba(255, 255, 255, 0.88)",
                  maxWidth: "360px",
                }}
              >
                {heroSubtitle}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "-64px",
            background: T.card,
            borderRadius: "30px",
            padding: "72px 22px 24px",
            position: "relative",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: "-52px",
              left: `${AVATAR_LEFT}px`,
            }}
          >
            <ProfileAvatar displayName={displayName} avatarUrl={avatarUrl} />
          </div>

          <div
            style={{
              display: "flex",
              fontSize: "32px",
              fontWeight: 800,
              color: T.text,
              lineHeight: 1.1,
              marginBottom: "8px",
            }}
          >
            {displayName}
          </div>

          <TravelerBadgePill countryCount={stats.countries} />

          <div
            style={{
              display: "flex",
              marginTop: "16px",
              marginBottom: "18px",
              maxWidth: "460px",
              fontSize: "17px",
              lineHeight: 1.45,
              color: T.muted,
              textAlign: "center",
            }}
          >
            {description}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: "18px",
            }}
          >
            <WorldProgress countryCount={stats.countries} />
            <StatCounters stats={stats} />
          </div>
        </div>
      </div>
    </div>
  );
}
