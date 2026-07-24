"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AdminTemplateForm, type AdminTemplateFormState } from "@/components/admin/admin-template-form";
import { AdminModal } from "@/components/admin/admin-modal";
import { FancySelect } from "@/components/ui/fancy-select";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { useToast } from "@/components/shared/toast-provider";
import {
  createAdminProcedure,
  createAdminTemplate,
  createAdminTemplateItem,
  deleteAdminProcedure,
  deleteAdminTemplate,
  deleteAdminTemplateItem,
  getAdminCatalog,
  getApiErrorMessage,
  updateAdminProcedure,
  updateAdminTemplate,
  updateAdminTemplateItem
} from "@/lib/api";
import type { AdminCatalogResponse } from "@/lib/types";

const procedureInitial = {
  code: "",
  titleUk: "",
  descriptionUk: "",
  defaultIntervalKm: "",
  defaultIntervalMonths: "",
  category: ""
};

function buildTemplateInitial(catalog: AdminCatalogResponse | null): AdminTemplateFormState {
  const brand = catalog?.vehicleCatalog.brands[0];
  const model = brand?.models[0];
  const generation = model?.generations[0];
  const configuration = generation?.configurations[0];

  return {
    nameUk: "",
    brandId: brand?.id ?? "",
    modelId: model?.id ?? "",
    generationId: generation?.id ?? "",
    configurationId: configuration?.id ?? "",
    notesUk: ""
  };
}

const itemInitial = {
  templateId: "",
  procedureId: "",
  intervalKm: "",
  intervalMonths: "",
  notesUk: ""
};

type ProcedureFormState = typeof procedureInitial;
type ItemFormState = typeof itemInitial;
type Panel = "procedures" | "templates" | "items";
type DeleteState = {
  kind: "procedure" | "template" | "item";
  id: string;
  title: string;
  description: string;
} | null;

