import { NextResponse } from "next/server";
import { searchTouristCities } from "@/lib/data/tourist-cities";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country")?.toUpperCase();
  const q = searchParams.get("q")?.trim() ?? "";

  if (!country || country.length !== 2) {
    return NextResponse.json({ error: "Country is required" }, { status: 400 });
  }

  const cities = searchTouristCities(country, q, 100);
  return NextResponse.json({ cities });
}
