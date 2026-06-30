import type { ReactNode } from "react";
import { DashboardAddProvider } from "@/components/dashboard/DashboardAddProvider";
import { DashboardBottomBar } from "@/components/dashboard/DashboardBottomBar";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
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

  return (
    <DashboardAddProvider>
      <div className="dashboard-shell">
        {children}
        <DashboardBottomBar username={profile.username} />
      </div>
    </DashboardAddProvider>
  );
}
