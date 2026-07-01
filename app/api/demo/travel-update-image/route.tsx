import { NextResponse } from "next/server";
import {
  isDemoProfileUsername,
  loadDemoPublicProfilePage,
} from "@/lib/data/jennifer-demo-page";
import { buildTravelUpdateImage } from "@/lib/seo/travel-update-image";
import { loadPublicProfilePage } from "@/lib/supabase/profile-page-data";
import { computeTravelUpdateDelta } from "@/lib/utils/travel-update";
import { resolveProfileDisplayName } from "@/lib/utils/display-name";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = (searchParams.get("username") ?? "").trim().toLowerCase();
  const format = searchParams.get("format") === "story" ? "story" : "square";

  if (!isDemoProfileUsername(username)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data =
    (await loadPublicProfilePage(username)) ?? (await loadDemoPublicProfilePage(username));

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { profile, stats, visitedCodes, visitedCountries, visitedCities, visitedParks } = data;
  const delta = computeTravelUpdateDelta(
    null,
    stats,
    visitedCodes,
    visitedCountries,
    visitedCities,
    visitedParks
  );
  const displayName = resolveProfileDisplayName(profile.display_name, profile.username);

  const response = await buildTravelUpdateImage({
    displayName,
    avatarUrl: profile.avatar_url,
    delta,
    visitedCountryCodes: visitedCodes,
    visitedCities,
    format,
  });

  response.headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  response.headers.set(
    "Content-Disposition",
    `attachment; filename="travelerpin-${username}-update-${format}.png"`
  );
  return response;
}
