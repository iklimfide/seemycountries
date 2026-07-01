import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/constants";
import { shareCardMapDataUrl } from "@/lib/seo/og-map-svg";
import {
  getShareCardFonts,
  SHARE_CARD_FONT_FAMILIES,
} from "@/lib/seo/share-card-fonts";
import { getSiteUrl } from "@/lib/seo/site";
import { countryCodeToFlagUrl } from "@/lib/utils/country-flag";
import { getTravelerBadgeLabel } from "@/lib/utils/traveler-badge";
import type { TravelUpdateDelta } from "@/lib/utils/travel-update";
import type { VisitedCity } from "@/types/database";

export const TRAVEL_UPDATE_SQUARE_SIZE = { width: 1080, height: 1080 } as const;
export const TRAVEL_UPDATE_STORY_SIZE = { width: 1080, height: 1920 } as const;

export type TravelUpdateImageFormat = "square" | "story";

type BuildTravelUpdateImageOptions = {
  displayName: string;
  avatarUrl: string | null;
  delta: TravelUpdateDelta;
  visitedCountryCodes: string[];
  visitedCities: VisitedCity[];
  format: TravelUpdateImageFormat;
};

const T = {
  white: "#ffffff",
  ink: "#0f2744",
  blue: "#2563eb",
  blueDark: "#1e40af",
  blueDeep: "#1e3a8a",
  blueSoft: "#e8f2fc",
  blueLine: "#cfe0f5",
  muted: "#5b6f88",
  violet: "#7c3aed",
  violetSoft: "#f3edff",
} as const;

const FONT = SHARE_CARD_FONT_FAMILIES;

type CardLayoutProps = {
  displayName: string;
  avatarUrl: string | null;
  delta: TravelUpdateDelta;
  mapSrc: string;
  siteUrl: string;
};

function profileInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

function GlobeIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ display: "flex" }}
    >
      <circle cx="12" cy="12" r="9" stroke={T.blue} strokeWidth="2" />
      <path
        d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"
        stroke={T.blue}
        strokeWidth="1.5"
      />
    </svg>
  );
}

