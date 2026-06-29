import { NextResponse } from "next/server";
import { searchTouristParks } from "@/lib/data/tourist-park-search";
import { PARK_TYPES, type ParkType } from "@/types/database";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country")?.toUpperCase();
  const q = searchParams.get("q") ?? "";
  const type = searchParams.get("type") as ParkType | null;

  if (!country || country.length !== 2) {
    return NextResponse.json({ error: "Invalid country code" }, { status: 400 });
  }

  if (type && !PARK_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid park type" }, { status: 400 });
  }

  const parks = searchTouristParks(country, q, 100, type ?? undefined);

  return NextResponse.json({ parks });
}