export function AdminCmsClient() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [catalog, setCatalog] = useState<AdminCatalogResponse | null>(null);
  const [status, setStatus] = useState("Завантажуємо довідник...");
  const [activePanel, setActivePanel] = useState<Panel>("procedures");
  const [modalType, setModalType] = useState<"procedure" | "template" | "item" | null>(null);
  const [deleteState, setDeleteState] = useState<DeleteState>(null);
  const [procedureForm, setProcedureForm] = useState(procedureInitial);
  const [templateForm, setTemplateForm] = useState<AdminTemplateFormState>(buildTemplateInitial(null));
  const [itemForm, setItemForm] = useState(itemInitial);
  const [editingProcedureId, setEditingProcedureId] = useState<string | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingScheduleItemId, setEditingScheduleItemId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  function findTemplateSelection(nextCatalog: AdminCatalogResponse | null, configurationId: string) {
    for (const brand of nextCatalog?.vehicleCatalog.brands ?? []) {
      for (const model of brand.models) {
        for (const generation of model.generations) {
          const configuration = generation.configurations.find((item) => item.id === configurationId);

          if (configuration) {
            return { brand, model, generation, configuration };
          }
        }
      }
    }

    return null;
  }

  function updateQuery(mutator: (params: URLSearchParams) => void) {
    const nextParams = new URLSearchParams(searchParams.toString());
    mutator(nextParams);

    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function clearEntityParams() {
    updateQuery((params) => {
      params.delete("procedureId");
      params.delete("templateId");
      params.delete("itemId");
    });
  }

  function setPanel(panel: Panel) {
    setActivePanel(panel);
    updateQuery((params) => {
      params.set("panel", panel);
      params.delete("procedureId");
      params.delete("templateId");
      params.delete("itemId");
    });
  }

  function openEditDeepLink(kind: "procedure" | "template" | "item", id: string) {
    const panel = kind === "procedure" ? "procedures" : kind === "template" ? "templates" : "items";

    updateQuery((params) => {
      params.set("panel", panel);
      params.delete("procedureId");
      params.delete("templateId");
      params.delete("itemId");
      params.set(kind === "procedure" ? "procedureId" : kind === "template" ? "templateId" : "itemId", id);
    });
  }

  function resetProcedureForm() {
    setProcedureForm(procedureInitial);
    setEditingProcedureId(null);
    setModalType(null);
  }

  function resetTemplateForm() {
    setTemplateForm(buildTemplateInitial(catalog));
    setEditingTemplateId(null);
    setModalType(null);
  }

  function resetItemForm(nextCatalog?: AdminCatalogResponse | null) {
    setItemForm({
      ...itemInitial,
      templateId: nextCatalog?.templateHeaders[0]?.id ?? itemForm.templateId ?? "",
      procedureId: nextCatalog?.procedures[0]?.id ?? itemForm.procedureId ?? ""
    });
    setEditingScheduleItemId(null);
    setModalType(null);
  }

  function populateProcedureForm(form: ProcedureFormState, procedureId: string) {
    setProcedureForm(form);
    setEditingProcedureId(procedureId);
    setActivePanel("procedures");
    setModalType("procedure");
  }

  function populateTemplateForm(form: AdminTemplateFormState, templateId: string) {
    setTemplateForm(form);
    setEditingTemplateId(templateId);
    setActivePanel("templates");
    setModalType("template");
  }

  function populateItemForm(form: ItemFormState, scheduleItemId: string) {
    setItemForm(form);
    setEditingScheduleItemId(scheduleItemId);
    setActivePanel("items");
    setModalType("item");
  }

  function openCreateModal(type: "procedure" | "template" | "item") {
    const panel = type === "procedure" ? "procedures" : type === "template" ? "templates" : "items";
    setActivePanel(panel);
    clearEntityParams();
    updateQuery((params) => {
      params.set("panel", panel);
    });

    if (type === "procedure") {
      setProcedureForm(procedureInitial);
      setEditingProcedureId(null);
    }

    if (type === "template") {
      setTemplateForm(buildTemplateInitial(catalog));
      setEditingTemplateId(null);
    }

    if (type === "item") {
      setItemForm((current) => ({
        ...itemInitial,
        templateId: current.templateId || catalog?.templateHeaders[0]?.id || "",
        procedureId: current.procedureId || catalog?.procedures[0]?.id || ""
      }));
      setEditingScheduleItemId(null);
    }

    setModalType(type);
  }

  async function refresh() {
    try {
      const nextCatalog = await getAdminCatalog();
      setCatalog(nextCatalog);
      setTemplateForm((current) => current.configurationId && findTemplateSelection(nextCatalog, current.configurationId)
        ? current
        : buildTemplateInitial(nextCatalog));
      setItemForm((current) => ({
        ...current,
        templateId: nextCatalog.templateHeaders.some((item) => item.id === current.templateId)
          ? current.templateId
          : nextCatalog.templateHeaders[0]?.id || "",
        procedureId: nextCatalog.procedures.some((item) => item.id === current.procedureId)
          ? current.procedureId
          : nextCatalog.procedures[0]?.id || ""
      }));
      setStatus("Довідник оновлено.");
      return nextCatalog;
    } catch (error) {
      const message = getApiErrorMessage(error);
      setStatus(message);
      toast.error(message);
      return null;
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    const panel = searchParams.get("panel");

    if (panel === "procedures" || panel === "templates" || panel === "items") {
      setActivePanel(panel);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!catalog) {
      return;
    }

    const procedureId = searchParams.get("procedureId");
    const templateId = searchParams.get("templateId");
    const itemId = searchParams.get("itemId");

    if (procedureId) {
      const procedure = catalog.procedures.find((item) => item.id === procedureId);

      if (procedure) {
        populateProcedureForm({
          code: procedure.code,
          titleUk: procedure.title_uk,
          descriptionUk: procedure.description_uk ?? "",
          defaultIntervalKm: procedure.default_interval_km?.toString() ?? "",
          defaultIntervalMonths: procedure.default_interval_months?.toString() ?? "",
          category: procedure.category
        }, procedure.id);
      }

      return;
    }

    if (templateId) {
      const template = catalog.templateHeaders.find((item) => item.id === templateId);
      const selection = template?.configuration_id ? findTemplateSelection(catalog, template.configuration_id) : null;

      if (template && selection) {
        populateTemplateForm({
          nameUk: template.name_uk,
          brandId: selection.brand.id,
          modelId: selection.model.id,
          generationId: selection.generation.id,
          configurationId: selection.configuration.id,
          notesUk: template.notes_uk ?? ""
        }, template.id);
      }

      return;
    }

    if (itemId) {
      const item = catalog.templates.find((entry) => entry.schedule_item_id === itemId);

      if (item) {
        populateItemForm({
          templateId: item.template_id,
          procedureId: item.procedure_id,
          intervalKm: item.interval_km?.toString() ?? "",
          intervalMonths: item.interval_months?.toString() ?? "",
          notesUk: item.notes_uk ?? ""
        }, item.schedule_item_id);
      }
    }
  }, [catalog, searchParams]);

  function submitProcedure(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(editingProcedureId ? "Оновлюємо процедуру..." : "Додаємо процедуру...");

    startTransition(() => {
      const payload = {
        code: procedureForm.code,
        titleUk: procedureForm.titleUk,
        descriptionUk: procedureForm.descriptionUk || null,
        defaultIntervalKm: procedureForm.defaultIntervalKm ? Number(procedureForm.defaultIntervalKm) : null,
        defaultIntervalMonths: procedureForm.defaultIntervalMonths ? Number(procedureForm.defaultIntervalMonths) : null,
        category: procedureForm.category
      };

      void (editingProcedureId
        ? updateAdminProcedure(editingProcedureId, payload)
        : createAdminProcedure(payload))
        .then(async () => {
          resetProcedureForm();
          clearEntityParams();
          await refresh();
          toast.success(editingProcedureId ? "Процедуру оновлено." : "Процедуру створено.");
        })
        .catch((error) => {
          const message = getApiErrorMessage(error);
          setStatus(message);
          toast.error(message);
        });
    });
  }

  function submitTemplate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(editingTemplateId ? "Оновлюємо шаблон регламенту..." : "Створюємо шаблон регламенту...");

    startTransition(() => {
      const payload = {
        nameUk: templateForm.nameUk,
        configurationId: templateForm.configurationId,
        notesUk: templateForm.notesUk || null
      };

      void (editingTemplateId
        ? updateAdminTemplate(editingTemplateId, payload)
        : createAdminTemplate(payload))
        .then(async () => {
          resetTemplateForm();
          clearEntityParams();
          await refresh();
          toast.success(editingTemplateId ? "Шаблон оновлено." : "Шаблон створено.");
        })
        .catch((error) => {
          const message = getApiErrorMessage(error);
          setStatus(message);
          toast.error(message);
        });
    });
  }

  function submitTemplateItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(editingScheduleItemId ? "Оновлюємо пункт шаблону..." : "Привʼязуємо процедуру до шаблону...");

    startTransition(() => {
      const payload = {
        templateId: itemForm.templateId,
        procedureId: itemForm.procedureId,
        intervalKm: itemForm.intervalKm ? Number(itemForm.intervalKm) : null,
        intervalMonths: itemForm.intervalMonths ? Number(itemForm.intervalMonths) : null,
        notesUk: itemForm.notesUk || null
      };

      void (editingScheduleItemId
        ? updateAdminTemplateItem(editingScheduleItemId, payload)
        : createAdminTemplateItem(payload))
        .then(async () => {
          const nextCatalog = await refresh();
          resetItemForm(nextCatalog);
          clearEntityParams();
          toast.success(editingScheduleItemId ? "Привʼязку оновлено." : "Привʼязку створено.");
        })
        .catch((error) => {
          const message = getApiErrorMessage(error);
          setStatus(message);
          toast.error(message);
        });
    });
  }

  function confirmDelete() {
    if (!deleteState) {
      return;
    }

    setStatus(deleteState.kind === "procedure"
      ? "Видаляємо процедуру..."
      : deleteState.kind === "template"
        ? "Видаляємо шаблон..."
        : "Видаляємо пункт шаблону..."
    );

    startTransition(() => {
      const request = deleteState.kind === "procedure"
        ? deleteAdminProcedure(deleteState.id)
        : deleteState.kind === "template"
          ? deleteAdminTemplate(deleteState.id)
          : deleteAdminTemplateItem(deleteState.id);

      void request
        .then(async () => {
          if (deleteState.kind === "procedure" && editingProcedureId === deleteState.id) {
            resetProcedureForm();
          }

          if (deleteState.kind === "template" && editingTemplateId === deleteState.id) {
            resetTemplateForm();
          }

          if (deleteState.kind === "item" && editingScheduleItemId === deleteState.id) {
            resetItemForm(catalog);
          }

          clearEntityParams();
          setDeleteState(null);
          await refresh();
          toast.success(deleteState.kind === "procedure"
            ? "Процедуру видалено."
            : deleteState.kind === "template"
              ? "Шаблон видалено."
              : "Привʼязку видалено.");
        })
        .catch((error) => {
          const message = getApiErrorMessage(error);
          setStatus(message);
          toast.error(message);
          setDeleteState(null);
        });
    });
  }

  function requestDeleteProcedure(procedureId: string, title: string) {
    setDeleteState({
      kind: "procedure",
      id: procedureId,
      title: "Видалити процедуру?",
      description: `Процедура «${title}» буде прибрана з довідника і більше не буде доступна для нових привʼязок.`
    });
  }

  function requestDeleteTemplate(templateId: string, title: string) {
    setDeleteState({
      kind: "template",
      id: templateId,
      title: "Видалити шаблон?",
      description: `Шаблон «${title}» та всі його привʼязки буде прибрано з каталогу.`
    });
  }

  function requestDeleteTemplateItem(scheduleItemId: string, title: string) {
    setDeleteState({
      kind: "item",
      id: scheduleItemId,
      title: "Видалити привʼязку?",
      description: `Пункт «${title}» буде прибрано з шаблону.`
    });
  }

  function formatYearRange(yearFrom: number | null, yearTo: number | null) {
    if (yearFrom && yearTo) {
      return `${yearFrom} - ${yearTo}`;
    }

    if (yearFrom) {
      return `від ${yearFrom}`;
    }

    if (yearTo) {
      return `до ${yearTo}`;
    }

    return "без меж років";
  }

  function renderProcedureForm() {
    return (
      <form className="grid gap-3" onSubmit={submitProcedure}>
        {[
          ["code", "Код"],
          ["titleUk", "Назва українською"],
          ["category", "Категорія"],
          ["descriptionUk", "Опис"],
          ["defaultIntervalKm", "Інтервал, км"],
          ["defaultIntervalMonths", "Інтервал, місяців"]
        ].map(([key, label]) => (
          <label key={key} className="flex flex-col gap-2 text-sm text-[var(--muted)]">
            {label}
            <input
              value={procedureForm[key as keyof typeof procedureForm]}
              onChange={(event) => setProcedureForm((current) => ({ ...current, [key]: event.target.value }))}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              placeholder={label}
              required={key === "code" || key === "titleUk" || key === "category"}
            />
          </label>
        ))}
        <button disabled={isPending} className="rounded-full bg-[linear-gradient(135deg,#4f84ff,#4ccfff)] px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60">
          {editingProcedureId ? "Оновити процедуру" : "Зберегти процедуру"}
        </button>
      </form>
    );
  }

  function renderTemplateForm() {
    return (
      <AdminTemplateForm
        catalog={catalog?.vehicleCatalog ?? null}
        form={templateForm}
        isPending={isPending}
        editing={Boolean(editingTemplateId)}
        onSubmit={submitTemplate}
        onChange={(key, value) => setTemplateForm((current) => ({ ...current, [key]: value }))}
        onBrandChange={(brandId) => {
          const brand = catalog?.vehicleCatalog.brands.find((item) => item.id === brandId);
          const model = brand?.models[0];
          const generation = model?.generations[0];
          const configuration = generation?.configurations[0];

          setTemplateForm((current) => ({
            ...current,
            brandId,
            modelId: model?.id ?? "",
            generationId: generation?.id ?? "",
            configurationId: configuration?.id ?? ""
          }));
        }}
        onModelChange={(modelId) => {
          const brand = catalog?.vehicleCatalog.brands.find((item) => item.id === templateForm.brandId);
          const model = brand?.models.find((item) => item.id === modelId);
          const generation = model?.generations[0];
          const configuration = generation?.configurations[0];

          setTemplateForm((current) => ({
            ...current,
            modelId,
            generationId: generation?.id ?? "",
            configurationId: configuration?.id ?? ""
          }));
        }}
        onGenerationChange={(generationId) => {
          const selection = catalog?.vehicleCatalog.brands
            .flatMap((brand) => brand.models.map((model) => ({ brand, model })))
            .flatMap(({ brand, model }) => model.generations.map((generation) => ({ brand, model, generation })))
            .find((entry) => entry.generation.id === generationId);

          if (!selection) {
            return;
          }

          setTemplateForm((current) => ({
            ...current,
            brandId: selection.brand.id,
            modelId: selection.model.id,
            generationId,
            configurationId: selection.generation.configurations[0]?.id ?? ""
          }));
        }}
        onConfigurationChange={(configurationId) => setTemplateForm((current) => ({ ...current, configurationId }))}
      />
    );
  }

  function renderItemForm() {
    return (
      <form className="grid gap-3" onSubmit={submitTemplateItem}>
        <FancySelect
          label="Шаблон"
          value={itemForm.templateId}
          onChange={(value) => setItemForm((current) => ({ ...current, templateId: value }))}
          options={(catalog?.templateHeaders ?? []).map((item) => ({
            value: item.id,
            label: item.name_uk,
            description: [item.vehicle_make, item.vehicle_model, item.configuration_label].filter(Boolean).join(" • ") || undefined
          }))}
          helper="Оберіть шаблон, до якого потрібно додати або оновити пункт робіт."
          accent="amber"
          required
        />
        <FancySelect
          label="Процедура"
          value={itemForm.procedureId}
          onChange={(value) => setItemForm((current) => ({ ...current, procedureId: value }))}
          options={(catalog?.procedures ?? []).map((item) => ({
            value: item.id,
            label: item.title_uk,
            description: item.category
          }))}
          helper="Оберіть роботу з довідника, щоб прив’язати її до шаблону."
          required
        />
        {[
          ["intervalKm", "Інтервал, км"],
          ["intervalMonths", "Інтервал, місяців"],
          ["notesUk", "Нотатки"]
        ].map(([key, label]) => (
          <label key={key} className="flex flex-col gap-2 text-sm text-[var(--muted)]">
            {label}
            <input
              value={itemForm[key as keyof typeof itemForm]}
              onChange={(event) => setItemForm((current) => ({ ...current, [key]: event.target.value }))}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              placeholder={label}
            />
          </label>
        ))}
        <button disabled={isPending} className="rounded-full bg-[linear-gradient(135deg,#4f84ff,#4ccfff)] px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60">
          {editingScheduleItemId ? "Оновити привʼязку" : "Додати до шаблону"}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[22px] border border-white/8 bg-white/4 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">Робочий режим довідника</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Форми створення і редагування винесено в модальні вікна, щоб список даних лишався компактним і придатним до швидкої роботи.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => openCreateModal("procedure")} className="rounded-full bg-[linear-gradient(135deg,#4f84ff,#4ccfff)] px-4 py-2 text-sm font-semibold text-slate-950">Нова процедура</button>
            <button type="button" onClick={() => openCreateModal("template")} className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white">Новий шаблон</button>
            <button type="button" onClick={() => openCreateModal("item")} className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white">Нова привʼязка</button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          ["procedures", "Процедури"],
          ["templates", "Шаблони"],
          ["items", "Привʼязки"]
        ].map(([value, label]) => {
          const active = activePanel === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => setPanel(value as Panel)}
              className={active
                ? "rounded-full border border-[rgba(76,207,255,0.45)] bg-[rgba(79,132,255,0.18)] px-4 py-2 text-sm font-semibold text-white"
                : "rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--muted)] transition hover:border-white/20 hover:text-white"
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6">
        {activePanel === "procedures" ? (
        <section className="rounded-[24px] border border-white/8 bg-white/4 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-semibold text-white">Процедури</h3>
            <button type="button" onClick={() => openCreateModal("procedure")} className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white">Додати</button>
          </div>
          <div className="mt-4 space-y-3">
            {(catalog?.procedures ?? []).map((item) => (
              <article key={item.id} className="rounded-[18px] border border-white/8 bg-black/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{item.title_uk}</h4>
                    <p className="mt-1 text-sm text-[var(--muted)]">{item.category} · {item.code}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <span className="rounded-full border border-white/10 px-3 py-2 text-xs text-white">
                      {item.default_interval_km ? `${item.default_interval_km.toLocaleString("uk-UA")} км` : "без км"}
                    </span>
                    <button
                      type="button"
                      onClick={() => openEditDeepLink("procedure", item.id)}
                      className="rounded-full border border-white/10 px-3 py-2 text-xs text-white"
                    >
                      Редагувати
                    </button>
                    <button
                      type="button"
                      onClick={() => requestDeleteProcedure(item.id, item.title_uk)}
                      className="rounded-full border border-[rgba(255,95,87,0.3)] px-3 py-2 text-xs text-[rgba(255,180,173,1)]"
                    >
                      Видалити
                    </button>
                  </div>
                </div>
                {item.description_uk ? <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.description_uk}</p> : null}
              </article>
            ))}
          </div>
        </section>
        ) : null}

        {activePanel === "templates" ? (
        <section className="rounded-[24px] border border-white/8 bg-white/4 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-semibold text-white">Шаблони регламенту</h3>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => openCreateModal("template")} className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white">Новий шаблон</button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {(catalog?.templateHeaders ?? []).map((header) => {
              const items = (catalog?.templates ?? []).filter((item) => item.template_id === header.id);

              return (
                <article key={header.id} className="rounded-[20px] border border-white/8 bg-black/10 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{header.name_uk}</h4>
                      <p className="mt-1 text-sm text-[var(--muted)]">{header.vehicle_make} {header.vehicle_model} {header.generation_code ?? ""}</p>
                      {header.configuration_label ? <p className="mt-2 text-sm text-white/80">{header.configuration_label}</p> : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 px-3 py-2 text-xs text-white">{items.length} пунктів</span>
                      <button
                        type="button"
                        onClick={() => openEditDeepLink("template", header.id)}
                        className="rounded-full border border-white/10 px-3 py-2 text-xs text-white"
                      >
                        Редагувати
                      </button>
                      <button
                        type="button"
                        onClick={() => requestDeleteTemplate(header.id, header.name_uk)}
                        className="rounded-full border border-[rgba(255,95,87,0.3)] px-3 py-2 text-xs text-[rgba(255,180,173,1)]"
                      >
                        Видалити
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-[var(--muted)]">
                    <span className="rounded-full border border-white/10 px-3 py-2">Роки: {formatYearRange(header.year_from, header.year_to)}</span>
                    {header.notes_uk ? <span className="rounded-full border border-white/10 px-3 py-2">Є нотатки</span> : null}
                    {items.slice(0, 3).map((item) => (
                      <span key={item.schedule_item_id} className="rounded-full border border-white/10 px-3 py-2 text-white">
                        {item.procedure_title}
                      </span>
                    ))}
                    {items.length > 3 ? <span className="rounded-full border border-white/10 px-3 py-2 text-white">+{items.length - 3} ще</span> : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
        ) : null}

        {activePanel === "items" ? (
        <section className="rounded-[24px] border border-white/8 bg-white/4 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-semibold text-white">Привʼязки у шаблонах</h3>
            <button type="button" onClick={() => openCreateModal("item")} className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white">Нова привʼязка</button>
          </div>
          <div className="mt-4 space-y-3">
            {(catalog?.templateHeaders ?? []).map((header) => {
              const items = (catalog?.templates ?? []).filter((item) => item.template_id === header.id);

              return (
                <article key={header.id} className="rounded-[20px] border border-white/8 bg-black/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-base font-semibold text-white">{header.name_uk}</h4>
                      <p className="mt-1 text-sm text-[var(--muted)]">{header.vehicle_make} {header.vehicle_model} {header.generation_code ?? ""}</p>
                      {header.configuration_label ? <p className="mt-2 text-sm text-white/80">{header.configuration_label}</p> : null}
                    </div>
                    <button type="button" onClick={() => openEditDeepLink("template", header.id)} className="rounded-full border border-white/10 px-3 py-2 text-xs text-white">До шаблону</button>
                  </div>

                  <div className="mt-4 grid gap-2">
                    {items.length === 0 ? (
                      <p className="rounded-[16px] border border-dashed border-white/10 px-4 py-3 text-sm text-[var(--muted)]">У шаблоні ще немає пунктів.</p>
                    ) : items.map((item) => (
                      <div key={item.schedule_item_id} className="grid gap-3 rounded-[16px] border border-white/8 bg-white/4 px-4 py-3 lg:grid-cols-[1.6fr_auto_auto] lg:items-center">
                        <div>
                          <p className="font-medium text-white">{item.procedure_title}</p>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {item.interval_km ? `${item.interval_km.toLocaleString("uk-UA")} км` : "без кілометрового інтервалу"}
                            {item.interval_months ? ` • ${item.interval_months} міс` : ""}
                          </p>
                        </div>
                        <button type="button" onClick={() => openEditDeepLink("item", item.schedule_item_id)} className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-white">
                          Редагувати
                        </button>
                        <button type="button" onClick={() => requestDeleteTemplateItem(item.schedule_item_id, item.procedure_title)} className="rounded-full border border-[rgba(255,95,87,0.3)] px-3 py-2 text-xs font-semibold text-[rgba(255,180,173,1)]">
                          Видалити
                        </button>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
        ) : null}
      </div>

      <AdminModal
        open={modalType === "procedure"}
        title={editingProcedureId ? "Редагування процедури" : "Нова процедура"}
        description="Створення і редагування процедур винесено в окреме вікно, щоб основний список залишався компактним."
        onClose={() => {
          resetProcedureForm();
          clearEntityParams();
        }}
      >
        {renderProcedureForm()}
      </AdminModal>

      <AdminModal
        open={modalType === "template"}
        title={editingTemplateId ? "Редагування шаблону" : "Новий шаблон"}
        description="Шаблон редагується в модальному вікні, а не розтягує сторінку вниз окремою формою."
        onClose={() => {
          resetTemplateForm();
          clearEntityParams();
        }}
      >
        {renderTemplateForm()}
      </AdminModal>

      <AdminModal
        open={modalType === "item"}
        title={editingScheduleItemId ? "Редагування привʼязки" : "Нова привʼязка"}
        description="Привʼязки відкриваються окремо, щоб список шаблонів залишався робочим, а не перетворювався на довгу форму."
        onClose={() => {
          resetItemForm(catalog);
          clearEntityParams();
        }}
      >
        {renderItemForm()}
      </AdminModal>

      <ConfirmModal
        open={Boolean(deleteState)}
        title={deleteState?.title ?? "Підтвердження"}
        description={deleteState?.description ?? ""}
        confirmLabel="Видалити"
        tone="danger"
        busy={isPending}
        onClose={() => setDeleteState(null)}
        onConfirm={confirmDelete}
      />

      <p className="text-sm leading-6 text-[var(--muted)]">{status}</p>
    </div>
  );
}
