import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { profileSettingsSchema } from "@/lib/validations/profile";

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

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({ wishlist_public: parsed.data.wishlist_public })
    .eq("id", user.id)
    .select("username, display_name, wishlist_public")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(profile);
}
