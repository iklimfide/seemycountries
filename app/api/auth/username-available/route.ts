import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getUsernameUnavailableReason,
  usernameSchema,
} from "@/lib/validations/username";

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("username") ?? "";
  const username = raw.toLowerCase().trim();

  const precheck = getUsernameUnavailableReason(username);
  if (precheck === "invalid" || precheck === "reserved") {
    return NextResponse.json({ available: false, reason: precheck });
  }

  const parsed = usernameSchema.safeParse(username);
  if (!parsed.success) {
    return NextResponse.json({ available: false, reason: "invalid" as const });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", parsed.data)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ available: false, reason: "taken" as const });
  }

  return NextResponse.json({ available: true });
}
