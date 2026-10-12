"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { APP_ROUTES } from "@/lib/routes";
import { formatFuelType, formatGarageUpdatedAt, formatLastServiceVisit } from "@/lib/vehicle-display";
import type { GarageVehicleInsight, Vehicle } from "@/lib/types";

type GarageVehicleCardProps = {
  vehicle: Vehicle;
  insight?: GarageVehicleInsight;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
};

function insightSummary(insight: GarageVehicleInsight | undefined): string | null {
  if (!insight) {
    return null;
  }

  if (insight.dueCount > 0) {
    return `${insight.dueCount} прострочен${insight.dueCount === 1 ? "а" : "і"} робот${insight.dueCount === 1 ? "а" : "и"}`;
  }

  if (insight.upcomingCount > 0 && insight.nextProcedureTitle) {
    return `Наступна: ${insight.nextProcedureTitle}`;
  }

  if (insight.upcomingCount > 0) {
    return `${insight.upcomingCount} найближч${insight.upcomingCount === 1 ? "а" : "і"} робот${insight.upcomingCount === 1 ? "а" : "и"}`;
  }

  return null;
}

export function GarageVehicleCard({ vehicle, insight, onEdit, onDelete }: GarageVehicleCardProps) {
  const reminderLine = insightSummary(insight);
  const maintenanceQuery = `?vehicleId=${encodeURIComponent(vehicle.id)}`;

  return (
    <article className="overflow-hidden rounded-[32px] border border-[var(--line)] bg-[var(--panel-strong)]">
      <div className="grid lg:grid-cols-[280px_minmax(0,1fr)]">
        {vehicle.image_url ? (
          <img src={vehicle.image_url} alt={`${vehicle.make} ${vehicle.model}`} className="h-56 w-full object-cover lg:h-full" />
        ) : (
          <div className="flex h-56 items-end bg-[linear-gradient(160deg,#3c3c3c,#111111)] p-6 lg:h-full">
            <span className="display text-5xl text-[var(--accent-strong)]">{vehicle.make.slice(0, 1)}</span>
          </div>
        )}
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">{vehicle.year}</p>
              <h3 className="display mt-2 text-4xl text-[var(--foreground)]">{vehicle.make} {vehicle.model}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {vehicle.generation ?? "Покоління не задано"} · {vehicle.engine_name} / {vehicle.transmission_name}
                {vehicle.drivetrain_label ? ` / ${vehicle.drivetrain_label}` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">Пробіг</p>
              <p className="display mt-1 text-3xl text-[var(--foreground)]">{vehicle.mileage_km.toLocaleString("uk-UA")}</p>
              <p className="text-xs tracking-[0.16em] text-[var(--muted)]">КМ</p>
            </div>
          </div>

          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-[var(--line)] bg-white/3 px-4 py-4">
              <dt className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">VIN</dt>
              <dd className="mt-2 break-all text-sm font-medium text-[var(--foreground)]">{vehicle.vin ?? "Не вказано"}</dd>
            </div>
            <div className="rounded-3xl border border-[var(--line)] bg-white/3 px-4 py-4">
              <dt className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">Номер</dt>
              <dd className="mt-2 text-sm font-medium text-[var(--foreground)]">{vehicle.license_plate ?? "Не вказано"}</dd>
            </div>
            <div className="rounded-3xl border border-[var(--line)] bg-white/3 px-4 py-4">
              <dt className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">Паливо</dt>
              <dd className="mt-2 text-sm font-medium text-[var(--foreground)]">{formatFuelType(vehicle.fuel_type)}</dd>
            </div>
            <div className="rounded-3xl border border-[var(--line)] bg-white/3 px-4 py-4">
              <dt className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">Останній візит</dt>
              <dd className="mt-2 text-sm font-medium text-[var(--foreground)]">
                {formatLastServiceVisit(vehicle.last_service_date, vehicle.last_service_mileage_km)}
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className={vehicle.has_maintenance_plan === true ? "status-done" : "status-wait"}>
              {vehicle.has_maintenance_plan === true ? "Регламент підключено" : "Регламент не підключено"}
            </span>
            {reminderLine ? (
              <span className={insight?.dueCount ? "status-due" : "status-wait"}>{reminderLine}</span>
            ) : vehicle.has_maintenance_plan === true ? (
              <span className="text-[var(--muted)]">Нагадувань поки немає</span>
            ) : null}
          </div>

          <p className="mt-3 text-xs text-[var(--muted)]">
            Дані в гаражі оновлено {formatGarageUpdatedAt(vehicle.updated_at)}
          </p>

          <div className="mt-4 flex flex-wrap gap-3 text-sm font-medium">
            <Link href={`${APP_ROUTES.maintenance}${maintenanceQuery}`} className="inline-flex items-center gap-1 text-[#c51b1b] hover:underline">
              Регламент
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <Link href={`${APP_ROUTES.serviceLogs}${maintenanceQuery}`} className="inline-flex items-center gap-1 text-[#c51b1b] hover:underline">
              Журнал
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <Link href={`${APP_ROUTES.reminders}${maintenanceQuery}`} className="inline-flex items-center gap-1 text-[#c51b1b] hover:underline">
              Нагадування
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={() => onEdit(vehicle)} className="btn-primary">Редагувати</button>
            <button type="button" onClick={() => onDelete(vehicle)} className="btn-danger">Прибрати з гаража</button>
          </div>
        </div>
      </div>
    </article>
  );
}
