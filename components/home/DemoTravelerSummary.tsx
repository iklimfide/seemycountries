import Link from "next/link";
import { TravelStatsBar } from "@/components/stats/TravelStats";
import { formatMessage, homeMessages } from "@/lib/i18n/client-messages";
import type { TravelStats } from "@/types/database";

type DemoTravelerSummaryProps = {
  name: string;
  stats: TravelStats;
  wishlistCountries: number;
};

export function DemoTravelerSummary({
  name,
  stats,
  wishlistCountries,
}: DemoTravelerSummaryProps) {
  const story = formatMessage(homeMessages.demoTravelerStory, {
    name,
    countries: stats.countries,
    cities: stats.cities,
    wishlist: wishlistCountries,
  });

  return (
    <div className="flex flex-col gap-3 sm:max-w-md sm:items-end">
      <TravelStatsBar stats={stats} />
      <p className="text-sm leading-relaxed text-slate-400 sm:text-right">
        {story}{" "}
        <Link href="/register" className="font-medium text-blue-400 hover:text-blue-300">
          {homeMessages.createYourMap}
        </Link>
      </p>
    </div>
  );
}
