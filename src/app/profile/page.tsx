import { ProfileDetailsClient } from "@/components/profile/profile-details-client";
import { AppShell } from "@/components/shell/app-shell";
import { SectionCard } from "@/components/ui/section-card";
import { APP_ROUTES } from "@/lib/routes";

export default function ProfilePage() {
  return (
    <AppShell
      activeHref={APP_ROUTES.profile}
      access="auth"
      heading="Профіль"
      description="Оновіть основні дані акаунта, щоб email і контактне імʼя залишались актуальними в кабінеті."
    >
      <SectionCard eyebrow="Акаунт" title="Дані профілю">
        <ProfileDetailsClient />
      </SectionCard>
    </AppShell>
  );
}