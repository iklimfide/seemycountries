import type { ReactNode } from "react";
import { OwnProfileShell } from "@/components/dashboard/OwnProfileShell";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  if (!supabase) {
    return <>{children}</>;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <>{children}</>;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (!profile?.username) {
    return <>{children}</>;
  }

  return <OwnProfileShell username={profile.username}>{children}</OwnProfileShell>;
}
