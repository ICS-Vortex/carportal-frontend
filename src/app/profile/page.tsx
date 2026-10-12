import { ProfileDetailsClient } from "@/components/profile/profile-details-client";
import { AppShell } from "@/components/shell/app-shell";

export default function ProfilePage() {
  return (
    <AppShell
      heading="Профіль"
      description="Контакти та налаштування входу."
    >
      <ProfileDetailsClient />
    </AppShell>
  );
}
