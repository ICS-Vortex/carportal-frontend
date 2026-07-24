"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { useToast } from "@/components/shared/toast-provider";
import { getApiErrorMessage, listReminders } from "@/lib/api";
import { APP_ROUTES } from "@/lib/routes";
import type { Reminder } from "@/lib/types";

function statusLabel(status: string): string {
  return status === "due" ? "Потрібна дія" : "Наближається";
}

function statusClass(status: string): string {
  return status === "due"
    ? "border-[rgba(255,95,87,0.28)] bg-[rgba(255,95,87,0.1)] text-white"
    : "border-[rgba(76,207,255,0.24)] bg-[rgba(76,207,255,0.08)] text-white";
}

type ReminderGroup = {
  key: string;
  vehicleName: string;
  status: string;
  items: Reminder[];
  earliestDueDate: string | null;
  nearestDueMileageKm: number | null;
};

function summarizeGroupTitle(group: ReminderGroup): string {
  if (group.items.length === 1) {
    return group.items[0].procedure_title;
  }

  return `${group.items.length} робіт потребують уваги`;
}

function buildReminderGroups(items: Reminder[]): ReminderGroup[] {
  const groups = new Map<string, ReminderGroup>();

  for (const item of items) {
    const key = `${item.status}:${item.vehicle_id}`;
    const existing = groups.get(key);

    if (!existing) {
      groups.set(key, {
        key,
        vehicleName: item.vehicle_name,
        status: item.status,
        items: [item],
        earliestDueDate: item.due_date,
        nearestDueMileageKm: item.due_mileage_km
      });
      continue;
    }

    existing.items.push(item);

    if (item.due_date && (!existing.earliestDueDate || item.due_date < existing.earliestDueDate)) {
      existing.earliestDueDate = item.due_date;
    }

    if (item.due_mileage_km !== null && (existing.nearestDueMileageKm === null || item.due_mileage_km < existing.nearestDueMileageKm)) {
      existing.nearestDueMileageKm = item.due_mileage_km;
    }
  }

  return Array.from(groups.values()).sort((left, right) => {
    if (left.status !== right.status) {
      return left.status === "due" ? -1 : 1;
    }

    const leftDate = left.earliestDueDate ?? "9999-12-31";
    const rightDate = right.earliestDueDate ?? "9999-12-31";

    if (leftDate !== rightDate) {
      return leftDate.localeCompare(rightDate);
    }

    const leftMileage = left.nearestDueMileageKm ?? Number.MAX_SAFE_INTEGER;
    const rightMileage = right.nearestDueMileageKm ?? Number.MAX_SAFE_INTEGER;
    return leftMileage - rightMileage;
  });
}

function selectPriorityGroups(groups: ReminderGroup[]): ReminderGroup[] {
  return groups
    .filter((group) => group.status === "due")
    .slice(0, 3);
}

function buildVehicleHref(basePath: string, vehicleId: string) {
  return `${basePath}?vehicleId=${encodeURIComponent(vehicleId)}`;
}

function buildServiceLogHref(vehicleId: string, procedureIds: string[]) {
  const params = new URLSearchParams({ vehicleId });

  if (procedureIds.length > 0) {
    params.set("procedureIds", procedureIds.join(","));
  }

  return `${APP_ROUTES.serviceLogs}?${params.toString()}`;
}

