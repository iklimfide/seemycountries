import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { profileSettingsSchema, PROFILE_SELECT } from "@/lib/validations/profile";

export async function PATCH(request: Request) {
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
  const parsed = profileSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {};
  const data = parsed.data;

  if (data.wishlist_public !== undefined) updates.wishlist_public = data.wishlist_public;
  if (data.display_name !== undefined) {
    updates.display_name = data.display_name || null;
  }
  if (data.bio !== undefined) updates.bio = data.bio || null;
  if (data.residence !== undefined) updates.residence = data.residence || null;
  if (data.profession !== undefined) updates.profession = data.profession || null;
  if (data.marital_status !== undefined) updates.marital_status = data.marital_status || null;
  if (data.avatar_url !== undefined) updates.avatar_url = data.avatar_url;

  const { data: profile, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select(PROFILE_SELECT)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(profile);
}
