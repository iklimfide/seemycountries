import { BRAND } from "@/lib/constants";
import { SHARE_CARD_FONT_FAMILIES } from "@/lib/seo/share-card-fonts";
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

function PinLogo() {
  return (
    <div
      style={{
        display: "flex",
        width: "34px",
        height: "34px",
        borderRadius: "10px",
        background: T.primary,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          background: T.card,
        }}
      />
    </div>
  );
}

function ProfileAvatar({
  displayName,
  avatarUrl,
}: {
  displayName: string;
  avatarUrl: string | null;
}) {
  const size = 96;

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
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "32px",
        border: "8px solid #eef3f9",
        background: "#dbeafe",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: SHARE_CARD_FONT_FAMILIES.sans,
        fontSize: "42px",
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
        alignSelf: "center",
        alignItems: "center",
        gap: "6px",
        padding: "6px 14px",
        borderRadius: "999px",
        background: theme.background,
        border: `1px solid ${theme.border}`,
        color: theme.color,
        fontFamily: SHARE_CARD_FONT_FAMILIES.sans,
        fontSize: "14px",
        fontWeight: 600,
      }}
    >
      <span style={{ display: "flex", fontSize: "12px" }}>★</span>
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
        padding: "18px 20px",
        textAlign: "left",
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
            alignItems: "center",
            gap: "8px",
            fontFamily: SHARE_CARD_FONT_FAMILIES.sans,
            fontSize: "18px",
            fontWeight: 800,
            color: T.text,
          }}
        >
          <span>🌍</span>
          World explored
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: SHARE_CARD_FONT_FAMILIES.sans,
            fontSize: "34px",
            fontWeight: 900,
            color: T.primary,
            lineHeight: 1,
          }}
        >
          {coverage}%
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
          fontFamily: SHARE_CARD_FONT_FAMILIES.sans,
          fontSize: "15px",
          fontWeight: 600,
          color: T.caption,
        }}
      >
        {countryCount} of {WORLD_COUNTRY_TOTAL} countries pinned
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
            padding: "0 6px",
            borderRight: index < items.length - 1 ? `1px solid ${T.statDivider}` : "none",
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: SHARE_CARD_FONT_FAMILIES.sans,
              fontSize: "28px",
              fontWeight: 800,
              color: T.text,
              lineHeight: 1,
              marginBottom: "4px",
            }}
          >
            {item.value}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: SHARE_CARD_FONT_FAMILIES.sans,
              fontSize: "13px",
              fontWeight: 600,
              color: T.caption,
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
  username,
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
        fontFamily: SHARE_CARD_FONT_FAMILIES.sans,
        padding: "16px 40px",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "580px",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "relative",
            minHeight: "176px",
            padding: "22px 24px 72px",
            borderRadius: "0 0 30px 30px",
            overflow: "hidden",
            background: coverUrl ? T.card : undefined,
            boxShadow: "0 16px 40px rgba(25, 43, 68, 0.1)",
          }}
        >
          {coverUrl ? (
            <img
              src={coverUrl}
              alt=""
              width={640}
              height={220}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: T.heroGradient,
              }}
            />
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: coverUrl ? T.heroOverlay : "transparent",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              position: "relative",
              zIndex: 2,
              width: "100%",
              gap: "18px",
            }}
          >
            {residence ? (
              <div
                style={{
                  display: "flex",
                  alignSelf: "flex-start",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  borderRadius: "24px",
                  background: "rgba(255, 255, 255, 0.86)",
                  color: "#17233a",
                  fontSize: "16px",
                  fontWeight: 800,
                }}
              >
                <span>📍</span>
                {residence}
              </div>
            ) : null}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", color: T.card }}>
              <div
                style={{
                  display: "flex",
                  fontSize: "30px",
                  fontWeight: 800,
                  lineHeight: 1.05,
                  letterSpacing: "-1px",
                  maxWidth: "420px",
                }}
              >
                {heroTitle}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "16px",
                  lineHeight: 1.45,
                  color: "rgba(255, 255, 255, 0.9)",
                  maxWidth: "420px",
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
            borderRadius: "28px",
            padding: "68px 24px 22px",
            boxShadow: "0 20px 40px rgba(16, 32, 60, 0.12)",
            position: "relative",
            zIndex: 3,
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: "-48px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <ProfileAvatar displayName={displayName} avatarUrl={avatarUrl} />
          </div>

          <div
            style={{
              display: "flex",
              fontSize: "30px",
              fontWeight: 800,
              letterSpacing: "-1px",
              color: T.text,
              lineHeight: 1.1,
              marginBottom: "10px",
            }}
          >
            {displayName}
          </div>

          <TravelerBadgePill countryCount={stats.countries} />

          <div
            style={{
              display: "flex",
              marginTop: "14px",
              marginBottom: "16px",
              maxWidth: "500px",
              fontSize: "15px",
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
              gap: "14px",
            }}
          >
            <WorldProgress countryCount={stats.countries} />
            <StatCounters stats={stats} />
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          position: "absolute",
          right: "40px",
          bottom: "32px",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <PinLogo />
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <div
            style={{
              display: "flex",
              fontFamily: SHARE_CARD_FONT_FAMILIES.sans,
              fontSize: "22px",
              fontWeight: 700,
              color: T.text,
            }}
          >
            {BRAND.name}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: SHARE_CARD_FONT_FAMILIES.sans,
              fontSize: "15px",
              fontWeight: 600,
              color: T.caption,
            }}
          >
            @{username}
          </div>
        </div>
      </div>
    </div>
  );
}
