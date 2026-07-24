"use client";

import { FancySelect } from "@/components/ui/fancy-select";
import { ADMIN_TEMPLATE_UI } from "@/lib/ui-copy";
import type { VehicleCatalogResponse } from "@/lib/types";

export type AdminTemplateFormState = {
  nameUk: string;
  brandId: string;
  modelId: string;
  generationId: string;
  configurationId: string;
  notesUk: string;
};

type AdminTemplateFormProps = {
  catalog: VehicleCatalogResponse | null;
  form: AdminTemplateFormState;
  isPending: boolean;
  editing: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: (key: keyof AdminTemplateFormState, value: string) => void;
  onBrandChange: (brandId: string) => void;
  onModelChange: (modelId: string) => void;
  onGenerationChange: (generationId: string) => void;
  onConfigurationChange: (configurationId: string) => void;
};

function formatYearRange(yearFrom: number, yearTo: number) {
  return yearFrom === yearTo ? String(yearFrom) : `${yearFrom} - ${yearTo}`;
}

export function AdminTemplateForm({
  catalog,
  form,
  isPending,
  editing,
  onSubmit,
  onChange,
  onBrandChange,
  onModelChange,
  onGenerationChange,
  onConfigurationChange
}: AdminTemplateFormProps) {
  const brand = catalog?.brands.find((item) => item.id === form.brandId) ?? catalog?.brands[0] ?? null;
  const model = brand?.models.find((item) => item.id === form.modelId) ?? brand?.models[0] ?? null;
  const generation = model?.generations.find((item) => item.id === form.generationId) ?? model?.generations[0] ?? null;
  const configuration = generation?.configurations.find((item) => item.id === form.configurationId) ?? generation?.configurations[0] ?? null;

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
        {ADMIN_TEMPLATE_UI.form.titleLabel}
        <input
          value={form.nameUk}
          onChange={(event) => onChange("nameUk", event.target.value)}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          placeholder={ADMIN_TEMPLATE_UI.form.titlePlaceholder}
          required
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <FancySelect
          label={ADMIN_TEMPLATE_UI.form.makeLabel}
          value={brand?.id ?? ""}
          onChange={onBrandChange}
          options={(catalog?.brands ?? []).map((item) => ({ value: item.id, label: item.name, description: `${item.models.length} моделей` }))}
          required
        />
        <FancySelect
          label={ADMIN_TEMPLATE_UI.form.modelLabel}
          value={model?.id ?? ""}
          onChange={onModelChange}
          options={(brand?.models ?? []).map((item) => ({ value: item.id, label: item.name, description: `${item.generations.length} поколінь` }))}
          required
        />
        <FancySelect
          label={ADMIN_TEMPLATE_UI.form.generationLabel}
          value={generation?.id ?? ""}
          onChange={onGenerationChange}
          options={(model?.generations ?? []).map((item) => ({ value: item.id, label: item.name, description: `${item.year_from}-${item.year_to}` }))}
          required
        />
        <FancySelect
          label={ADMIN_TEMPLATE_UI.form.configurationLabel}
          value={configuration?.id ?? ""}
          onChange={onConfigurationChange}
          options={(generation?.configurations ?? []).map((item) => ({
            value: item.id,
            label: `${item.engine_label} / ${item.transmission_label}`,
            description: [item.drivetrain_label, item.fuel_type].filter(Boolean).join(" • ") || item.notes_uk || undefined
          }))}
          accent="amber"
          required
        />
      </div>

      {generation ? (
        <div className="rounded-[18px] border border-white/8 bg-white/4 p-4 text-sm leading-6 text-[var(--muted)]">
          <p className="font-medium text-white">{brand?.name} {model?.name} {generation.name}</p>
          <p className="mt-2">Роки випуску: {formatYearRange(generation.year_from, generation.year_to)}</p>
          {generation.notes_uk ? <p className="mt-2">{generation.notes_uk}</p> : null}
          {configuration ? <p className="mt-2">Конфігурація: <span className="text-white">{configuration.engine_label} / {configuration.transmission_label}{configuration.drivetrain_label ? ` / ${configuration.drivetrain_label}` : ""}</span></p> : null}
          {configuration?.notes_uk ? <p className="mt-2">{configuration.notes_uk}</p> : null}
        </div>
      ) : null}

      <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
        {ADMIN_TEMPLATE_UI.form.notesLabel}
        <textarea
          value={form.notesUk}
          onChange={(event) => onChange("notesUk", event.target.value)}
          className="min-h-28 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          placeholder={ADMIN_TEMPLATE_UI.form.notesPlaceholder}
        />
      </label>

      <button disabled={isPending || !configuration} className="rounded-full bg-[linear-gradient(135deg,#4f84ff,#4ccfff)] px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60">
        {editing ? ADMIN_TEMPLATE_UI.form.saveUpdate : ADMIN_TEMPLATE_UI.form.saveCreate}
      </button>
    </form>
  );
}