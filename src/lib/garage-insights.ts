import type { GarageVehicleInsight, Reminder } from "@/lib/types";

export function buildGarageInsights(reminders: Reminder[]): Map<string, GarageVehicleInsight> {
  const byVehicle = new Map<string, GarageVehicleInsight>();

  for (const reminder of reminders) {
    const current = byVehicle.get(reminder.vehicle_id) ?? {
      dueCount: 0,
      upcomingCount: 0,
      nextProcedureTitle: null
    };

    if (reminder.status === "due") {
      current.dueCount += 1;
    } else if (reminder.status === "upcoming") {
      current.upcomingCount += 1;
    }

    if (!current.nextProcedureTitle) {
      current.nextProcedureTitle = reminder.procedure_title;
    }

    byVehicle.set(reminder.vehicle_id, current);
  }

  return byVehicle;
}