function PinLogo({ size = 24 }: { size?: number }) {
  return (
    <div
      style={{
        display: "flex",
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${Math.round(size * 0.22)}px`,
        background: T.white,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: `${Math.round(size * 0.34)}px`,
          height: `${Math.round(size * 0.34)}px`,
          borderRadius: "50%",
          background: T.blue,
        }}
      />
    </div>
  );
}

function WorldExploredBadge({ percent }: { percent: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "12px 16px",
        borderRadius: "16px",
        background: T.white,
        border: `1px solid ${T.blueLine}`,
        boxShadow: "0 4px 14px rgba(37, 99, 235, 0.08)",
      }}
    >
      <GlobeIcon size={30} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontFamily: FONT.sans,
            fontSize: "28px",
            fontWeight: 700,
            color: T.blue,
            lineHeight: 1,
          }}
        >
          {percent}%
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: FONT.sans,
            fontSize: "10px",
            fontWeight: 700,
            color: T.muted,
            letterSpacing: "0.1em",
            marginTop: "3px",
          }}
        >
          WORLD EXPLORED
        </div>
      </div>
    </div>
  );
}

function ProfileHeader({
  displayName,
  avatarUrl,
  badgeLabel,
  worldPercent,
  avatarSize,
}: {
  displayName: string;
  avatarUrl: string | null;
  badgeLabel: string | null;
  worldPercent: number;
  avatarSize: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1 }}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            width={avatarSize}
            height={avatarSize}
            style={{
              width: `${avatarSize}px`,
              height: `${avatarSize}px`,
              borderRadius: "50%",
              border: `3px solid ${T.blueLine}`,
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: `${avatarSize}px`,
              height: `${avatarSize}px`,
              borderRadius: "50%",
              border: `3px solid ${T.blueLine}`,
              background: T.blueSoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT.sans,
              fontSize: `${Math.round(avatarSize * 0.36)}px`,
              fontWeight: 700,
              color: T.blue,
            }}
          >
            {profileInitial(displayName)}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{
              display: "flex",
              fontFamily: FONT.sans,
              fontSize: "30px",
              fontWeight: 700,
              color: T.ink,
              letterSpacing: "-0.02em",
            }}
          >
            {displayName}
          </div>
          {badgeLabel ? (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                alignItems: "center",
                gap: "6px",
                padding: "5px 12px",
                borderRadius: "999px",
                background: T.violetSoft,
                border: "1px solid #ddd6fe",
                color: T.violet,
                fontFamily: FONT.sans,
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              <span style={{ display: "flex", fontSize: "12px" }}>★</span>
              {badgeLabel}
            </div>
          ) : null}
        </div>
      </div>
      <WorldExploredBadge percent={worldPercent} />
    </div>
  );
}

function HeadlineTitle({ hasUpdate, centered = false }: { hasUpdate: boolean; centered?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: centered ? "center" : "flex-start",
        gap: "10px",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          fontFamily: FONT.script,
          fontSize: centered ? "42px" : "38px",
          fontWeight: 700,
          color: T.blue,
          lineHeight: 1,
        }}
      >
        My travel map
      </div>
      {hasUpdate ? (
        <>
          <div
            style={{
              display: "flex",
              fontFamily: FONT.sans,
              fontSize: centered ? "34px" : "30px",
              fontWeight: 700,
              color: T.ink,
              letterSpacing: "0.04em",
            }}
          >
            KEEPS GROWING
          </div>
          <div style={{ display: "flex", fontSize: "28px", color: T.blue }}>✈</div>
        </>
      ) : null}
    </div>
  );
}

function StatGlyph({ kind }: { kind: "globe" | "pin" | "mountain" | "park" }) {
  const color = T.blue;
  if (kind === "globe") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ display: "flex" }}>
        <circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth="2" />
        <path d="M4 12h16M12 4.5a11 11 0 0 1 0 15M12 4.5a11 11 0 0 0 0 15" stroke={color} strokeWidth="1.5" />
      </svg>
    );
  }
  if (kind === "pin") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ display: "flex" }}>
        <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" fill={color} />
        <circle cx="12" cy="11" r="2.2" fill={T.white} />
      </svg>
    );
  }
  if (kind === "mountain") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ display: "flex" }}>
        <path d="M4 18 9 8l4 7 3-5 4 8H4Z" fill={color} />
      </svg>
    );
  }
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ display: "flex" }}>
      <rect x="5" y="9" width="14" height="10" rx="2" fill={color} />
      <path d="M9 9V7a3 3 0 0 1 6 0v2" stroke={color} strokeWidth="2" />
    </svg>
  );
}

function StatsRow({ delta }: { delta: TravelUpdateDelta }) {
  const stats = delta.currentStats;
  const items = [
    { value: stats.countries, label: "COUNTRIES", kind: "globe" as const },
    { value: stats.cities, label: "CITIES", kind: "pin" as const },
    { value: stats.nationalParks, label: "NAT. PARKS", kind: "mountain" as const },
    { value: stats.themeParks, label: "THEME PARKS", kind: "park" as const },
  ];

  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <StatGlyph kind={item.kind} />
          <div
            style={{
              display: "flex",
              fontFamily: FONT.sans,
              fontSize: "28px",
              fontWeight: 700,
              color: T.ink,
              lineHeight: 1,
            }}
          >
            {item.value}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: FONT.sans,
              fontSize: "11px",
              fontWeight: 700,
              color: T.muted,
              letterSpacing: "0.06em",
            }}
          >
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function UpdateSection({
  delta,
  siteUrl,
  stacked = false,
}: {
  delta: TravelUpdateDelta;
  siteUrl: string;
  stacked?: boolean;
}) {
  if (!delta.hasChanges) return null;

  const countries = delta.newCountries.slice(0, 4);
  const deltas: string[] = [];
  if (delta.countriesDelta > 0) {
    deltas.push(`+${delta.countriesDelta} ${delta.countriesDelta === 1 ? "COUNTRY" : "COUNTRIES"}`);
  }
  if (delta.citiesDelta > 0) {
    deltas.push(`+${delta.citiesDelta} ${delta.citiesDelta === 1 ? "CITY" : "CITIES"}`);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: stacked ? "column" : "row",
        alignItems: stacked ? "stretch" : "center",
        justifyContent: "space-between",
        gap: "20px",
        padding: "20px 24px",
        borderRadius: "20px",
        background: T.blueSoft,
        border: `1px solid ${T.blueLine}`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", flex: 1 }}>
        <div
          style={{
            display: "flex",
            fontFamily: FONT.sans,
            fontSize: "12px",
            fontWeight: 700,
            color: T.blue,
            letterSpacing: "0.08em",
          }}
        >
          NEWLY ADDED SINCE LAST SHARE
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          {deltas.map((line) => (
            <div
              key={line}
              style={{
                display: "flex",
                fontFamily: FONT.sans,
                fontSize: "26px",
                fontWeight: 700,
                color: T.blue,
              }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>

      {countries.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            alignItems: stacked ? "flex-start" : "flex-end",
          }}
        >
          {countries.map((country) => (
            <div
              key={country.code}
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <img
                src={`${siteUrl}${countryCodeToFlagUrl(country.code)}`}
                alt=""
                width={28}
                height={20}
                style={{
                  width: "28px",
                  height: "20px",
                  borderRadius: "3px",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  display: "flex",
                  fontFamily: FONT.sans,
                  fontSize: "18px",
                  fontWeight: 600,
                  color: T.ink,
                }}
              >
                {country.name}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function LandmarkStrip() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        height: "54px",
        background: `linear-gradient(180deg, ${T.blueSoft} 0%, #c7dbf2 100%)`,
        gap: "18px",
        padding: "0 24px 0",
        overflow: "hidden",
      }}
    >
      {["🗼", "⛩", "🕌", "🏛", "🗿"].map((icon) => (
        <div
          key={icon}
          style={{
            display: "flex",
            fontSize: "28px",
            opacity: 0.55,
            filter: "grayscale(1) brightness(0.35)",
          }}
        >
          {icon}
        </div>
      ))}
    </div>
  );
}

function FooterBar({ centered = false }: { centered?: boolean }) {
  if (centered) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          height: "56px",
          padding: "0 32px",
          background: T.blueDeep,
        }}
      >
        <PinLogo size={22} />
        <div
          style={{
            display: "flex",
            fontFamily: FONT.sans,
            fontSize: "17px",
            fontWeight: 700,
            color: T.white,
          }}
        >
          {BRAND.name}
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: FONT.sans,
            fontSize: "17px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.9)",
          }}
        >
          {BRAND.domain}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: centered ? "center" : "space-between",
        gap: centered ? "12px" : "0",
        height: "56px",
        padding: centered ? "0 32px" : "0 28px",
        background: T.blueDeep,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <PinLogo size={22} />
        <div
          style={{
            display: "flex",
            fontFamily: FONT.sans,
            fontSize: "18px",
            fontWeight: 700,
            color: T.white,
          }}
        >
          {BRAND.name}
        </div>
      </div>

      {!centered ? (
        <div
          style={{
            display: "flex",
            width: "1px",
            height: "24px",
            background: "rgba(255,255,255,0.28)",
          }}
        />
      ) : null}

      <div
        style={{
          display: "flex",
          fontFamily: FONT.sans,
          fontSize: centered ? "17px" : "18px",
          fontWeight: 600,
          color: "rgba(255,255,255,0.92)",
        }}
      >
        {BRAND.domain}
      </div>
    </div>
  );
}

