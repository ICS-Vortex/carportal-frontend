import { AppShell } from "@/components/shell/app-shell";
import { ServiceLogsClient } from "@/components/service-logs/service-logs-client";
import { SectionCard } from "@/components/ui/section-card";
import { APP_ROUTES } from "@/lib/routes";

export default function ServiceLogsPage() {
  return (
    <AppShell
      activeHref={APP_ROUTES.serviceLogs}
      access="auth"
      heading="Журнал сервісу"
      description="Фіксуйте один візит на СТО як набір процедур: моторна олива, фільтри, рідини, інспекція та додаткові роботи."
    >
      <SectionCard eyebrow="Сервіс" title="Робота з журналом сервісу">
        <ServiceLogsClient />
        </SectionCard>
    </AppShell>
  );
}