export function RemindersClient() {
  const [items, setItems] = useState<Reminder[]>([]);
  const [status, setStatus] = useState("Завантажуємо нагадування...");
  const toast = useToast();
  const groups = buildReminderGroups(items);
  const priorityGroups = selectPriorityGroups(groups);
  const dueCount = items.filter((item) => item.status === "due").length;
  const upcomingCount = items.filter((item) => item.status !== "due").length;

  useEffect(() => {
    void listReminders()
      .then((reminders) => {
        setItems(reminders);
        setStatus(reminders.length > 0 ? "Нагадування синхронізовано." : "Активних нагадувань поки немає.");
      })
      .catch((error) => {
        const message = getApiErrorMessage(error);
        setStatus(message);
        toast.error(message);
      });
  }, [toast]);

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <EmptyState title="Нагадування відсутні" description="Після створення авто, плану обслуговування та сервісних записів тут зʼявляться майбутні події." />
      ) : (
        <>
          {priorityGroups.length > 0 ? (
            <section className="rounded-[24px] border border-[rgba(255,95,87,0.22)] bg-[rgba(255,95,87,0.06)] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgba(255,190,184,0.9)]">Що зробити в першу чергу</p>
                  <h3 className="mt-3 text-2xl font-semibold text-white">Найкритичніші пункти на зараз</h3>
                </div>
                <span className="rounded-full border border-[rgba(255,95,87,0.28)] bg-[rgba(255,95,87,0.1)] px-3 py-2 text-sm text-white">
                  {priorityGroups.length} у фокусі
                </span>
              </div>
              <div className="mt-5 grid gap-3 lg:grid-cols-3">
                {priorityGroups.map((group) => (
                  <article key={`priority-${group.key}`} className="rounded-[20px] border border-white/10 bg-black/15 p-4">
                    <h4 className="text-lg font-semibold text-white">{group.vehicleName}</h4>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{summarizeGroupTitle(group)}</p>
                    <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                      {group.earliestDueDate ? `Найближча дата: ${new Date(group.earliestDueDate).toLocaleDateString("uk-UA")}. ` : "Дату ще не розраховано. "}
                      {group.nearestDueMileageKm !== null ? `Орієнтир по пробігу: ${group.nearestDueMileageKm.toLocaleString("uk-UA")} км.` : "Пробіг не використовується."}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {group.items.slice(0, 3).map((item) => (
                        <span key={`priority-item-${group.key}-${item.procedure_id}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[var(--muted)]">
                          {item.procedure_title}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link href={buildVehicleHref(APP_ROUTES.maintenance, group.items[0].vehicle_id)} className="rounded-full bg-[linear-gradient(135deg,#4f84ff,#4ccfff)] px-3.5 py-2 text-xs font-semibold text-slate-950 transition hover:brightness-105">
                        Перейти до регламенту
                      </Link>
                      <Link href={buildServiceLogHref(group.items[0].vehicle_id, group.items.map((item) => item.procedure_id))} className="rounded-full border border-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:border-white/20 hover:bg-white/5">
                        Записати сервіс
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="grid gap-3 md:grid-cols-2">
            <article className="rounded-[24px] border border-[rgba(255,95,87,0.22)] bg-[rgba(255,95,87,0.08)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgba(255,190,184,0.9)]">Потрібна дія</p>
              <p className="mt-3 text-3xl font-semibold text-white">{dueCount}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Кількість пунктів, які вже вийшли на строк по даті або по пробігу.</p>
            </article>
            <article className="rounded-[24px] border border-[rgba(76,207,255,0.18)] bg-[rgba(76,207,255,0.06)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-cyan)]">Наближається</p>
              <p className="mt-3 text-3xl font-semibold text-white">{upcomingCount}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Роботи, до яких варто підготуватися заздалегідь, поки вони ще не прострочені.</p>
            </article>
          </section>

          {groups.map((group) => (
            <article key={group.key} className="rounded-[24px] border border-white/10 bg-white/4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-white">{summarizeGroupTitle(group)}</h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">{group.vehicleName}</p>
                </div>
                <span className={`rounded-full border px-3 py-2 text-sm ${statusClass(group.status)}`}>{statusLabel(group.status)}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                {group.earliestDueDate ? `Найближча дата: ${new Date(group.earliestDueDate).toLocaleDateString("uk-UA")}. ` : "Дата ще не розрахована. "}
                {group.nearestDueMileageKm !== null ? `Найближчий орієнтир по пробігу: ${group.nearestDueMileageKm.toLocaleString("uk-UA")} км.` : "Пробіг не використовується."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.items.slice(0, 4).map((item) => (
                  <span key={`${group.key}-${item.procedure_id}`} className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-[var(--muted)]">
                    {item.procedure_title}
                  </span>
                ))}
                {group.items.length > 4 ? (
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-[var(--muted)]">
                    Ще {group.items.length - 4}
                  </span>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={buildVehicleHref(APP_ROUTES.maintenance, group.items[0].vehicle_id)} className="rounded-full bg-[linear-gradient(135deg,#4f84ff,#4ccfff)] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-105">
                  Відкрити регламент для цього авто
                </Link>
                <Link href={buildServiceLogHref(group.items[0].vehicle_id, group.items.map((item) => item.procedure_id))} className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/5">
                  Записати сервіс по цих роботах
                </Link>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Поточний пробіг: {group.items[0].current_mileage_km.toLocaleString("uk-UA")} км.
              </p>
            </article>
          ))}
        </>
      )}
      <p className="text-sm leading-6 text-[var(--muted)]">{status}</p>
    </div>
  );
}
