"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { useToast } from "@/components/shared/toast-provider";
import { FancySelect } from "@/components/ui/fancy-select";
import {
  completeMaintenanceItem,
  getApiErrorMessage,
  getMaintenancePlan,
  getSession,
  listVehicles,
  requestMissingMaintenancePlan,
  updateMaintenanceItemStatus
} from "@/lib/api";
import type { AuthUser, MaintenancePlanItem, MaintenancePlanResponse, Vehicle } from "@/lib/types";

const completionInitial = {
  serviceDate: new Date().toISOString().slice(0, 10),
  mileageKm: "",
  serviceStation: "",
  notesUk: ""
};

function formatInterval(intervalKm: number | null, intervalMonths: number | null): string {
  const parts: string[] = [];

  if (intervalKm) {
    parts.push(`кожні ${intervalKm.toLocaleString("uk-UA")} км`);
  }

  if (intervalMonths) {
    parts.push(`кожні ${intervalMonths} міс`);
  }

  return parts.length > 0 ? parts.join(" або ") : "Інтервал не заданий";
}

function formatDue(item: MaintenancePlanItem): string | null {
  const parts: string[] = [];

  if (item.next_due_date) {
    const detail = item.overdue_by_days !== null ? `прострочено на ${item.overdue_by_days} дн` : "ще не прострочено";
    parts.push(`до ${new Date(item.next_due_date).toLocaleDateString("uk-UA")} · ${detail}`);
  }

  if (item.next_due_mileage_km !== null) {
    const detail = item.overdue_by_km !== null ? `прострочено на ${item.overdue_by_km.toLocaleString("uk-UA")} км` : "ще не прострочено";
    parts.push(`${item.next_due_mileage_km.toLocaleString("uk-UA")} км · ${detail}`);
  }

  return parts.length > 0 ? parts.join(" | ") : null;
}

function statusLabel(status: MaintenancePlanItem["current_status"]): string {
  switch (status) {
    case "done":
      return "Виконано";
    case "skipped":
      return "Пропущено";
    case "overdue":
      return "Прострочено";
    default:
      return "Очікує";
  }
}

function statusClass(status: MaintenancePlanItem["current_status"]): string {
  switch (status) {
    case "done":
      return "border-[rgba(76,207,255,0.24)] bg-[rgba(76,207,255,0.08)] text-white";
    case "skipped":
      return "border-[rgba(255,143,76,0.24)] bg-[rgba(255,143,76,0.08)] text-white";
    case "overdue":
      return "border-[rgba(255,95,87,0.28)] bg-[rgba(255,95,87,0.1)] text-white";
    default:
      return "border-white/10 bg-white/5 text-[var(--muted)]";
  }
}

