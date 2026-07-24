import { AppShell } from "@/components/shell/app-shell";
import { GarageClient } from "@/components/garage/garage-client";
import { SectionCard } from "@/components/ui/section-card";
import { APP_ROUTES } from "@/lib/routes";

export default function GaragePage() {
  return (
    <AppShell
      activeHref={APP_ROUTES.garage}
      access="auth"
      heading="Гараж"
      description="Додавайте автомобілі, фіксуйте VIN, пробіг, покоління та готуйте під них персональні нагадування."
    >
      <SectionCard eyebrow="Ваші авто" title="Гараж користувача">
        <GarageClient />
      </SectionCard>
    </AppShell>
  );
}
