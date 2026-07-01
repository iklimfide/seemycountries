import { createClient } from "@/lib/supabase/server";
import { fetchTravelShareSnapshot } from "@/lib/supabase/travel-share-snapshot";
import { computeTravelUpdateDelta } from "@/lib/utils/travel-update";
import { ProfileTravelUpdateCard } from "@/components/profile/ProfileTravelUpdateCard";
import type { TravelStats, VisitedCity, VisitedCountry, VisitedPark } from "@/types/database";

type ProfileTravelUpdateSectionProps = {
  profileId: string;
  username: string;
  displayName: string;
  stats: TravelStats;
  visitedCountries: VisitedCountry[];
  visitedCities: VisitedCity[];
  visitedParks: VisitedPark[];
  visitedCodes: string[];
};

export async function ProfileTravelUpdateSection({
  profileId,
  username,
  displayName,
  stats,
  visitedCountries,
  visitedCities,
  visitedParks,
  visitedCodes,
}: ProfileTravelUpdateSectionProps) {
  const supabase = await createClient();
  if (!supabase) return null;

  const snapshot = await fetchTravelShareSnapshot(supabase, profileId);
  const delta = computeTravelUpdateDelta(
    snapshot,
    stats,
    visitedCodes,
    visitedCountries,
    visitedCities,
    visitedParks
  );

  return (
    <ProfileTravelUpdateCard
      username={username}
      displayName={displayName}
      stats={stats}
      delta={delta}
    />
  );
}
