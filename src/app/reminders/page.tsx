import { AppShell } from "@/components/shell/app-shell";
import { RemindersClient } from "@/components/reminders/reminders-client";
import { SectionCard } from "@/components/ui/section-card";
import { APP_ROUTES } from "@/lib/routes";

export default function RemindersPage() {
  return (
    <AppShell
      activeHref={APP_ROUTES.reminders}
      access="auth"
      heading="Нагадування"
      description="Тут видно, що потрібно зробити найближчим часом і які роботи вже не варто відкладати."
    >
      <SectionCard eyebrow="Увага до авто" title="Що наближається або вже прострочено">
        <RemindersClient />
      </SectionCard>
    </AppShell>
  );
}
