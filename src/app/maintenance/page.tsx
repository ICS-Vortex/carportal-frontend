import { MaintenanceCatalogClient } from "@/components/maintenance/maintenance-catalog-client";
import { ServiceStationScope } from "@/components/shared/service-station-scope";
import { AppShell } from "@/components/shell/app-shell";

export default function MaintenancePage() {
  return (
    <AppShell
      heading="Регламент"
      description="Роботи по обраному авто: що вже зроблено, що наближається і що час відмітити."
    >
      <ServiceStationScope>
        <MaintenanceCatalogClient />
      </ServiceStationScope>
    </AppShell>
  );
}
