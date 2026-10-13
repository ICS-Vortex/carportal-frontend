"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import { useServiceStation } from "@/components/providers/service-station-provider";
import { AppModal } from "@/components/shared/app-modal";
import { ServiceStationSelect } from "@/components/shared/service-station-select";
import { EmptyState } from "@/components/shared/empty-state";
import { useToast } from "@/components/shared/toast-provider";
import { FancyMultiSelect } from "@/components/ui/fancy-multi-select";
import { FancySelect } from "@/components/ui/fancy-select";
import { AppointmentTimeSlots } from "@/components/service-logs/appointment-time-slots";
import { createServiceLog, deleteServiceLog, getApiErrorMessage, getMaintenancePlan, listServiceLogs, listVehicles } from "@/lib/api";
import { formatUah, sumUah } from "@/lib/format-money";
import { kyivTodayDateString } from "@/lib/kyiv-date";
import type { MaintenancePlanItem, ServiceLog, Vehicle } from "@/lib/types";

type CreateModalMode = "visit" | "appointment";

function buildVisitForm(vehicle?: Vehicle) {
  return {
    serviceDate: new Date().toISOString().slice(0, 10),
    mileageKm: vehicle ? String(vehicle.mileage_km) : "",
    notesUk: ""
  };
}

function buildAppointmentForm(vehicle?: Vehicle) {
  return {
    serviceDate: kyivTodayDateString(),
    mileageKm: vehicle ? String(vehicle.mileage_km) : "",
    notesUk: ""
  };
}

