export type TravelerBadgeTier =
  | "explorer"
  | "globetrotter"
  | "super_voyager"
  | "world_citizen";

export type BadgeTierTheme = {
  /** Tailwind classes for the badge shell */
  shell: string;
  /** Icon stroke/fill color class */
  icon: string;
};

/** Visited country count → badge tier (1-based thresholds per product spec). */
export function getTravelerBadgeTier(
  countryCount: number
): TravelerBadgeTier | null {
  if (countryCount < 1) return null;
  if (countryCount <= 4) return "explorer";
  if (countryCount <= 14) return "globetrotter";
  if (countryCount <= 29) return "super_voyager";
  return "world_citizen";
}

/** Per-tier colors — progression from fresh explorer to gold world citizen. */
export const BADGE_TIER_THEMES: Record<TravelerBadgeTier, BadgeTierTheme> = {
  explorer: {
    shell:
      "border-emerald-500/45 bg-emerald-500/12 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.12)]",
    icon: "text-emerald-400",
  },
  globetrotter: {
    shell:
      "border-sky-500/45 bg-sky-500/12 text-sky-100 shadow-[0_0_20px_rgba(14,165,233,0.14)]",
    icon: "text-sky-400",
  },
  super_voyager: {
    shell:
      "border-violet-500/45 bg-violet-500/12 text-violet-100 shadow-[0_0_22px_rgba(139,92,246,0.16)]",
    icon: "text-violet-400",
  },
  world_citizen: {
    shell:
      "border-amber-400/55 bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-orange-500/15 text-amber-50 shadow-[0_0_24px_rgba(251,191,36,0.2)]",
    icon: "text-amber-300",
  },
};
