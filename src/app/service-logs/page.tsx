import { ServiceLogsClient } from "@/components/service-logs/service-logs-client";
import { AppShell } from "@/components/shell/app-shell";

export default function ServiceLogsPage() {
  return (
    <AppShell
      heading="Журнал"
      description="Кожен візит — дата, пробіг, станція і список виконаних робіт."
    >
      <ServiceLogsClient />
    </AppShell>
  );
}
