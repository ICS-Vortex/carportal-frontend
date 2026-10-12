export const GARAGE_UI = {
  form: {
    makeLabel: "Марка",
    modelLabel: "Модель",
    generationLabel: "Покоління",
    configurationLabel: "Двигун і трансмісія",
    yearLabel: "Рік випуску",
    vinLabel: "VIN-код",
    plateLabel: "Державний номер",
    mileageLabel: "Поточний пробіг",
    imageTitle: "Фото автомобіля",
    imageDescription: "JPG, PNG або WEBP до 5 МБ. Файл зберігається локально в сервісі.",
    uploadIdle: "Завантажити файл",
    uploadBusy: "Завантажуємо...",
    removeImage: "Прибрати",
    saveCreate: "Зберегти автомобіль",
    saveUpdate: "Оновити автомобіль"
  },
  delete: {
    title: "Прибрати авто з гаражу?",
    description: "Автомобіль буде приховано з вашого гаража, але історичні записи сервісу збережуться в системі.",
    action: "Прибрати з гаражу"
  }
} as const;