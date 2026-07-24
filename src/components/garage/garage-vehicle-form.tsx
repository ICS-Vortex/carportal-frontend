"use client";

import { FancySelect } from "@/components/ui/fancy-select";
import { GARAGE_UI } from "@/lib/ui-copy";
import type { VehicleCatalogResponse } from "@/lib/types";

export type GarageVehicleFormState = {
  brandId: string;
  modelId: string;
  generationId: string;
  configurationId: string;
  year: string;
  vin: string;
  licensePlate: string;
  imageUrl: string;
  mileageKm: string;
};

type GarageVehicleFormProps = {
  catalog: VehicleCatalogResponse;
  form: GarageVehicleFormState;
  isPending: boolean;
  isUploadingImage: boolean;
  editing: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: (key: keyof GarageVehicleFormState, value: string) => void;
  onBrandChange: (brandId: string) => void;
  onModelChange: (modelId: string) => void;
  onGenerationChange: (generationId: string) => void;
  onImageSelection: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
};

export function GarageVehicleForm({
  catalog,
  form,
  isPending,
  isUploadingImage,
  editing,
  onSubmit,
  onChange,
  onBrandChange,
  onModelChange,
  onGenerationChange,
  onImageSelection,
  onRemoveImage
}: GarageVehicleFormProps) {
  const selectedBrand = catalog.brands.find((brand) => brand.id === form.brandId) ?? catalog.brands[0];
  const selectedModel = selectedBrand?.models.find((model) => model.id === form.modelId) ?? selectedBrand?.models[0];
  const selectedGeneration = selectedModel?.generations.find((generation) => generation.id === form.generationId) ?? selectedModel?.generations[0];
  const selectedConfiguration = selectedGeneration?.configurations.find((configuration) => configuration.id === form.configurationId) ?? selectedGeneration?.configurations[0];

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FancySelect
          label={GARAGE_UI.form.makeLabel}
          value={selectedBrand?.id ?? ""}
          onChange={onBrandChange}
          options={catalog.brands.map((brand) => ({ value: brand.id, label: brand.name, description: `${brand.models.length} моделей у довіднику` }))}
          helper="Спочатку оберіть бренд, щоб звузити каталог моделей."
          required
        />

        <FancySelect
          label={GARAGE_UI.form.modelLabel}
          value={selectedModel?.id ?? ""}
          onChange={onModelChange}
          options={(selectedBrand?.models ?? []).map((model) => ({ value: model.id, label: model.name, description: `${model.generations.length} поколінь` }))}
          helper="Модель визначає доступні покоління і конфігурації."
          required
        />

        <FancySelect
          label={GARAGE_UI.form.generationLabel}
          value={selectedGeneration?.id ?? ""}
          onChange={onGenerationChange}
          options={(selectedModel?.generations ?? []).map((generation) => ({
            value: generation.id,
            label: generation.name,
            description: `${generation.year_from}-${generation.year_to}`
          }))}
          helper="Покоління обмежує правильний діапазон років випуску."
          required
        />

        <FancySelect
          label={GARAGE_UI.form.configurationLabel}
          value={selectedConfiguration?.id ?? ""}
          onChange={(value) => onChange("configurationId", value)}
          options={(selectedGeneration?.configurations ?? []).map((configuration) => ({
            value: configuration.id,
            label: `${configuration.engine_label} / ${configuration.transmission_label}`,
            description: [configuration.drivetrain_label, configuration.fuel_type].filter(Boolean).join(" • ") || configuration.notes_uk || undefined
          }))}
          helper="Тут уже вибирається конкретний двигун і коробка передач."
          accent="amber"
          required
        />

        <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
          {GARAGE_UI.form.yearLabel}
          <input
            value={form.year}
            onChange={(event) => onChange("year", event.target.value)}
            className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.05)] px-4 py-3 text-white outline-none transition focus:border-[var(--accent-cyan)]"
            placeholder="Рік випуску"
            type="number"
            min={selectedGeneration?.year_from ?? 1980}
            max={selectedGeneration?.year_to ?? 2100}
            required
          />
        </label>

        {[
          { key: "vin", label: GARAGE_UI.form.vinLabel, type: "text", required: false },
          { key: "licensePlate", label: GARAGE_UI.form.plateLabel, type: "text", required: false },
          { key: "mileageKm", label: GARAGE_UI.form.mileageLabel, type: "number", required: true }
        ].map((field) => (
          <label key={field.key} className="flex flex-col gap-2 text-sm text-[var(--muted)]">
            {field.label}
            <input
              value={form[field.key as keyof GarageVehicleFormState]}
              onChange={(event) => onChange(field.key as keyof GarageVehicleFormState, event.target.value)}
              className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.05)] px-4 py-3 text-white outline-none transition focus:border-[var(--accent-cyan)]"
              placeholder={field.label}
              type={field.type}
              required={field.required}
            />
          </label>
        ))}
      </div>

      {selectedGeneration ? (
        <div className="rounded-[20px] border border-[rgba(76,207,255,0.18)] bg-[rgba(76,207,255,0.06)] p-4 text-sm leading-6 text-[var(--muted)]">
          <p className="font-semibold text-white">Обране покоління: {selectedGeneration.name}</p>
          <p className="mt-1">Доступні роки випуску: {selectedGeneration.year_from}-{selectedGeneration.year_to}.</p>
          {selectedConfiguration ? <p className="mt-1">Конфігурація: <span className="text-white">{selectedConfiguration.engine_label} / {selectedConfiguration.transmission_label}{selectedConfiguration.drivetrain_label ? ` / ${selectedConfiguration.drivetrain_label}` : ""}</span></p> : null}
          {selectedGeneration.notes_uk ? <p className="mt-1">{selectedGeneration.notes_uk}</p> : null}
          {selectedConfiguration?.notes_uk ? <p className="mt-1">{selectedConfiguration.notes_uk}</p> : null}
        </div>
      ) : null}

      <div className="rounded-[20px] border border-white/10 bg-black/15 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-white">{GARAGE_UI.form.imageTitle}</p>
            <p className="text-sm leading-6 text-[var(--muted)]">{GARAGE_UI.form.imageDescription}</p>
            <label className="inline-flex cursor-pointer items-center rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20">
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onImageSelection} />
              {isUploadingImage ? GARAGE_UI.form.uploadBusy : GARAGE_UI.form.uploadIdle}
            </label>
          </div>
          <div className="flex items-start gap-3">
            {form.imageUrl ? (
              <img src={form.imageUrl} alt="Превʼю автомобіля" className="h-24 w-32 rounded-[18px] border border-white/10 object-cover" />
            ) : (
              <div className="flex h-24 w-32 items-center justify-center rounded-[18px] border border-dashed border-white/10 bg-black/10 text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                Preview
              </div>
            )}
            {form.imageUrl ? (
              <button type="button" onClick={onRemoveImage} className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-[var(--muted)] transition hover:border-white/20 hover:text-white">
                {GARAGE_UI.form.removeImage}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <button disabled={isPending} className="mt-1 rounded-full bg-[linear-gradient(135deg,#4f84ff,#4ccfff)] px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60">
        {editing ? GARAGE_UI.form.saveUpdate : GARAGE_UI.form.saveCreate}
      </button>
    </form>
  );
}