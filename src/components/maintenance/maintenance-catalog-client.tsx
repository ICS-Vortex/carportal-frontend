"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import { useServiceStation } from "@/components/providers/service-station-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { ServiceStationSelect } from "@/components/shared/service-station-select";
import { useToast } from "@/components/shared/toast-provider";
import { FancySelect } from "@/components/ui/fancy-select";
import { MaintenanceTemplateChooser } from "@/components/maintenance/maintenance-template-chooser";
import {
  assignMaintenanceTemplate,
  completeMaintenanceItem,
  getApiErrorMessage,
  getMaintenancePlan,
  listVehicles,
  requestMissingMaintenancePlan,
  updateMaintenanceItemStatus
} from "@/lib/api";
import { formatUah } from "@/lib/format-money";
import { planPricingSummary } from "@/lib/plan-pricing";
import type { MaintenancePlanItem, MaintenancePlanResponse, Vehicle } from "@/lib/types";

const completionInitial = {
  serviceDate: new Date().toISOString().slice(0, 10),
  mileageKm: "",
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
      return "status-done";
    case "skipped":
      return "status-skip";
    case "overdue":
      return "status-due";
    default:
      return "status-wait";
  }
}

export function MaintenanceCatalogClient() {
  const searchParams = useSearchParams();
  const requestedVehicleId = searchParams.get("vehicleId") ?? "";
  const { stationId, stationLabel } = useServiceStation();
  const maintenanceOptions = useMemo(() => (stationId ? { stationId } : undefined), [stationId]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [plan, setPlan] = useState<MaintenancePlanResponse | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [completionForm, setCompletionForm] = useState(completionInitial);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  async function loadPlan(vehicleId: string) {
    if (!vehicleId) {
      setPlan(null);
      return;
    }

    try {
      const payload = await getMaintenancePlan(vehicleId, maintenanceOptions);
      setPlan(payload);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  useEffect(() => {
    let cancelled = false;

    void listVehicles()
      .then(async (items) => {
        if (cancelled) {
          return;
        }

        setVehicles(items);
        const preferredVehicleId = items.some((vehicle) => vehicle.id === requestedVehicleId)
          ? requestedVehicleId
          : items[0]?.id ?? "";
        setSelectedVehicleId(preferredVehicleId);
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error(getApiErrorMessage(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [requestedVehicleId, toast]);

  useEffect(() => {
    if (!selectedVehicleId) {
      setPlan(null);
      return;
    }

    void loadPlan(selectedVehicleId);
  }, [selectedVehicleId, maintenanceOptions]);

  function handleAssignTemplate(templateId: string) {
    if (!selectedVehicleId) {
      return;
    }

    startTransition(() => {
      void assignMaintenanceTemplate(selectedVehicleId, templateId, maintenanceOptions)
        .then((payload) => {
          setPlan(payload);
          setShowTemplatePicker(false);
          toast.success("Регламент підключено", "План обслуговування оновлено для цього авто.");
        })
        .catch((error) => {
          toast.error(getApiErrorMessage(error));
        });
    });
  }

  function handleMissingPlanRequest() {
    if (!selectedVehicleId) {
      return;
    }

    startTransition(() => {
      void requestMissingMaintenancePlan(selectedVehicleId, undefined, maintenanceOptions)
        .then((payload) => {
          setPlan(payload);
          toast.success("Запит відправлено", "Регламент зʼявиться в кабінеті, щойно його підготують для цього авто.");
        })
        .catch((error) => {
          toast.error(getApiErrorMessage(error));
        });
    });
  }

  const pricing = planPricingSummary(plan?.items ?? []);
  const availableTemplates = plan?.availableTemplates ?? [];
  const needsTemplateChoice = Boolean(selectedVehicleId && !plan?.plan && availableTemplates.length > 0);
  const canSwitchTemplate = Boolean(plan?.plan && availableTemplates.length > 1);
  const activeTemplateStationId = plan?.activeTemplate?.station_id ?? null;
  const pricingStationMismatch = Boolean(
    stationId &&
    activeTemplateStationId &&
    activeTemplateStationId !== stationId
  );

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

    startTransition(() => {
      void updateMaintenanceItemStatus(selectedVehicleId, itemId, nextStatus, maintenanceOptions)
        .then((payload) => {
          setPlan(payload);
          toast.success(nextStatus === "skipped" ? "Пункт позначено як пропущений." : "Пункт повернуто в очікування.");
        })
        .catch((error) => {
          toast.error(getApiErrorMessage(error));
        });
    });
  }

  function handleCompleteItem(event: React.FormEvent<HTMLFormElement>, itemId: string) {
    event.preventDefault();

    if (!selectedVehicleId) {
      return;
    }

    startTransition(() => {
      void completeMaintenanceItem(selectedVehicleId, itemId, {
        serviceDate: completionForm.serviceDate,
        mileageKm: Number(completionForm.mileageKm),
        serviceStationId: stationId || null,
        notesUk: completionForm.notesUk || null
      }, maintenanceOptions)
        .then((payload) => {
          setPlan(payload);
          setExpandedItemId(null);
          setCompletionForm(completionInitial);
          toast.success("Роботу зафіксовано у сервісі.");
        })
        .catch((error) => {
          toast.error(getApiErrorMessage(error));
        });
    });
  }

  return (
    <div className="space-y-6">
      <section className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2 md:items-start">
          <ServiceStationSelect />
          <div className="min-w-0">
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
          </div>
        </div>

        {needsTemplateChoice ? (
          <MaintenanceTemplateChooser
            templates={availableTemplates}
            selectedStationId={stationId}
            busy={isPending}
            onAssign={handleAssignTemplate}
          />
        ) : null}

        {!selectedVehicleId ? (
          <EmptyState title="Немає автомобіля" description="Спочатку додайте автомобіль у гараж — тоді зʼявиться регламент обслуговування для цієї комплектації." />
        ) : (
          <>
            {plan?.plan ? (
              <div className="rounded-[28px] border border-[var(--line)] bg-[rgba(197,27,27,0.06)] px-5 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">{plan.plan.template_name}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                      Активний з {new Date(plan.plan.assigned_at).toLocaleDateString("uk-UA")} · оновлено {new Date(plan.plan.source_template_updated_at).toLocaleDateString("uk-UA")}
                    </p>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {activeTemplateStationId
                        ? `Шаблон для СТО «${plan.activeTemplate?.station_name_uk ?? "станція"}».`
                        : "Загальний шаблон регламенту (для всіх СТО)."}
                      {stationLabel ? ` Ціни нижче — для «${stationLabel}».` : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-2 lg:items-end">
                    <span className="status-done">План підключено</span>
                    {canSwitchTemplate ? (
                      <button
                        type="button"
                        className="btn-ghost btn-sm"
                        onClick={() => setShowTemplatePicker((current) => !current)}
                      >
                        {showTemplatePicker ? "Сховати варіанти" : "Змінити регламент"}
                      </button>
                    ) : null}
                  </div>
                </div>
                {pricingStationMismatch ? (
                  <div className="mt-3 rounded-2xl border border-[rgba(224,163,106,0.35)] bg-[rgba(224,163,106,0.08)] px-4 py-3 text-sm leading-6 text-[var(--muted)]">
                    План привʼязано до іншого СТО, ніж обране зараз. Щоб повністю перейти на регламент «{stationLabel}», оберіть відповідний шаблон нижче.
                  </div>
                ) : null}
                {showTemplatePicker && canSwitchTemplate ? (
                  <div className="mt-4">
                    <MaintenanceTemplateChooser
                      templates={availableTemplates}
                      selectedStationId={stationId}
                      busy={isPending}
                      onAssign={handleAssignTemplate}
                    />
                  </div>
                ) : null}
                {plan.templateSync.message ? (
                  <div className={`mt-3 rounded-2xl border px-4 py-3 text-sm leading-6 ${plan.templateSync.isStale ? "border-[rgba(224,163,106,0.35)] bg-[rgba(224,163,106,0.08)] text-[var(--accent-strong)]" : "border-[var(--line)] bg-black/10 text-[var(--foreground)]"}`}>
                    {plan.templateSync.message}
                  </div>
                ) : null}
                {pricing.hasAnyPrice ? (
                  <div className="mt-3 rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-3 text-sm leading-6 text-[var(--muted)]">
                    <p>
                      Орієнтовна вартість усього плану (роботи, без запчастин):{" "}
                      <strong className="text-[var(--foreground)]">{formatUah(pricing.planTotal)}</strong>
                    </p>
                    <p className="mt-1">
                      Ціни вказано для {pricing.pricedCount} з {plan.items.length} пунктів
                      {stationLabel ? ` для «${stationLabel}»` : ""}. На СТО сума може відрізнятися.
                    </p>
                  </div>
                ) : null}
              </div>
            ) : needsTemplateChoice ? null : (
              <div className="rounded-[28px] border border-[rgba(224,163,106,0.35)] bg-[rgba(224,163,106,0.08)] px-5 py-4">
                <p className="text-sm font-semibold text-[var(--foreground)]">Для цього авто готового плану поки немає.</p>
                {plan?.missingPlanRequest ? (
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Запит уже відправлено {new Date(plan.missingPlanRequest.created_at).toLocaleDateString("uk-UA")}. Регламент зʼявиться тут, щойно його підготують.
                  </p>
                ) : (
                  <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <p className="text-sm leading-6 text-[var(--muted)]">Можна запросити регламент саме для цього авто.</p>
                    <button
                      type="button"
                      onClick={handleMissingPlanRequest}
                      disabled={isPending}
                      className="btn-primary"
                    >
                      Запросити регламент
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </section>

      <section className="space-y-4">
        {!plan?.plan ? (
          needsTemplateChoice ? null : (
            <EmptyState title="План ще не підключено" description="Щойно для цього авто буде готовий регламент, він зʼявиться тут. Якщо його ще немає, можна запросити підготовку." />
          )
        ) : plan.items.length === 0 ? (
          <EmptyState title="Роботи ще не додані" description="Для цього варіанта обслуговування ще не підготовлено жодної роботи." />
        ) : (
          Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="rounded-[22px] border border-[var(--line)] bg-white/4 p-4">
              <h3 className="text-lg font-semibold text-[var(--foreground)]">{category}</h3>
              <div className="mt-3 space-y-3">
                {items.map((item) => {
                  const expanded = expandedItemId === item.id;

                  return (
                    <article key={item.id} className="rounded-[18px] border border-[var(--line)] bg-black/10 px-4 py-3">
                      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-base font-semibold text-[var(--foreground)]">{item.procedure_title}</h4>
                            <span className={`rounded-full border px-2.5 py-1 text-[11px] ${statusClass(item.current_status)}`}>
                              {statusLabel(item.current_status)}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs leading-5 text-[var(--muted)]">
                            <span className="rounded-full border border-[var(--line)] bg-white/4 px-2.5 py-1">{formatInterval(item.interval_km, item.interval_months)}</span>
                            {formatUah(item.labor_price_uah) ? (
                              <span className="rounded-full border border-[rgba(197,27,27,0.25)] bg-[rgba(197,27,27,0.08)] px-2.5 py-1 text-[var(--foreground)]">
                                ≈ {formatUah(item.labor_price_uah)}
                              </span>
                            ) : null}
                            {item.last_completed_at ? (
                              <span className="rounded-full border border-[var(--line)] bg-white/4 px-2.5 py-1">
                                Останнє виконання: {new Date(item.last_completed_at).toLocaleDateString("uk-UA")}
                                {item.last_completed_mileage_km !== null ? ` · ${item.last_completed_mileage_km.toLocaleString("uk-UA")} км` : ""}
                              </span>
                            ) : (
                              <span className="rounded-full border border-[var(--line)] bg-white/4 px-2.5 py-1">
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
                            className="btn-primary btn-sm"
                          >
                            Позначити виконаним
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(item.id, item.status === "skipped" ? "pending" : "skipped")}
                            className="btn-ghost btn-sm"
                          >
                            {item.status === "skipped" ? "Повернути в очікування" : "Пропустити"}
                          </button>
                        </div>
                      </div>

                      {expanded ? (
                        <form className="mt-3 grid gap-3 rounded-[18px] border border-[var(--line)] bg-white/4 p-4" onSubmit={(event) => handleCompleteItem(event, item.id)}>
                          {[
                            ["serviceDate", "Дата виконання", "date"],
                            ["mileageKm", "Пробіг на момент виконання", "number"],
                            ["notesUk", "Коментар", "text"]
                          ].map(([key, label, type]) => (
                            <label key={key} className="flex flex-col gap-2 text-sm text-[var(--muted)]">
                              {label}
                              <input
                                value={completionForm[key as keyof typeof completionForm]}
                                onChange={(event) => setCompletionForm((current) => ({ ...current, [key]: event.target.value }))}
                                className="field"
                                placeholder={label}
                                type={type}
                                required={key === "serviceDate" || key === "mileageKm"}
                              />
                            </label>
                          ))}
                          <div className="flex flex-wrap gap-2">
                            <button disabled={isPending} className="btn-primary">
                              Зберегти виконання
                            </button>
                            <button type="button" onClick={() => setExpandedItemId(null)} className="btn-ghost">
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
      </section>
    </div>
  );
}
