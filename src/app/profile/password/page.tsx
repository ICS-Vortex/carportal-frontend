import { PasswordChangeClient } from "@/components/profile/password-change-client";
import { AppShell } from "@/components/shell/app-shell";

export default function PasswordPage() {
  return (
    <AppShell
      heading="Пароль"
      description="Змініть пароль для входу по email або задайте його, якщо акаунт створено через Google."
    >
      <PasswordChangeClient />
    </AppShell>
  );
}
