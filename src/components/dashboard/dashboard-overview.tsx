"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ArrowUpRight, Gauge, MailCheck, ShieldCheck, Sparkles, Wrench } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { useToast } from "@/components/shared/toast-provider";
import { getApiErrorMessage, listReminders, listServiceLogs, listVehicles } from "@/lib/api";
import { APP_ROUTES } from "@/lib/routes";
import type { Reminder, ServiceLog, Vehicle } from "@/lib/types";

import { SectionCard } from "@/components/ui/section-card";
import { ServiceHistory } from "./service-history";
import { UpcomingReminders } from "./upcoming-reminders";

export function DashboardOverview() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [logs, setLogs] = useState<ServiceLog[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [status, setStatus] = useState("Оновлюємо кабінет...");
  const toast = useToast();

  useEffect(() => {
    void Promise.all([listVehicles(), listReminders()])
      .then(async ([vehicleItems, reminderItems]) => {
        const currentVehicle = vehicleItems[0] ?? null;
        setVehicles(vehicleItems);
        setActiveVehicle(currentVehicle);
        setReminders(reminderItems);

        if (currentVehicle) {
          const serviceLogItems = await listServiceLogs(currentVehicle.id);
          setLogs(serviceLogItems);
        } else {
          setLogs([]);
        }

        setStatus("Кабінет оновлено.");
      })
      .catch((error) => {
        const message = getApiErrorMessage(error);
        setStatus(message);
        toast.error(message);
      });
  }, [toast]);

  const dashboardStats = [
    { label: "Автомобілі в гаражі", value: String(vehicles.length) },
    { label: "Активні нагадування", value: String(reminders.length) },
    { label: "Останній сервіс", value: logs[0] ? new Date(logs[0].service_date).toLocaleDateString("uk-UA") : "Немає" },
    { label: "Найближче ТО", value: reminders[0]?.due_date ? new Date(reminders[0].due_date).toLocaleDateString("uk-UA") : reminders[0]?.due_mileage_km ? `${reminders[0].due_mileage_km.toLocaleString("uk-UA")} км` : "Не розраховано" }
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        <SectionCard className="overflow-hidden" eyebrow="Керування авто" title="Особистий кабінет водія">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs uppercase tracking-[0.24em] text-[var(--accent-cyan)]">
                <Sparkles className="h-4 w-4" />
                Все під контролем
              </div>
              <h2 className="mt-5 max-w-xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Контролюйте регламент ТО, сервісні записи та нагадування в одному кабінеті.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
                Портал тримає під рукою ваші реальні автомобілі, пробіг, VIN, історію сервісу та найближчі роботи в одному місці.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={APP_ROUTES.serviceLogs} className="rounded-full bg-[linear-gradient(135deg,#4f84ff,#4ccfff)] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">
                  Додати запис ТО
                </Link>
                <Link href={APP_ROUTES.garage} className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-[var(--accent-cyan)]">
                  Відкрити гараж
                </Link>
              </div>
              <div className="mt-6">
                <div className="rounded-[24px] border border-white/10 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent-cyan)]">Живий стан</p>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{status}</p>
                </div>
              </div>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-[var(--panel-strong)] p-5">
              {activeVehicle ? (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-[var(--muted)]">Активний автомобіль</p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">
                        {activeVehicle.make} {activeVehicle.model} {activeVehicle.year}
                      </h3>
                    </div>
                    <Gauge className="h-6 w-6 text-[var(--accent-cyan)]" />
                  </div>
                  <dl className="mt-5 space-y-3 text-sm text-[var(--muted)]">
                    <div className="flex items-center justify-between gap-4"><dt>Покоління</dt><dd className="font-semibold text-white">{activeVehicle.generation ?? "Не вказано"}</dd></div>
                    <div className="flex items-center justify-between gap-4"><dt>VIN</dt><dd className="font-semibold text-white">{activeVehicle.vin}</dd></div>
                    <div className="flex items-center justify-between gap-4"><dt>Пробіг</dt><dd className="font-semibold text-white">{activeVehicle.mileage_km.toLocaleString("uk-UA")} км</dd></div>
                    <div className="flex items-center justify-between gap-4"><dt>Нагадувань</dt><dd className="font-semibold text-white">{reminders.filter((item) => item.vehicle_id === activeVehicle.id).length}</dd></div>
                  </dl>
                  <div className="mt-5 rounded-[22px] border border-[rgba(255,143,76,0.18)] bg-[rgba(255,143,76,0.09)] p-4 text-sm text-[var(--muted)]">
                    Найближча подія: <span className="font-semibold text-white">{reminders[0]?.procedure_title ?? "Ще не сформовано"}</span>
                  </div>
                </>
              ) : (
                <EmptyState title="Немає автомобіля" description="Додайте перший автомобіль у гаражі, і дашборд почне показувати реальні дані саме по ньому." />
              )}
            </div>
          </div>
        </SectionCard>

        <div className="grid gap-6">
          {dashboardStats.map((stat) => (
            <SectionCard key={stat.label} className="min-h-[132px]" title={stat.value}>
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">{stat.label}</p>
            </SectionCard>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard eyebrow="Останні роботи" title="Журнал сервісу">
          {logs.length > 0 ? <ServiceHistory logs={logs.slice(0, 3)} /> : <EmptyState title="Сервісних записів поки немає" description="Створіть перший запис ТО, щоб тут з'явилась ваша реальна історія обслуговування." />}
        </SectionCard>
        <SectionCard eyebrow="Поточний стан" title="Зони контролю">
          <div className="space-y-4">
            {[
              { icon: Wrench, title: "Регламент ТО", detail: "Для вашого авто вже підготовлено актуальний план обслуговування." },
              { icon: MailCheck, title: "Нагадування", detail: "Підготовлено канали для показу в кабінеті та відправки на email." },
              { icon: ShieldCheck, title: "Безпека", detail: "Ваш вхід і персональні дані захищені на рівні застосунку." }
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="rounded-[22px] border border-white/8 bg-white/4 p-4">
                  <div className="flex items-center gap-3 text-white">
                    <div className="rounded-2xl bg-[rgba(79,132,255,0.18)] p-3">
                      <Icon className="h-5 w-5 text-[var(--accent-cyan)]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{item.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
                            <Link href={APP_ROUTES.maintenance} className="inline-flex items-center gap-2 text-sm font-semibold text-white">
              Відкрити регламент ТО
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </SectionCard>
      </section>

      <SectionCard eyebrow="Найближчі події" title="Нагадування по автомобілю">
        {reminders.length > 0 ? <UpcomingReminders reminders={reminders.slice(0, 3)} /> : <EmptyState title="Активних нагадувань немає" description="Коли зʼявляться нові нагадування, вони автоматично відобразяться тут." />}
      </SectionCard>
    </div>
  );
}
