import { AppShell } from "@/components/shell/app-shell";
import { MaintenanceCatalogClient } from "@/components/maintenance/maintenance-catalog-client";
import { SectionCard } from "@/components/ui/section-card";
import { APP_ROUTES } from "@/lib/routes";

export default function MaintenancePage() {
  return (
    <AppShell
      activeHref={APP_ROUTES.maintenance}
      access="auth"
      heading="Регламент ТО"
      description="Тут зібрано всі роботи для вашого авто: що вже виконано, що наближається і що потрібно відмітити після сервісу."
    >
      <SectionCard eyebrow="Обслуговування авто" title="Усі роботи по автомобілю">
        <MaintenanceCatalogClient />
      </SectionCard>
    </AppShell>
  );
}
