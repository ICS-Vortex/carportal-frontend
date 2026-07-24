import { DeleteAccountClient } from "@/components/profile/delete-account-client";
import { AppShell } from "@/components/shell/app-shell";
import { SectionCard } from "@/components/ui/section-card";
import { APP_ROUTES } from "@/lib/routes";

export default function DeleteProfilePage() {
  return (
    <AppShell
      activeHref={APP_ROUTES.profile}
      access="auth"
      heading="Видалення акаунта"
      description="Остаточна дія для повного видалення облікового запису разом із привʼязаними користувацькими даними."
    >
      <SectionCard eyebrow="Небезпечна дія" title="Видалення акаунта">
        <DeleteAccountClient />
      </SectionCard>
    </AppShell>
  );
}