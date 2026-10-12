import { ServiceLogsClient } from "@/components/service-logs/service-logs-client";
import { ServiceStationScope } from "@/components/shared/service-station-scope";
import { AppShell } from "@/components/shell/app-shell";

export default function ServiceLogsPage() {
  return (
    <AppShell
      heading="Журнал"
      description="Кожен візит — дата, пробіг, станція і список виконаних робіт."
    >
      <ServiceStationScope>
        <ServiceLogsClient />
      </ServiceStationScope>
    </AppShell>
  );
}
