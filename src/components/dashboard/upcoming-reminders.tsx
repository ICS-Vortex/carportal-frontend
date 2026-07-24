import { BellRing } from "lucide-react";

import type { Reminder } from "@/lib/types";

const accentByStatus = {
  due: "border-[rgba(255,143,76,0.45)] bg-[rgba(255,143,76,0.08)]",
  upcoming: "border-[rgba(210,255,114,0.35)] bg-[rgba(210,255,114,0.08)]",
  sent: "border-[rgba(76,207,255,0.25)] bg-[rgba(76,207,255,0.08)]",
  done: "border-[rgba(76,207,255,0.25)] bg-[rgba(76,207,255,0.08)]"
};

type UpcomingRemindersProps = {
  reminders: Reminder[];
};

function formatDue(reminder: Reminder): string {
  if (reminder.due_date) {
    return new Date(reminder.due_date).toLocaleDateString("uk-UA");
  }

  if (reminder.due_mileage_km) {
    return `${reminder.due_mileage_km.toLocaleString("uk-UA")} км`;
  }

  return "Термін не заданий";
}

export function UpcomingReminders({ reminders }: UpcomingRemindersProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {reminders.map((reminder) => (
        <article
          key={`${reminder.vehicle_id}-${reminder.procedure_id}`}
          className={`rounded-[24px] border p-5 ${accentByStatus[reminder.status as keyof typeof accentByStatus] ?? accentByStatus.upcoming}`}
        >
          <div className="flex items-center justify-between">
            <BellRing className="h-5 w-5 text-[var(--accent-cyan)]" />
            <span className="rounded-full bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/70">{reminder.status}</span>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-white">{reminder.procedure_title}</h3>
          <p className="mt-2 text-sm font-medium text-[var(--accent-lime)]">{formatDue(reminder)}</p>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{reminder.vehicle_name} · поточний пробіг {reminder.current_mileage_km.toLocaleString("uk-UA")} км</p>
        </article>
      ))}
    </div>
  );
}
