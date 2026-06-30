import type { ReactNode } from "react";
import { DashboardAddProvider } from "@/components/dashboard/DashboardAddProvider";
import { DashboardBottomBar } from "@/components/dashboard/DashboardBottomBar";

type OwnProfileShellProps = {
  username: string;
  children: ReactNode;
};

export function OwnProfileShell({ username, children }: OwnProfileShellProps) {
  return (
    <DashboardAddProvider>
      <div className="dashboard-shell">
        {children}
        <DashboardBottomBar username={username} />
      </div>
    </DashboardAddProvider>
  );
}
