"use client";

import { useEffect, useState, useTransition } from "react";

import { GarageVehicleCard } from "@/components/garage/garage-vehicle-card";
import { GarageVehicleForm, type GarageVehicleFormState } from "@/components/garage/garage-vehicle-form";
import { EmptyState } from "@/components/shared/empty-state";
import { AppModal } from "@/components/shared/app-modal";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { useToast } from "@/components/shared/toast-provider";
import { createVehicle, deleteVehicle, getApiErrorMessage, getVehicleCatalog, listVehicles, updateVehicle, uploadVehicleImage } from "@/lib/api";
import { GARAGE_UI } from "@/lib/ui-copy";
import type { Vehicle, VehicleCatalogResponse } from "@/lib/types";

function buildInitialForm(catalog: VehicleCatalogResponse | null): GarageVehicleFormState {
  const brand = catalog?.brands[0];
  const model = brand?.models[0];
  const generation = model?.generations[0];
  const configuration = generation?.configurations[0];

  return {
    brandId: brand?.id ?? "",
    modelId: model?.id ?? "",
    generationId: generation?.id ?? "",
    configurationId: configuration?.id ?? "",
    year: generation ? String(generation.year_to) : "",
    vin: "",
    licensePlate: "",
    imageUrl: "",
    mileageKm: ""
  };
}

 function findCatalogSelection(catalog: VehicleCatalogResponse | null, configurationId: string) {
  for (const brand of catalog?.brands ?? []) {
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

function clampYear(year: string, min: number, max: number): string {
  const numericYear = Number(year);

  if (!Number.isFinite(numericYear)) {
    return String(max);
  }

  return String(Math.min(Math.max(numericYear, min), max));
}

export function GarageClient() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [catalog, setCatalog] = useState<VehicleCatalogResponse | null>(null);
  const [form, setForm] = useState<GarageVehicleFormState>(buildInitialForm(null));
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<Vehicle | null>(null);
  const [status, setStatus] = useState("Завантажуємо гараж...");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  function resetForm() {
    setForm(buildInitialForm(catalog));
    setEditingVehicleId(null);
    setModalOpen(false);
  }

  async function refresh() {
    try {
      const [items, nextCatalog] = await Promise.all([listVehicles(), getVehicleCatalog()]);
      setVehicles(items);
      setCatalog(nextCatalog);
      setForm((current) => current.configurationId ? current : buildInitialForm(nextCatalog));
      setStatus(items.length > 0 ? "Гараж оновлено." : "Автомобілів поки немає.");
    } catch (error) {
      const message = getApiErrorMessage(error);
      setStatus(message);
      toast.error(message);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(editingVehicleId ? "Оновлюємо автомобіль..." : "Зберігаємо автомобіль...");

    startTransition(() => {
      const payload = {
        configurationId: form.configurationId,
        year: Number(form.year),
        vin: form.vin || null,
        licensePlate: form.licensePlate || null,
        imageUrl: form.imageUrl || null,
        mileageKm: Number(form.mileageKm)
      };

      void (editingVehicleId ? updateVehicle(editingVehicleId, payload) : createVehicle(payload))
        .then(async () => {
          resetForm();
          await refresh();
          toast.success(editingVehicleId ? "Картку автомобіля оновлено." : "Автомобіль додано до гаража.");
        })
        .catch((error) => {
          const message = getApiErrorMessage(error);
          setStatus(message);
          toast.error(message);
        });
    });
  }

  function startEditing(vehicle: Vehicle) {
    const selection = findCatalogSelection(catalog, vehicle.configuration_id);

    if (!selection) {
      const message = "Не вдалося знайти це авто в поточному довіднику.";
      setStatus(message);
      toast.error(message);
      return;
    }

    setEditingVehicleId(vehicle.id);
    setForm({
      brandId: selection.brand.id,
      modelId: selection.model.id,
      generationId: selection.generation.id,
      configurationId: selection.configuration.id,
      year: String(vehicle.year),
      vin: vehicle.vin ?? "",
      licensePlate: vehicle.license_plate ?? "",
      imageUrl: vehicle.image_url ?? "",
      mileageKm: String(vehicle.mileage_km)
    });
    setModalOpen(true);
    setStatus("Редагуємо картку автомобіля.");
  }

  function openCreateModal() {
    setForm(buildInitialForm(catalog));
    setEditingVehicleId(null);
    setModalOpen(true);
  }

  function updateFormValue(key: keyof GarageVehicleFormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleBrandChange(brandId: string) {
    const brand = catalog?.brands.find((item) => item.id === brandId);
    const model = brand?.models[0];
    const generation = model?.generations[0];
    const configuration = generation?.configurations[0];

    setForm((current) => ({
      ...current,
      brandId,
      modelId: model?.id ?? "",
      generationId: generation?.id ?? "",
      configurationId: configuration?.id ?? "",
      year: generation ? String(generation.year_to) : current.year
    }));
  }

  function handleModelChange(modelId: string) {
    const brand = catalog?.brands.find((item) => item.id === form.brandId);
    const model = brand?.models.find((item) => item.id === modelId);
    const generation = model?.generations[0];
    const configuration = generation?.configurations[0];

    setForm((current) => ({
      ...current,
      modelId,
      generationId: generation?.id ?? "",
      configurationId: configuration?.id ?? "",
      year: generation ? String(generation.year_to) : current.year
    }));
  }

  function handleGenerationChange(generationId: string) {
    const selection = catalog?.brands
      .flatMap((brand) => brand.models.map((model) => ({ brand, model })))
      .flatMap(({ brand, model }) => model.generations.map((generation) => ({ brand, model, generation })))
      .find((entry) => entry.generation.id === generationId);

    if (!selection) {
      return;
    }

    setForm((current) => ({
      ...current,
      brandId: selection.brand.id,
      modelId: selection.model.id,
      generationId,
      configurationId: selection.generation.configurations[0]?.id ?? "",
      year: clampYear(current.year, selection.generation.year_from, selection.generation.year_to)
    }));
  }

  function requestDelete(vehicle: Vehicle) {
    setDeleteCandidate(vehicle);
  }

  function confirmDelete() {
    if (!deleteCandidate) {
      return;
    }

    setStatus("Прибираємо автомобіль з гаража...");
    startTransition(() => {
      void deleteVehicle(deleteCandidate.id)
        .then(async () => {
          setDeleteCandidate(null);
          if (editingVehicleId === deleteCandidate.id) {
            resetForm();
          }
          await refresh();
          toast.success("Автомобіль прибрано з гаража.");
        })
        .catch((error) => {
          const message = getApiErrorMessage(error);
          setStatus(message);
          toast.error(message);
          setDeleteCandidate(null);
        });
    });
  }

  function handleImageSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      const message = "Підтримуються лише JPG, PNG та WEBP.";
      setStatus(message);
      toast.error(message);
      return;
    }

    const reader = new FileReader();
    setIsUploadingImage(true);
    setStatus("Завантажуємо зображення автомобіля...");

    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        setIsUploadingImage(false);
        const message = "Не вдалося прочитати файл.";
        setStatus(message);
        toast.error(message);
        return;
      }

      void uploadVehicleImage({ dataUrl: result })
        .then((payload) => {
          setForm((current) => ({ ...current, imageUrl: payload.url }));
          setStatus("Зображення завантажено.");
          toast.success("Зображення автомобіля завантажено.");
        })
        .catch((error) => {
          const message = getApiErrorMessage(error);
          setStatus(message);
          toast.error(message);
        })
        .finally(() => {
          setIsUploadingImage(false);
        });
    };

    reader.onerror = () => {
      setIsUploadingImage(false);
      const message = "Не вдалося прочитати файл.";
      setStatus(message);
      toast.error(message);
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-white/8 bg-white/4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Автомобілі у вашому гаражі</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">Авто додається з підготовленого довідника, а ваша картка зберігає тільки персональні дані про конкретну машину.</p>
        </div>
        <button type="button" onClick={openCreateModal} disabled={!catalog?.brands.length} className="rounded-full bg-[linear-gradient(135deg,#4f84ff,#4ccfff)] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-60">
          Новий автомобіль
        </button>
      </div>

      <section className="space-y-4">
        {vehicles.length === 0 ? (
          <EmptyState title="Гараж порожній" description="Після першого збереження тут зʼявиться активний автомобіль та коротка картка з VIN і пробігом." />
        ) : (
          vehicles.map((vehicle) => <GarageVehicleCard key={vehicle.id} vehicle={vehicle} onEdit={startEditing} onDelete={requestDelete} />)
        )}
      </section>

      <AppModal
        open={modalOpen}
        title={editingVehicleId ? "Редагування автомобіля" : "Новий автомобіль"}
        description="Оберіть авто з довідника, додайте фото за бажанням і збережіть дані саме про свою машину."
        onClose={resetForm}
        maxWidthClassName="max-w-3xl"
      >
        {catalog ? (
          <GarageVehicleForm
            catalog={catalog}
            form={form}
            isPending={isPending}
            isUploadingImage={isUploadingImage}
            editing={Boolean(editingVehicleId)}
            onSubmit={handleSubmit}
            onChange={updateFormValue}
            onBrandChange={handleBrandChange}
            onModelChange={handleModelChange}
            onGenerationChange={handleGenerationChange}
            onImageSelection={handleImageSelection}
            onRemoveImage={() => updateFormValue("imageUrl", "")}
          />
        ) : null}
      </AppModal>

      <ConfirmModal
        open={Boolean(deleteCandidate)}
        title={GARAGE_UI.delete.title}
        description={deleteCandidate
          ? `${GARAGE_UI.delete.description} Обраний автомобіль: ${deleteCandidate.make} ${deleteCandidate.model}, ${deleteCandidate.year}.`
          : ""}
        confirmLabel={GARAGE_UI.delete.action}
        tone="danger"
        busy={isPending}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={confirmDelete}
      />

      <p className="text-sm leading-6 text-[var(--muted)]">{status}</p>
    </div>
  );
}
