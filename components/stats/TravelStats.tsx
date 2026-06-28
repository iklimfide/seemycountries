import { getTranslations } from "next-intl/server";
import type { TravelStats } from "@/types/database";

type TravelStatsProps = {
  stats: TravelStats;
  className?: string;
};

export async function TravelStatsBar({ stats, className = "" }: TravelStatsProps) {
  const t = await getTranslations("common");

  return (
    <div
      className={`inline-flex items-center gap-3 rounded-full border border-blue-500/30 bg-blue-500/10 px-6 py-3 text-lg font-semibold tracking-wide text-blue-800 dark:text-blue-100 ${className}`}
    >
      <span>
        <span className="text-2xl font-bold text-foreground">{stats.countries}</span>{" "}
        <span className="text-sm font-medium text-blue-700 dark:text-blue-200">{t("countries")}</span>
      </span>
      <span className="text-blue-500/60 dark:text-blue-400/60">|</span>
      <span>
        <span className="text-2xl font-bold text-foreground">{stats.cities}</span>{" "}
        <span className="text-sm font-medium text-blue-700 dark:text-blue-200">{t("cities")}</span>
      </span>
    </div>
  );
}