export function ServiceLogsClient() {
  const { stationId, stationLabel } = useServiceStation();
  const maintenanceOptions = useMemo(() => (stationId ? { stationId } : undefined), [stationId]);
  const searchParams = useSearchParams();
  const requestedVehicleId = searchParams.get("vehicleId") ?? "";
  const requestedProcedureIds = searchParams
    .get("procedureIds")
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean) ?? [];
  const shouldOpenCreate = searchParams.get("create") === "1";
  const minServiceDate = kyivTodayDateString();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [procedures, setProcedures] = useState<Array<{ id: string; title_uk: string; labor_price_uah: number | null }>>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  const [logs, setLogs] = useState<ServiceLog[]>([]);
  const [form, setForm] = useState(buildVisitForm());
  const [serviceTime, setServiceTime] = useState("");
  const [createModalMode, setCreateModalMode] = useState<CreateModalMode>("visit");
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
    if (!requestedVehicleId || selectedVehicleId !== requestedVehicleId || vehicles.length === 0) {
      return;
    }

    if (requestedProcedureIds.length > 0 && procedures.length > 0) {
      setCreateModalMode("appointment");
      setForm(buildAppointmentForm(vehicles.find((vehicle) => vehicle.id === requestedVehicleId)));
      setServiceTime("");
      setIsCreateModalOpen(true);
      return;
    }

    if (shouldOpenCreate && requestedProcedureIds.length === 0) {
      setCreateModalMode("appointment");
      setForm(buildAppointmentForm(vehicles.find((vehicle) => vehicle.id === requestedVehicleId)));
      setServiceTime("");
      setIsCreateModalOpen(true);
    }
  }, [
    procedures.length,
    requestedProcedureIds.length,
    requestedVehicleId,
    selectedVehicleId,
    shouldOpenCreate,
    vehicles.length
  ]);

  async function refreshBase() {
    try {
      const vehicleItems = await listVehicles();
      setVehicles(vehicleItems);
      const nextVehicleId = vehicleItems.some((vehicle) => vehicle.id === requestedVehicleId)
        ? requestedVehicleId
        : selectedVehicleId || vehicleItems[0]?.id || "";
      setSelectedVehicleId(nextVehicleId);

      if (nextVehicleId) {
        const [logItems, plan] = await Promise.all([
          listServiceLogs(nextVehicleId),
          getMaintenancePlan(nextVehicleId, maintenanceOptions)
        ]);
        setLogs(logItems);
        applyPlanItems(plan.items);
      } else {
        setLogs([]);
        setProcedures([]);
      }

    } catch (error) {
      toast.error(getApiErrorMessage(error));
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
      const [logItems, plan] = await Promise.all([
        listServiceLogs(vehicleId),
        getMaintenancePlan(vehicleId, maintenanceOptions)
      ]);
      setLogs(logItems);
      applyPlanItems(plan.items);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  useEffect(() => {
    void refreshBase();
  }, [maintenanceOptions, requestedProcedureIds.join(","), requestedVehicleId]);

  const isAppointmentModal = createModalMode === "appointment";
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleId);

  function openVisitCreateModal() {
    setCreateModalMode("visit");
    setForm(buildVisitForm(selectedVehicle));
    setServiceTime("");
    setIsCreateModalOpen(true);
  }

  function closeCreateModal() {
    setIsCreateModalOpen(false);
    setCreateModalMode("visit");
    setServiceTime("");
    setForm(buildVisitForm(selectedVehicle));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedVehicleId) {
      toast.error("Оберіть автомобіль для запису сервісу.");
      return;
    }

    if (selectedProcedures.length === 0) {
      toast.error(isAppointmentModal ? "Оберіть хоча б одну роботу для візиту." : "Оберіть хоча б одну процедуру.");
      return;
    }

    if (isAppointmentModal) {
      if (!stationId) {
        toast.error("Оберіть СТО перед записом на візит.");
        return;
      }

      if (!serviceTime) {
        toast.error("Оберіть час візиту з доступних слотів.");
        return;
      }

      if (form.serviceDate < minServiceDate) {
        toast.error("Неможливо обрати дату в минулому.");
        return;
      }
    }

    startCreateTransition(() => {
      void createServiceLog(selectedVehicleId, {
        serviceDate: form.serviceDate,
        serviceTime: isAppointmentModal ? serviceTime : null,
        recordKind: isAppointmentModal ? "appointment" : "visit",
        mileageKm: form.mileageKm ? Number(form.mileageKm) : undefined,
        serviceStationId: stationId || null,
        notesUk: form.notesUk || null,
        items: selectedProcedures.map((procedureId) => ({ procedureId }))
      })
        .then(async () => {
          closeCreateModal();
          setSelectedProcedures([]);
          await refreshBase();
          toast.success(isAppointmentModal ? "Запис на СТО збережено." : "Сервісний запис додано.");
        })
        .catch((error) => {
          toast.error(getApiErrorMessage(error));
        });
    });
  }

  function formatLogHeading(log: ServiceLog): string {
    const dateLabel = new Date(log.service_date).toLocaleDateString("uk-UA");

    if (log.record_kind === "appointment" && log.service_time) {
      return `${dateLabel} · ${log.service_time}`;
    }

    return dateLabel;
  }

  function handleDeleteLog() {
    if (!selectedVehicleId || !logToDelete) {
      return;
    }

    const targetLog = logToDelete;
    setDeletingLogId(targetLog.id);
    setLogToDelete(null);
    startDeleteTransition(() => {
      void deleteServiceLog(selectedVehicleId, targetLog.id)
        .then(async () => {
          const deletedLogDate = new Date(targetLog.service_date).toLocaleDateString("uk-UA");
          await refreshLogs(selectedVehicleId);
          toast.success(`Сервісний запис від ${deletedLogDate} видалено.`);
        })
        .catch((error) => {
          toast.error(getApiErrorMessage(error));
        })
        .finally(() => {
          setDeletingLogId(null);
        });
    });
  }

  const createForm = (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      {isAppointmentModal && requestedProcedureIds.length > 0 ? (
        <div className="rounded-[20px] border border-[rgba(197,27,27,0.22)] bg-[rgba(197,27,27,0.06)] p-4 text-sm leading-6 text-[var(--muted)]">
          Ми вже підставили роботи з нагадувань. Оберіть дату, вільний час і підтвердіть запис на СТО.
        </div>
      ) : null}
      {stationLabel ? (
        <p className="rounded-[20px] border border-[var(--line)] bg-black/5 px-4 py-3 text-sm leading-6 text-[var(--muted)]">
          СТО: <strong className="text-[var(--foreground)]">{stationLabel}</strong> (змінити можна у виборі СТО вище)
        </p>
      ) : isAppointmentModal ? (
        <p className="rounded-[20px] border border-[rgba(224,163,106,0.35)] bg-[rgba(224,163,106,0.08)] px-4 py-3 text-sm leading-6 text-[var(--muted)]">
          Для запису на візит спочатку оберіть СТО у блоці вище — від цього залежать вільні години.
        </p>
      ) : null}
      <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
        {isAppointmentModal ? "Дата візиту" : "Дата сервісу"}
        <input
          value={form.serviceDate}
          onChange={(event) => {
            setForm((current) => ({ ...current, serviceDate: event.target.value }));
            setServiceTime("");
          }}
          className="field"
          type="date"
          min={isAppointmentModal ? minServiceDate : undefined}
          required
        />
      </label>
      {isAppointmentModal ? (
        <AppointmentTimeSlots
          stationId={stationId}
          serviceDate={form.serviceDate}
          value={serviceTime}
          onChange={setServiceTime}
        />
      ) : null}
      <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
        {isAppointmentModal ? "Орієнтовний пробіг на день візиту" : "Пробіг на момент сервісу"}
        <input
          value={form.mileageKm}
          onChange={(event) => setForm((current) => ({ ...current, mileageKm: event.target.value }))}
          className="field"
          placeholder={isAppointmentModal ? "За потреби уточніть очікуваний пробіг" : "Пробіг на момент сервісу"}
          type="number"
          required={!isAppointmentModal}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
        {isAppointmentModal ? "Коментар до запису" : "Коментар до візиту"}
        <input
          value={form.notesUk}
          onChange={(event) => setForm((current) => ({ ...current, notesUk: event.target.value }))}
          className="field"
          placeholder={isAppointmentModal ? "Побажання, додаткові деталі для СТО" : "Коментар до візиту"}
          type="text"
        />
      </label>
      <FancyMultiSelect
        label={isAppointmentModal ? "Планові роботи на візит" : "Виконані роботи"}
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
        helper={isAppointmentModal
          ? "Оберіть роботи, які хочете виконати під час візиту. Можна взяти пункти з регламенту або майбутніх нагадувань."
          : "Можна обрати одразу кілька пунктів із поточного плану автомобіля."}
        placeholder={isAppointmentModal ? "Оберіть роботи для візиту" : "Оберіть виконані роботи"}
        emptyMessage="Для цього авто ще немає доступних робіт у плані обслуговування."
      />
      <div className="flex flex-wrap gap-3">
        <button disabled={isCreatePending} className="btn-primary">
          {isAppointmentModal ? "Записатися на СТО" : "Додати запис"}
        </button>
        <button
          type="button"
          onClick={closeCreateModal}
          className="btn-ghost"
        >
          Скасувати
        </button>
      </div>
    </form>
  );

  return (
    <>
      <div className="space-y-5">
        <section className="rounded-[22px] border border-[var(--line)] bg-white/4 p-4 sm:p-5">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 md:items-start">
              <ServiceStationSelect
                searchable
                showImage={false}
                helper="Оберіть СТО для нових записів; пошук за назвою, містом або адресою."
              />
              <div className="min-w-0">
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
            </div>

            <div className="flex justify-start">
              <button
                type="button"
                onClick={openVisitCreateModal}
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
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-semibold text-[var(--foreground)]">{formatLogHeading(log)}</h3>
                      {log.record_kind === "appointment" ? (
                        <span className="status-wait">Запис на СТО</span>
                      ) : null}
                    </div>
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
        onClose={closeCreateModal}
        title={isAppointmentModal ? "Запис на СТО" : "Новий сервісний запис"}
        description={isAppointmentModal
          ? "Оберіть дату, вільний час і роботи, які плануєте виконати. Запис зʼявиться в журналі як майбутній візит."
          : "Зафіксуйте завершений візит на СТО, відмітьте виконані роботи і збережіть його в історії автомобіля."}
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
