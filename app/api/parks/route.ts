import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parkInputSchema } from "@/lib/validations/park";
import { revalidateParkHubForPin } from "@/lib/cache/revalidate-park-hub";
import { ensureVisitedCountry } from "@/lib/supabase/ensure-visited-country";
import { geocodeCity } from "@/lib/utils/geocode";

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = parkInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const code = data.country_code.toUpperCase();

  const countryResult = await ensureVisitedCountry(
    supabase,
    user.id,
    code,
    data.country_name
  );

  if (!countryResult.ok) {
    return NextResponse.json({ error: countryResult.error }, { status: 500 });
  }

  let latitude = data.latitude ?? null;
  let longitude = data.longitude ?? null;

  if (latitude == null && longitude == null) {
    const coords = await geocodeCity(data.park_name, code, data.country_name);
    if (coords) {
      latitude = coords.latitude;
      longitude = coords.longitude;
    }
  }

  const { data: park, error } = await supabase
    .from("visited_parks")
    .insert({
      user_id: user.id,
      park_name: data.park_name,
      park_type: data.park_type,
      country_code: code,
      country_name: data.country_name,
      latitude,
      longitude,
      note: data.note ?? null,
      media_type: data.media_type ?? null,
      media_url: data.media_url ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidateParkHubForPin(park.country_code, park.park_name);

  return NextResponse.json(park);
}
