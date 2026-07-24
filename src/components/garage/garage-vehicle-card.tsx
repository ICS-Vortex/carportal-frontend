"use client";

import type { Vehicle } from "@/lib/types";

type GarageVehicleCardProps = {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
};

export function GarageVehicleCard({ vehicle, onEdit, onDelete }: GarageVehicleCardProps) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] shadow-[0_18px_70px_rgba(0,0,0,0.16)]">
      <div className="h-[2px] bg-[linear-gradient(90deg,rgba(76,207,255,0.7),rgba(79,132,255,0.7),transparent)]" />
      <div className="p-5 sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {vehicle.image_url ? (
            <img src={vehicle.image_url} alt={`${vehicle.make} ${vehicle.model}`} className="h-32 w-full max-w-[196px] rounded-[22px] border border-white/10 object-cover shadow-[0_18px_45px_rgba(0,0,0,0.24)]" />
          ) : (
            <div className="flex h-32 w-full max-w-[196px] items-center justify-center rounded-[22px] border border-dashed border-white/10 bg-black/15 text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
              Без фото
            </div>
          )}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[rgba(76,207,255,0.26)] bg-[rgba(76,207,255,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-cyan)]">Ваш автомобіль</span>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/85">{vehicle.year}</span>
            </div>
            <h3 className="mt-3 text-3xl font-semibold leading-tight text-white">{vehicle.make} {vehicle.model}</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">{vehicle.generation ?? "Покоління не задано"}</p>
            <p className="mt-1 text-sm text-white/85">{vehicle.engine_name} / {vehicle.transmission_name}{vehicle.drivetrain_label ? ` / ${vehicle.drivetrain_label}` : ""}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.22em] text-[var(--muted)]">VIN</p>
            <p className="mt-1 break-all text-sm font-medium text-white">{vehicle.vin ?? "Не вказано"}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <div className="rounded-[20px] border border-white/10 bg-black/10 px-4 py-3 text-right">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">Пробіг</p>
            <p className="mt-1 text-lg font-semibold text-white">{vehicle.mileage_km.toLocaleString("uk-UA")} км</p>
          </div>
          <button type="button" onClick={() => onEdit(vehicle)} className="rounded-full bg-[linear-gradient(135deg,#4f84ff,#4ccfff)] px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:brightness-110">
            Редагувати
          </button>
          <button type="button" onClick={() => onDelete(vehicle)} className="rounded-full border border-[rgba(255,95,87,0.3)] px-4 py-2.5 text-sm font-semibold text-[rgba(255,180,173,1)] transition hover:border-[rgba(255,95,87,0.5)] hover:bg-[rgba(255,95,87,0.08)]">
            Прибрати з гаражу
          </button>
        </div>
      </div>

      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-[20px] border border-white/8 bg-black/10 px-4 py-4">
          <dt className="text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">Державний номер</dt>
          <dd className="mt-2 text-base font-semibold text-white">{vehicle.license_plate ?? "Не вказано"}</dd>
        </div>
        <div className="rounded-[20px] border border-white/8 bg-black/10 px-4 py-4">
          <dt className="text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">Фото</dt>
          <dd className="mt-2 text-base font-semibold text-white">{vehicle.image_url ? "Додано" : "Не додано"}</dd>
        </div>
        <div className="rounded-[20px] border border-white/8 bg-black/10 px-4 py-4">
          <dt className="text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">Стан</dt>
          <dd className="mt-2 text-base font-semibold text-white">Готовий до сервісного обліку</dd>
        </div>
      </dl>
      </div>
    </article>
  );
}