function MapPreview({ mapSrc, height }: { mapSrc: string; height: number }) {
  return (
    <div
      style={{
        display: "flex",
        height: `${height}px`,
        borderRadius: "18px",
        overflow: "hidden",
        background: "#d4e8f8",
        border: `1px solid ${T.blueLine}`,
      }}
    >
      <img
        src={mapSrc}
        alt=""
        width={1080}
        height={height}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}

function SquareLayout(props: CardLayoutProps) {
  const { displayName, avatarUrl, delta, mapSrc, siteUrl } = props;
  const badgeLabel = getTravelerBadgeLabel(delta.currentStats.countries);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: T.white,
        fontFamily: FONT.sans,
        padding: "28px 32px 0",
        gap: "18px",
      }}
    >
      <ProfileHeader
        displayName={displayName}
        avatarUrl={avatarUrl}
        badgeLabel={badgeLabel}
        worldPercent={delta.worldPercent}
        avatarSize={76}
      />

      <HeadlineTitle hasUpdate={delta.hasChanges} />

      <MapPreview mapSrc={mapSrc} height={310} />

      <StatsRow delta={delta} />

      <UpdateSection delta={delta} siteUrl={siteUrl} />

      <div style={{ display: "flex", flex: 1 }} />

      <div style={{ display: "flex", flexDirection: "column", margin: "0 -32px" }}>
        <LandmarkStrip />
        <FooterBar />
      </div>
    </div>
  );
}

