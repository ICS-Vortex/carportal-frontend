import { ProfileDetailsClient } from "@/components/profile/profile-details-client";
import { AppShell } from "@/components/shell/app-shell";

export default function ProfilePage() {
  return (
    <AppShell
      heading="Профіль"
      description="Імʼя, email і спосіб входу. Це дані лише вашого кабінету."
    >
      <ProfileDetailsClient />
    </AppShell>
  );
}
