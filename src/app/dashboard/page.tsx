import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { AppShell } from "@/components/shell/app-shell";
import { APP_ROUTES } from "@/lib/routes";

export default function DashboardPage() {
  return (
    <AppShell
      activeHref={APP_ROUTES.dashboard}
      access="auth"
      heading="Кабінет водія"
      description="Слідкуйте за пробігом, регламентом ТО, сервісними роботами та майбутніми нагадуваннями для свого авто."
    >
      <DashboardOverview />
    </AppShell>
  );
}