import { PasswordChangeClient } from "@/components/profile/password-change-client";
import { AppShell } from "@/components/shell/app-shell";
import { SectionCard } from "@/components/ui/section-card";
import { APP_ROUTES } from "@/lib/routes";

export default function PasswordPage() {
  return (
    <AppShell
      activeHref={APP_ROUTES.profilePassword}
      access="auth"
      heading="Зміна пароля"
      description="Керуйте паролем для входу по email: змініть поточний або створіть новий для акаунта, який живе тільки через Google."
    >
      <SectionCard eyebrow="Безпека" title="Пароль акаунта">
        <PasswordChangeClient />
      </SectionCard>
    </AppShell>
  );
}