"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { AppModal } from "@/components/shared/app-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { useToast } from "@/components/shared/toast-provider";
import { FancyMultiSelect } from "@/components/ui/fancy-multi-select";
import { FancySelect } from "@/components/ui/fancy-select";
import { createServiceLog, deleteServiceLog, getApiErrorMessage, getMaintenancePlan, listServiceLogs, listVehicles } from "@/lib/api";
import { formatUah, sumUah } from "@/lib/format-money";
import type { MaintenancePlanItem, ServiceLog, Vehicle } from "@/lib/types";

const initialForm = {
  serviceDate: new Date().toISOString().slice(0, 10),
  mileageKm: "",
  serviceStation: "",
  notesUk: ""
};

export function ServiceLogsClient() {
  const searchParams = useSearchParams();
  const requestedVehicleId = searchParams.get("vehicleId") ?? "";
  const requestedProcedureIds = searchParams
    .get("procedureIds")
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean) ?? [];
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [procedures, setProcedures] = useState<Array<{ id: string; title_uk: string; labor_price_uah: number | null }>>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  const [logs, setLogs] = useState<ServiceLog[]>([]);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("Завантажуємо журнал сервісу...");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<ServiceLog | null>(null);
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);
  const [isCreatePending, startCreateTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
  const toast = useToast();

  function applyPlanItems(items: MaintenancePlanItem[]) {
    const unique = new Map<string, { id: string; title_uk: string; labor_price_uah: number | null }>();

    for (const item of items) {
      if (!item.procedure_id || unique.has(item.procedure_id)) {
        continue;
      }

      unique.set(item.procedure_id, {
        id: item.procedure_id,
        title_uk: item.procedure_title,
        labor_price_uah: item.labor_price_uah
      });
    }

    const nextProcedures = Array.from(unique.values());
    setProcedures(nextProcedures);
    setSelectedProcedures(requestedProcedureIds.filter((procedureId) => nextProcedures.some((item) => item.id === procedureId)));
  }

  useEffect(() => {
    if (requestedProcedureIds.length > 0 && requestedVehicleId && procedures.length > 0) {
      setIsCreateModalOpen(true);
    }
  }, [procedures.length, requestedProcedureIds.length, requestedVehicleId]);

  async function refreshBase() {
    try {
      const vehicleItems = await listVehicles();
      setVehicles(vehicleItems);
      const nextVehicleId = vehicleItems.some((vehicle) => vehicle.id === requestedVehicleId)
        ? requestedVehicleId
        : selectedVehicleId || vehicleItems[0]?.id || "";
      setSelectedVehicleId(nextVehicleId);

      if (nextVehicleId) {
        const [logItems, plan] = await Promise.all([listServiceLogs(nextVehicleId), getMaintenancePlan(nextVehicleId)]);
        setLogs(logItems);
        applyPlanItems(plan.items);
      } else {
        setLogs([]);
        setProcedures([]);
      }

      setStatus(vehicleItems.length > 0 ? "Журнал сервісу синхронізовано." : "Спершу додайте автомобіль у гараж.");
    } catch (error) {
      const message = getApiErrorMessage(error);
      setStatus(message);
      toast.error(message);
    }
  }

  async function refreshLogs(vehicleId: string) {
    if (!vehicleId) {
      setLogs([]);
      setProcedures([]);
      setSelectedProcedures([]);
      return;
    }

    try {
      const [logItems, plan] = await Promise.all([listServiceLogs(vehicleId), getMaintenancePlan(vehicleId)]);
      setLogs(logItems);
      applyPlanItems(plan.items);
    } catch (error) {
      const message = getApiErrorMessage(error);
      setStatus(message);
      toast.error(message);
    }
  }

  useEffect(() => {
    void refreshBase();
  }, [requestedProcedureIds.join(","), requestedVehicleId]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedVehicleId) {
      const message = "Оберіть автомобіль для запису сервісу.";
      setStatus(message);
      toast.error(message);
      return;
    }

    if (selectedProcedures.length === 0) {
      const message = "Оберіть хоча б одну процедуру.";
      setStatus(message);
      toast.error(message);
      return;
    }

    setStatus("Зберігаємо сервісний запис...");

    startCreateTransition(() => {
      void createServiceLog(selectedVehicleId, {
        serviceDate: form.serviceDate,
        mileageKm: Number(form.mileageKm),
        serviceStation: form.serviceStation || null,
        notesUk: form.notesUk || null,
        items: selectedProcedures.map((procedureId) => ({ procedureId }))
      })
        .then(async () => {
          setForm(initialForm);
          setSelectedProcedures([]);
          setIsCreateModalOpen(false);
          await refreshBase();
          toast.success("Сервісний запис додано.");
        })
        .catch((error) => {
          const message = getApiErrorMessage(error);
          setStatus(message);
          toast.error(message);
        });
    });
  }

  function handleDeleteLog() {
    if (!selectedVehicleId || !logToDelete) {
      return;
    }

    const targetLog = logToDelete;
    setDeletingLogId(targetLog.id);
    setLogToDelete(null);
    setStatus("Видаляємо сервісний запис...");

    startDeleteTransition(() => {
      void deleteServiceLog(selectedVehicleId, targetLog.id)
        .then(async () => {
          const deletedLogDate = new Date(targetLog.service_date).toLocaleDateString("uk-UA");
          await refreshLogs(selectedVehicleId);
          setStatus("Журнал сервісу синхронізовано.");
          toast.success(`Сервісний запис від ${deletedLogDate} видалено.`);
        })
        .catch((error) => {
          const message = getApiErrorMessage(error);
          setStatus(message);
          toast.error(message);
        })
        .finally(() => {
          setDeletingLogId(null);
        });
    });
  }

  const createForm = (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      {requestedProcedureIds.length > 0 ? (
        <div className="rounded-[20px] border border-[rgba(197,27,27,0.22)] bg-[rgba(197,27,27,0.06)] p-4 text-sm leading-6 text-[var(--muted)]">
          Ми вже підставили роботи з нагадування для цього авто. Перевірте дату, пробіг і збережіть запис сервісу.
        </div>
      ) : null}
      {[
        ["serviceDate", "Дата сервісу", "date"],
        ["mileageKm", "Пробіг на момент сервісу", "number"],
        ["serviceStation", "Назва СТО", "text"],
        ["notesUk", "Коментар до візиту", "text"]
      ].map(([key, label, type]) => (
        <label key={key} className="flex flex-col gap-2 text-sm text-[var(--muted)]">
          {label}
          <input
            value={form[key as keyof typeof form]}
            onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
            className="field"
            placeholder={label}
            type={type}
            required={key === "serviceDate" || key === "mileageKm"}
          />
        </label>
      ))}
      <FancyMultiSelect
        label="Виконані роботи"
        values={selectedProcedures}
        onChange={setSelectedProcedures}
        options={procedures.map((procedure) => ({
          value: procedure.id,
          label: procedure.title_uk,
          description: formatUah(procedure.labor_price_uah) ? `Орієнтовно ${formatUah(procedure.labor_price_uah)}` : "Ціну уточнюйте на СТО"
        }))}
        selectionTotalUah={sumUah(
          selectedProcedures.map((procedureId) => procedures.find((procedure) => procedure.id === procedureId)?.labor_price_uah)
        )}
        helper="Можна обрати одразу кілька пунктів із поточного плану автомобіля."
        placeholder="Оберіть виконані роботи"
        emptyMessage="Для цього авто ще немає доступних робіт у плані обслуговування."
      />
      <div className="flex flex-wrap gap-3">
        <button disabled={isCreatePending} className="btn-primary">
          Додати запис
        </button>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(false)}
          className="btn-ghost"
        >
          Скасувати
        </button>
      </div>
      <p className="text-sm leading-6 text-[var(--muted)]">{status}</p>
    </form>
  );

  return (
    <>
      <div className="space-y-5">
        <section className="rounded-[22px] border border-[var(--line)] bg-white/4 p-4 sm:p-5">
          <div className="space-y-4">
            <div className="min-w-[280px]">
              {vehicles.length > 0 ? (
                <FancySelect
                  label="Автомобіль"
                  value={selectedVehicleId}
                  onChange={(value) => {
                    setSelectedVehicleId(value);
                    void refreshLogs(value);
                  }}
                  options={vehicles.map((vehicle) => ({
                    value: vehicle.id,
                    label: `${vehicle.make} ${vehicle.model} ${vehicle.year}`,
                    description: `Поточний пробіг ${vehicle.mileage_km.toLocaleString("uk-UA")} км`
                  }))}
                  helper="Оберіть авто, щоб переглянути історію сервісу та додати новий запис."
                  required
                />
              ) : null}
            </div>

            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                disabled={!selectedVehicleId}
                className="btn-primary"
              >
                Додати запис сервісу
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
        {logs.length === 0 ? (
          <EmptyState title="Журнал порожній" description="Після першого збереження тут зʼявляться реальні записи ТО для обраного автомобіля." />
        ) : (
          logs.map((log) => {
            const isDeletingThisLog = deletingLogId === log.id;

            return (
              <article key={log.id} className="rounded-[22px] border border-[var(--line)] bg-white/4 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--foreground)]">{new Date(log.service_date).toLocaleDateString("uk-UA")}</h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">{log.mileage_km.toLocaleString("uk-UA")} км · {log.service_station ?? "Без назви СТО"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLogToDelete(log)}
                    disabled={isDeletingThisLog}
                    className="btn-danger btn-sm disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isDeletingThisLog ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[rgba(197,27,27,0.25)] border-t-[#c51b1b]" aria-hidden="true" />
                    ) : null}
                    {isDeletingThisLog ? "Видаляємо..." : "Видалити"}
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {log.items.map((item) => (
                    <span key={`${log.id}-${item.procedure_id}`} className="rounded-full border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)]">
                      {item.title_uk}
                    </span>
                  ))}
                </div>
                {log.notes_uk ? <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{log.notes_uk}</p> : null}
              </article>
            );
          })
        )}
        </section>
      </div>

      <AppModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Новий сервісний запис"
        description="Зафіксуйте візит на СТО, відмітьте виконані роботи і збережіть його в історії автомобіля."
        maxWidthClassName="max-w-3xl"
      >
        {createForm}
      </AppModal>

      <AppModal
        open={logToDelete !== null}
        onClose={() => {
          if (!isDeletePending) {
            setLogToDelete(null);
          }
        }}
        title="Видалити сервісний запис"
        description="Запис буде прибрано з історії сервісу, а пов'язані пункти плану обслуговування буде перераховано."
        maxWidthClassName="max-w-lg"
      >
        <div className="grid gap-4">
          <div className="rounded-[20px] border border-[rgba(255,107,107,0.18)] bg-[rgba(255,107,107,0.08)] p-4 text-sm leading-6 text-[var(--muted)]">
            {logToDelete ? (
              <>
                Ви дійсно хочете видалити запис від {new Date(logToDelete.service_date).toLocaleDateString("uk-UA")} на {logToDelete.mileage_km.toLocaleString("uk-UA")} км?
              </>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDeleteLog}
              disabled={isDeletePending}
              className="btn-danger"
            >
              {isDeletePending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[rgba(14,13,12,0.25)] border-t-slate-950" aria-hidden="true" />
              ) : null}
              {isDeletePending ? "Видаляємо..." : "Видалити запис"}
            </button>
            <button
              type="button"
              onClick={() => setLogToDelete(null)}
              disabled={isDeletePending}
              className="btn-ghost"
            >
              Скасувати
            </button>
          </div>
        </div>
      </AppModal>
    </>
  );
}
