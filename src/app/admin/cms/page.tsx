import { AdminCmsClient } from "@/components/admin/admin-cms-client";
import { AdminWorkspaceNav } from "@/components/admin/admin-workspace-nav";
import { AppShell } from "@/components/shell/app-shell";
import { SectionCard } from "@/components/ui/section-card";
import { APP_ROUTES } from "@/lib/routes";

export default function AdminCmsPage() {
  return (
    <AppShell
      activeHref={APP_ROUTES.admin}
      access="admin"
      heading="Довідник обслуговування"
      description="Працюйте з процедурами, шаблонами й привʼязками на окремій сторінці, без перевантаження іншими адмінськими задачами."
    >
      <AdminWorkspaceNav activeHref={APP_ROUTES.adminCatalog} />
      <SectionCard eyebrow="Довідник" title="Процедури і плани обслуговування">
        <AdminCmsClient />
      </SectionCard>
    </AppShell>
  );
}