import type { Reminder } from "@/lib/types";

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

function statusLabel(status: string) {
  return status === "due" ? "Потрібна дія" : "Наближається";
}

export function UpcomingReminders({ reminders }: UpcomingRemindersProps) {
  return (
    <div className="space-y-3">
      {reminders.map((reminder) => (
        <article
          key={`${reminder.vehicle_id}-${reminder.procedure_id}`}
          className="rounded-[24px] border border-[var(--line)] bg-white/3 px-4 py-4"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">{reminder.procedure_title}</h3>
            <span className={reminder.status === "due" ? "status-due" : "status-soon"}>{statusLabel(reminder.status)}</span>
          </div>
          <p className="mt-2 text-sm text-[var(--accent-strong)]">{formatDue(reminder)}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {reminder.vehicle_name} · {reminder.current_mileage_km.toLocaleString("uk-UA")} км
          </p>
        </article>
      ))}
    </div>
  );
}