function StoryLayout(props: CardLayoutProps) {
  const { displayName, avatarUrl, delta, mapSrc, siteUrl } = props;
  const badgeLabel = getTravelerBadgeLabel(delta.currentStats.countries);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: T.white,
        fontFamily: FONT.sans,
        padding: "40px 40px 0",
        gap: "24px",
      }}
    >
      <ProfileHeader
        displayName={displayName}
        avatarUrl={avatarUrl}
        badgeLabel={badgeLabel}
        worldPercent={delta.worldPercent}
        avatarSize={84}
      />

      <HeadlineTitle hasUpdate={delta.hasChanges} centered />

      <MapPreview mapSrc={mapSrc} height={620} />

      <StatsRow delta={delta} />

      <UpdateSection delta={delta} siteUrl={siteUrl} stacked />

      <div style={{ display: "flex", flex: 1 }} />

      <div style={{ display: "flex", flexDirection: "column", margin: "0 -40px" }}>
        <LandmarkStrip />
        <FooterBar centered />
      </div>
    </div>
  );
}

export async function buildTravelUpdateImage({
  displayName,
  avatarUrl,
  delta,
  visitedCountryCodes,
  visitedCities,
  format,
}: BuildTravelUpdateImageOptions): Promise<ImageResponse> {
  const mapSrc = shareCardMapDataUrl(visitedCountryCodes, visitedCities);
  const siteUrl = getSiteUrl();
  const size =
    format === "story" ? TRAVEL_UPDATE_STORY_SIZE : TRAVEL_UPDATE_SQUARE_SIZE;
  const fonts = await getShareCardFonts().catch(() => null);

  const layoutProps: CardLayoutProps = {
    displayName,
    avatarUrl,
    delta,
    mapSrc,
    siteUrl,
  };

  return new ImageResponse(
    format === "story" ? (
      <StoryLayout {...layoutProps} />
    ) : (
      <SquareLayout {...layoutProps} />
    ),
    {
      ...size,
      ...(fonts
        ? {
            fonts: [
              {
                name: FONT.script,
                data: fonts.script,
                weight: 700,
                style: "normal" as const,
              },
              {
                name: FONT.sans,
                data: fonts.bold,
                weight: 700,
                style: "normal" as const,
              },
              {
                name: FONT.sans,
                data: fonts.semi,
                weight: 600,
                style: "normal" as const,
              },
            ],
          }
        : {}),
    }
  );
}
