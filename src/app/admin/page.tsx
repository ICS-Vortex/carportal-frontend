import { AdminConsoleClient } from "@/components/admin/admin-console-client";
import { AppShell } from "@/components/shell/app-shell";
import { APP_ROUTES } from "@/lib/routes";

export default function AdminPage() {
  return (
    <AppShell
      activeHref={APP_ROUTES.admin}
      access="admin"
      heading="Центр керування"
      description="Керуйте довідником обслуговування, станом користувачів і ключовими даними сервісу без зайвого технічного шуму."
    >
      <AdminConsoleClient />
    </AppShell>
  );
}
