import { AdminUserManagementClient } from "@/components/admin/admin-user-management-client";
import { AdminWorkspaceNav } from "@/components/admin/admin-workspace-nav";
import { AppShell } from "@/components/shell/app-shell";
import { SectionCard } from "@/components/ui/section-card";
import { APP_ROUTES } from "@/lib/routes";

export default function AdminUsersPage() {
  return (
    <AppShell
      activeHref={APP_ROUTES.admin}
      access="admin"
      heading="Керування користувачами"
      description="Окремий операційний контур для ролей, блокувань і деактивації акаунтів."
    >
      <AdminWorkspaceNav activeHref={APP_ROUTES.adminUsers} />
      <SectionCard eyebrow="Користувачі" title="Блокування, ролі та деактивація">
        <AdminUserManagementClient />
      </SectionCard>
    </AppShell>
  );
}