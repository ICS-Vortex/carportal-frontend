const FUEL_LABELS: Record<string, string> = {
  gas: "Газ",
  benzin: "Бензин",
  diezel: "Дизель",
  hybrid: "Гібрид"
};

export function formatFuelType(value: string | null | undefined): string {
  if (!value) {
    return "Не вказано";
  }

  return FUEL_LABELS[value] ?? value;
}

export function formatLastServiceVisit(serviceDate: string | null | undefined, mileageKm: number | null | undefined): string {
  if (!serviceDate) {
    return "Ще не було";
  }

  const formattedDate = new Date(serviceDate).toLocaleDateString("uk-UA");

  if (mileageKm === null || mileageKm === undefined) {
    return formattedDate;
  }

  return `${formattedDate} · ${mileageKm.toLocaleString("uk-UA")} км`;
}

export function formatGarageUpdatedAt(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}