export function MaintenanceCatalogClient() {
  const searchParams = useSearchParams();
  const requestedVehicleId = searchParams.get("vehicleId") ?? "";
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [plan, setPlan] = useState<MaintenancePlanResponse | null>(null);
  const [session, setSession] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState("Завантажуємо план обслуговування...");
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [completionForm, setCompletionForm] = useState(completionInitial);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  async function loadPlan(vehicleId: string, nextStatus?: string) {
    if (!vehicleId) {
      setPlan(null);
      return;
    }

    try {
      const payload = await getMaintenancePlan(vehicleId);
      setPlan(payload);
      setStatus(nextStatus ?? (payload.plan ? "План обслуговування оновлено." : "Для цього авто ще не підготовлено план обслуговування."));
    } catch (error) {
      const message = getApiErrorMessage(error);
      setStatus(message);
      toast.error(message);
    }
  }

  useEffect(() => {
    void getSession().then(setSession).catch(() => setSession(null));

    void listVehicles()
      .then(async (items) => {
        setVehicles(items);
        const preferredVehicleId = items.some((vehicle) => vehicle.id === requestedVehicleId)
          ? requestedVehicleId
          : items[0]?.id ?? "";
        setSelectedVehicleId(preferredVehicleId);
        await loadPlan(preferredVehicleId);
      })
      .catch((error) => {
        const message = getApiErrorMessage(error);
        setStatus(message);
        toast.error(message);
      });
  }, [requestedVehicleId, toast]);

  function handleMissingPlanRequest() {
    if (!selectedVehicleId) {
      return;
    }

    setStatus("Надсилаємо запит адміністраторам...");

    startTransition(() => {
      void requestMissingMaintenancePlan(selectedVehicleId)
        .then((payload) => {
          setPlan(payload);
          setStatus("Запит на додавання плану обслуговування відправлено адміністраторам.");
          toast.success("Запит відправлено", "Адміністратори побачать, що для цього авто бракує готового регламенту.");
        })
        .catch((error) => {
          const message = getApiErrorMessage(error);
          setStatus(message);
          toast.error(message);
        });
    });
  }

  const groupedItems = (plan?.items ?? []).reduce<Record<string, MaintenancePlanItem[]>>((acc, item) => {
    const key = item.procedure_category;

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(item);
    return acc;
  }, {});

  function handleStatusChange(itemId: string, nextStatus: "pending" | "skipped") {
    if (!selectedVehicleId) {
      return;
    }

    setStatus(nextStatus === "skipped" ? "Позначаємо пункт як пропущений..." : "Повертаємо пункт в очікування...");

    startTransition(() => {
      void updateMaintenanceItemStatus(selectedVehicleId, itemId, nextStatus)
        .then((payload) => {
          setPlan(payload);
          setStatus(nextStatus === "skipped" ? "Пункт регламенту пропущено." : "Пункт повернуто в очікування.");
          toast.success(nextStatus === "skipped" ? "Пункт позначено як пропущений." : "Пункт повернуто в очікування.");
        })
        .catch((error) => {
          const message = getApiErrorMessage(error);
          setStatus(message);
          toast.error(message);
        });
    });
  }

  function handleCompleteItem(event: React.FormEvent<HTMLFormElement>, itemId: string) {
    event.preventDefault();

    if (!selectedVehicleId) {
      return;
    }

    setStatus("Створюємо запис сервісу і оновлюємо регламент...");

    startTransition(() => {
      void completeMaintenanceItem(selectedVehicleId, itemId, {
        serviceDate: completionForm.serviceDate,
        mileageKm: Number(completionForm.mileageKm),
        serviceStation: completionForm.serviceStation || null,
        notesUk: completionForm.notesUk || null
      })
        .then((payload) => {
          setPlan(payload);
          setExpandedItemId(null);
          setCompletionForm(completionInitial);
          setStatus("Пункт регламенту позначено виконаним і додано в журнал сервісу.");
          toast.success("Роботу зафіксовано у сервісі.");
        })
        .catch((error) => {
          const message = getApiErrorMessage(error);
          setStatus(message);
          toast.error(message);
        });
    });
  }

  return (
    <div className="space-y-6">
      <section className="space-y-5">
        {vehicles.length > 0 ? (
          <FancySelect
            label="Автомобіль"
            value={selectedVehicleId}
            onChange={(value) => {
              setSelectedVehicleId(value);
              void loadPlan(value);
            }}
            options={vehicles.map((vehicle) => ({
              value: vehicle.id,
              label: `${vehicle.make} ${vehicle.model} ${vehicle.year}`,
              description: `Пробіг ${vehicle.mileage_km.toLocaleString("uk-UA")} км`
            }))}
            helper="Оберіть авто, для якого хочете переглянути роботи та строки обслуговування."
            required
          />
        ) : null}

        {!selectedVehicleId ? (
          <EmptyState title="Немає автомобіля" description="Спочатку додайте автомобіль у гараж, щоб система змогла підібрати для нього план обслуговування." />
        ) : (
          <>
            {plan?.plan ? (
              <div className="rounded-[22px] border border-[rgba(76,207,255,0.18)] bg-[rgba(76,207,255,0.08)] px-5 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{plan.plan.template_name}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                      Активний з {new Date(plan.plan.assigned_at).toLocaleDateString("uk-UA")} · оновлено {new Date(plan.plan.source_template_updated_at).toLocaleDateString("uk-UA")}
                    </p>
                  </div>
                  <span className="rounded-full border border-[rgba(76,207,255,0.22)] bg-black/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-cyan)]">
                    План підключено
                  </span>
                </div>
                {plan.templateSync.message ? (
                  <div className={`mt-3 rounded-[16px] border px-4 py-3 text-sm leading-6 ${plan.templateSync.isStale ? "border-[rgba(255,143,76,0.25)] bg-[rgba(255,143,76,0.08)] text-[rgba(255,214,194,1)]" : "border-[rgba(76,207,255,0.22)] bg-black/10 text-white"}`}>
                    {plan.templateSync.message}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-[22px] border border-[rgba(255,143,76,0.24)] bg-[rgba(255,143,76,0.08)] px-5 py-4">
                <p className="text-sm font-semibold text-white">Для цього авто готового плану поки немає.</p>
                {plan?.missingPlanRequest ? (
                  <p className="mt-2 text-sm leading-6 text-[rgba(255,225,204,1)]">
                    Запит уже відправлено {new Date(plan.missingPlanRequest.created_at).toLocaleDateString("uk-UA")}. Коли адміністратор додасть регламент, він зʼявиться тут автоматично.
                  </p>
                ) : session?.role === "user" ? (
                  <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <p className="text-sm leading-6 text-[rgba(255,225,204,1)]">Можна одразу повідомити адміністраторів, що для цього авто треба додати регламент.</p>
                    <button
                      type="button"
                      onClick={handleMissingPlanRequest}
                      disabled={isPending}
                      className="rounded-full bg-[linear-gradient(135deg,#4f84ff,#4ccfff)] px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
                    >
                      Повідомити адміністраторів
                    </button>
                  </div>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-[rgba(255,225,204,1)]">
                    Коли адміністратор додасть регламент, він зʼявиться тут автоматично.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </section>

      <section className="space-y-4">
        {!plan?.plan ? (
          <EmptyState title="План ще не підключено" description="Щойно для цього авто буде доступний готовий регламент, система під’єднає його автоматично. Якщо його ще немає, можна відправити запит адміністраторам." />
        ) : plan.items.length === 0 ? (
          <EmptyState title="Роботи ще не додані" description="Для цього варіанта обслуговування ще не підготовлено жодної роботи." />
        ) : (
          Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="rounded-[22px] border border-white/8 bg-white/4 p-4">
              <h3 className="text-lg font-semibold text-white">{category}</h3>
              <div className="mt-3 space-y-3">
                {items.map((item) => {
                  const expanded = expandedItemId === item.id;

                  return (
                    <article key={item.id} className="rounded-[18px] border border-white/8 bg-black/10 px-4 py-3">
                      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-base font-semibold text-white">{item.procedure_title}</h4>
                            <span className={`rounded-full border px-2.5 py-1 text-[11px] ${statusClass(item.current_status)}`}>
                              {statusLabel(item.current_status)}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs leading-5 text-[var(--muted)]">
                            <span className="rounded-full border border-white/8 bg-white/4 px-2.5 py-1">{formatInterval(item.interval_km, item.interval_months)}</span>
                            {item.last_completed_at ? (
                              <span className="rounded-full border border-white/8 bg-white/4 px-2.5 py-1">
                                Останнє виконання: {new Date(item.last_completed_at).toLocaleDateString("uk-UA")}
                                {item.last_completed_mileage_km !== null ? ` · ${item.last_completed_mileage_km.toLocaleString("uk-UA")} км` : ""}
                              </span>
                            ) : (
                              <span className="rounded-full border border-white/8 bg-white/4 px-2.5 py-1">
                                Базова точка: {new Date(item.baseline_date).toLocaleDateString("uk-UA")} · {item.baseline_mileage_km.toLocaleString("uk-UA")} км
                              </span>
                            )}
                          </div>
                          {formatDue(item) ? <p className="mt-2 text-sm leading-5 text-[var(--muted)]">Коли звернути увагу: {formatDue(item)}</p> : null}
                          {item.notes_uk ? <p className="mt-2 text-sm leading-5 text-[var(--muted)]">{item.notes_uk}</p> : null}
                        </div>

                        <div className="flex flex-wrap gap-2 xl:justify-end">
                          <button
                            type="button"
                            onClick={() => setExpandedItemId(expanded ? null : item.id)}
                            className="rounded-full bg-[linear-gradient(135deg,#4f84ff,#4ccfff)] px-3.5 py-2 text-xs font-semibold text-slate-950"
                          >
                            Позначити виконаним
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(item.id, item.status === "skipped" ? "pending" : "skipped")}
                            className="rounded-full border border-white/10 px-3.5 py-2 text-xs font-semibold text-white"
                          >
                            {item.status === "skipped" ? "Повернути в очікування" : "Пропустити"}
                          </button>
                        </div>
                      </div>

                      {expanded ? (
                        <form className="mt-3 grid gap-3 rounded-[18px] border border-white/8 bg-white/4 p-4" onSubmit={(event) => handleCompleteItem(event, item.id)}>
                          {[
                            ["serviceDate", "Дата виконання", "date"],
                            ["mileageKm", "Пробіг на момент виконання", "number"],
                            ["serviceStation", "Назва СТО", "text"],
                            ["notesUk", "Коментар", "text"]
                          ].map(([key, label, type]) => (
                            <label key={key} className="flex flex-col gap-2 text-sm text-[var(--muted)]">
                              {label}
                              <input
                                value={completionForm[key as keyof typeof completionForm]}
                                onChange={(event) => setCompletionForm((current) => ({ ...current, [key]: event.target.value }))}
                                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                                placeholder={label}
                                type={type}
                                required={key === "serviceDate" || key === "mileageKm"}
                              />
                            </label>
                          ))}
                          <div className="flex flex-wrap gap-2">
                            <button disabled={isPending} className="rounded-full bg-[linear-gradient(135deg,#4f84ff,#4ccfff)] px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60">
                              Зберегти виконання
                            </button>
                            <button type="button" onClick={() => setExpandedItemId(null)} className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white">
                              Скасувати
                            </button>
                          </div>
                        </form>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <p className="text-sm leading-6 text-[var(--muted)]">{status}</p>
      </section>
    </div>
  );
}
