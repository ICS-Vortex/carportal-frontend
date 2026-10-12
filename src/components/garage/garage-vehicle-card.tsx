"use client";

import type { Vehicle } from "@/lib/types";

type GarageVehicleCardProps = {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
};

export function GarageVehicleCard({ vehicle, onEdit, onDelete }: GarageVehicleCardProps) {
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

          <dl className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-[var(--line)] bg-white/3 px-4 py-4">
              <dt className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">VIN</dt>
              <dd className="mt-2 break-all text-sm font-medium text-[var(--foreground)]">{vehicle.vin ?? "Не вказано"}</dd>
            </div>
            <div className="rounded-3xl border border-[var(--line)] bg-white/3 px-4 py-4">
              <dt className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">Номер</dt>
              <dd className="mt-2 text-sm font-medium text-[var(--foreground)]">{vehicle.license_plate ?? "Не вказано"}</dd>
            </div>
            <div className="rounded-3xl border border-[var(--line)] bg-white/3 px-4 py-4">
              <dt className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">Фото</dt>
              <dd className="mt-2 text-sm font-medium text-[var(--foreground)]">{vehicle.image_url ? "Додано" : "Не додано"}</dd>
            </div>
          </dl>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={() => onEdit(vehicle)} className="btn-primary">Редагувати</button>
            <button type="button" onClick={() => onDelete(vehicle)} className="btn-danger">Прибрати з гаража</button>
          </div>
        </div>
      </div>
    </article>
  );
}
