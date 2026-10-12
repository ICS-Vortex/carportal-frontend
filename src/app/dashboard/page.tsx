import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { AppShell } from "@/components/shell/app-shell";

export default function DashboardPage() {
  return (
    <AppShell
      heading="Огляд"
      description="Пробіг, найближчі роботи і останні візити по ваших авто."
    >
      <DashboardOverview />
    </AppShell>
  );
}
