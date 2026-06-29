import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cityInputSchema } from "@/lib/validations/city";
import { geocodeCity } from "@/lib/utils/geocode";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
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

  const { data: existing } = await supabase
    .from("visited_cities")
    .select("city_name, country_code, latitude, longitude")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "City not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = cityInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const code = data.country_code.toUpperCase();

  const { data: visitedCountry } = await supabase
    .from("visited_countries")
    .select("id")
    .eq("user_id", user.id)
    .eq("country_code", code)
    .maybeSingle();

  if (!visitedCountry) {
    return NextResponse.json(
      { error: "Add this country to your map before adding a city" },
      { status: 400 }
    );
  }

  const locationChanged =
    existing.city_name !== data.city_name ||
    existing.country_code.toUpperCase() !== code;

  let latitude = existing.latitude;
  let longitude = existing.longitude;

  if (locationChanged) {
    const coords = await geocodeCity(data.city_name, code, data.country_name);
    latitude = coords?.latitude ?? null;
    longitude = coords?.longitude ?? null;
  }

  const { data: city, error } = await supabase
    .from("visited_cities")
    .update({
      city_name: data.city_name,
      country_code: code,
      country_name: data.country_name,
      latitude,
      longitude,
      note: data.note ?? null,
      media_type: data.media_type ?? null,
      media_url: data.media_url ?? null,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(city);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
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

  const { error } = await supabase
    .from("visited_cities")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
