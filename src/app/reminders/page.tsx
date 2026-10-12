import { RemindersClient } from "@/components/reminders/reminders-client";
import { AppShell } from "@/components/shell/app-shell";

export default function RemindersPage() {
  return (
    <AppShell
      heading="Нагадування"
      description="Що вже потребує уваги і до яких робіт варто підготуватися заздалегідь."
    >
      <RemindersClient />
    </AppShell>
  );
}
