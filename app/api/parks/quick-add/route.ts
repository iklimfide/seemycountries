import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { quickParkSchema } from "@/lib/validations/park";

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
  const parsed = quickParkSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const code = data.country_code.toUpperCase();

  const { data: existingPark } = await supabase
    .from("visited_parks")
    .select("id")
    .eq("user_id", user.id)
    .eq("country_code", code)
    .eq("park_type", data.park_type)
    .ilike("park_name", data.park_name)
    .maybeSingle();

  if (existingPark) {
    return NextResponse.json({ park: existingPark, added: false, alreadyHad: true });
  }

  const { data: visitedCountry } = await supabase
    .from("visited_countries")
    .select("id")
    .eq("user_id", user.id)
    .eq("country_code", code)
    .maybeSingle();

  if (!visitedCountry) {
    const { error: countryError } = await supabase.from("visited_countries").insert({
      user_id: user.id,
      country_code: code,
      country_name: data.country_name,
    });

    if (countryError && countryError.code !== "23505") {
      return NextResponse.json({ error: countryError.message }, { status: 500 });
    }

    await supabase
      .from("wishlist_countries")
      .delete()
      .eq("user_id", user.id)
      .eq("country_code", code);
  }

  const { data: park, error: parkError } = await supabase
    .from("visited_parks")
    .insert({
      user_id: user.id,
      park_name: data.park_name,
      park_type: data.park_type,
      country_code: code,
      country_name: data.country_name,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      note: null,
      media_type: null,
      media_url: null,
    })
    .select()
    .single();

  if (parkError) {
    return NextResponse.json({ error: parkError.message }, { status: 500 });
  }

  return NextResponse.json({ park, added: true, alreadyHad: false });
}
