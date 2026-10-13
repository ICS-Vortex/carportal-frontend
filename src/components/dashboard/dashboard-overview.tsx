"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ArrowUpRight } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { useToast } from "@/components/shared/toast-provider";
import { getApiErrorMessage, listReminders, listServiceLogs, listVehicles } from "@/lib/api";
import { APP_ROUTES } from "@/lib/routes";
import type { Reminder, ServiceLog, Vehicle } from "@/lib/types";

import { ServiceHistory } from "./service-history";
import { UpcomingReminders } from "./upcoming-reminders";

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Немає";
  }

  return new Date(value).toLocaleDateString("uk-UA");
}

export function DashboardOverview() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [logs, setLogs] = useState<ServiceLog[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const toast = useToast();

  useEffect(() => {
    void Promise.all([listVehicles(), listReminders()])
      .then(async ([vehicleItems, reminderItems]) => {
        const currentVehicle = vehicleItems[0] ?? null;
        setVehicles(vehicleItems);
        setActiveVehicle(currentVehicle);
        setReminders(reminderItems);

        if (currentVehicle) {
          setLogs(await listServiceLogs(currentVehicle.id));
        } else {
          setLogs([]);
        }

      })
      .catch((error) => {
        toast.error(getApiErrorMessage(error));
      });
  }, [toast]);

  async function selectVehicle(vehicle: Vehicle) {
    setActiveVehicle(vehicle);

    try {
      setLogs(await listServiceLogs(vehicle.id));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  const vehicleReminders = reminders.filter((item) => item.vehicle_id === activeVehicle?.id);
  const nextReminder = vehicleReminders[0] ?? reminders[0] ?? null;
  const nextDue = nextReminder?.due_date
    ? formatDate(nextReminder.due_date)
    : nextReminder?.due_mileage_km
      ? `${nextReminder.due_mileage_km.toLocaleString("uk-UA")} км`
      : "Ще не розраховано";

  return (
    <div className="space-y-8">
      {vehicles.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {vehicles.map((vehicle) => {
            const selected = vehicle.id === activeVehicle?.id;

            return (
              <button
                key={vehicle.id}
                type="button"
                onClick={() => void selectVehicle(vehicle)}
                className={selected ? "btn-primary shrink-0" : "btn-ghost shrink-0"}
              >
                {vehicle.make} {vehicle.model}
              </button>
            );
          })}
        </div>
      ) : null}

      {activeVehicle ? (
        <section className="overflow-hidden rounded-[32px] border border-[var(--line)] bg-[var(--panel-strong)]">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative min-h-[320px]">
              {activeVehicle.image_url ? (
                <img
                  src={activeVehicle.image_url}
                  alt={`${activeVehicle.make} ${activeVehicle.model}`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-[linear-gradient(160deg,#3c3c3c,#111111)]" />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,11,10,0.05),rgba(12,11,10,0.78))]" />
              <div className="relative flex h-full flex-col justify-end p-6 sm:p-8">
                <h2 className="display text-5xl leading-none text-white sm:text-6xl">
                  {activeVehicle.make}
                  <span className="block">{activeVehicle.model}</span>
                </h2>
                <p className="mt-4 max-w-md text-sm leading-6 text-white/80">
                  {activeVehicle.year} · {activeVehicle.generation ?? "Покоління не задано"} · {activeVehicle.engine_name} / {activeVehicle.transmission_name}
                  {activeVehicle.drivetrain_label ? ` / ${activeVehicle.drivetrain_label}` : ""}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-8 p-6 sm:p-8">
              <div>
                <p className="eyebrow">Пробіг</p>
                <p className="display mt-3 text-6xl leading-none text-[var(--foreground)] sm:text-7xl">
                  {activeVehicle.mileage_km.toLocaleString("uk-UA")}
                </p>
                <p className="mt-2 text-sm tracking-[0.22em] text-[var(--muted)]">КІЛОМЕТРІВ</p>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-3xl border border-[var(--line)] bg-white/3 px-4 py-4">
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">VIN</dt>
                  <dd className="mt-2 break-all font-medium text-[var(--foreground)]">{activeVehicle.vin ?? "Не вказано"}</dd>
                </div>
                <div className="rounded-3xl border border-[var(--line)] bg-white/3 px-4 py-4">
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">Номер</dt>
                  <dd className="mt-2 font-medium text-[var(--foreground)]">{activeVehicle.license_plate ?? "Не вказано"}</dd>
                </div>
                <div className="rounded-3xl border border-[var(--line)] bg-white/3 px-4 py-4">
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">Наступна увага</dt>
                  <dd className="mt-2 font-medium text-[var(--foreground)]">{nextDue}</dd>
                </div>
                <div className="rounded-3xl border border-[var(--line)] bg-white/3 px-4 py-4">
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">Останній візит</dt>
                  <dd className="mt-2 font-medium text-[var(--foreground)]">{logs[0] ? formatDate(logs[0].service_date) : "Ще не було"}</dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-3">
                <Link href={`${APP_ROUTES.maintenance}?vehicleId=${activeVehicle.id}`} className="btn-primary">
                  Регламент цього авто
                </Link>
                <Link href={APP_ROUTES.serviceLogs} className="btn-ghost">
                  Записати візит
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <EmptyState
          title="Гараж ще порожній"
          description="Додайте перший автомобіль, і огляд почне показувати пробіг, регламент і журнал саме по ньому."
        />
      )}

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Авто в гаражі", value: String(vehicles.length) },
          { label: "Пункти уваги", value: String(vehicleReminders.length || reminders.length) },
          { label: "Найближча робота", value: nextReminder?.procedure_title ?? "Ще не сформовано" }
        ].map((item) => (
          <article key={item.label} className="rounded-[28px] border border-[var(--line)] bg-[var(--panel)] px-5 py-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">{item.label}</p>
            <p className="display mt-3 text-3xl text-[var(--foreground)]">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[32px] border border-[var(--line)] bg-[var(--panel)] p-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Журнал</p>
              <h2 className="display mt-2 text-4xl">Останні візити</h2>
            </div>
            <Link href={APP_ROUTES.serviceLogs} className="btn-ghost btn-sm">
              Увесь журнал
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          {logs.length > 0 ? (
            <ServiceHistory logs={logs.slice(0, 3)} />
          ) : (
            <EmptyState title="Візитів ще немає" description="Перший запис сервісу зʼявиться тут одразу після збереження." />
          )}
        </article>

        <article className="rounded-[32px] border border-[var(--line)] bg-[var(--panel)] p-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Увага</p>
              <h2 className="display mt-2 text-4xl">Найближче</h2>
            </div>
            <Link href={APP_ROUTES.reminders} className="btn-ghost btn-sm">
              Усі нагадування
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          {(vehicleReminders.length > 0 ? vehicleReminders : reminders).length > 0 ? (
            <UpcomingReminders reminders={(vehicleReminders.length > 0 ? vehicleReminders : reminders).slice(0, 3)} />
          ) : (
            <EmptyState title="Нагадувань немає" description="Коли роботи наблизяться по даті або пробігу, вони зʼявляться тут." />
          )}
        </article>
      </section>
    </div>
  );
}
