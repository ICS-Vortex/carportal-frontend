import { AdminOverviewClient } from "@/components/admin/admin-overview-client";
import { AdminWorkspaceNav } from "@/components/admin/admin-workspace-nav";
import { AppShell } from "@/components/shell/app-shell";
import { SectionCard } from "@/components/ui/section-card";
import { APP_ROUTES } from "@/lib/routes";

export default function AdminOverviewPage() {
  return (
    <AppShell
      activeHref={APP_ROUTES.admin}
      access="admin"
      heading="Огляд платформи"
      description="Короткий операційний зріз по сервісу, користувачах і довіднику обслуговування без зайвого шуму від форм редагування."
    >
      <AdminWorkspaceNav activeHref={APP_ROUTES.adminOverview} />
      <SectionCard eyebrow="Огляд" title="Стан платформи">
        <AdminOverviewClient />
      </SectionCard>
    </AppShell>
  );
}