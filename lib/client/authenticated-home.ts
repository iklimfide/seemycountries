import type { SupabaseClient } from "@supabase/supabase-js";
import { profilePath } from "@/lib/seo/site";

export async function resolveAuthenticatedHomePath(
  supabase: SupabaseClient
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return "/login";

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.username) return "/settings";

  return profilePath(profile.username);
}
