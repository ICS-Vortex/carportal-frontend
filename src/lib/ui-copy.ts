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
    imageDescription: "JPG, PNG або WEBP до 5 МБ.",
    uploadIdle: "Завантажити файл",
    uploadBusy: "Завантажуємо...",
    removeImage: "Прибрати",
    saveCreate: "Зберегти автомобіль",
    saveUpdate: "Оновити автомобіль"
  },
  delete: {
    title: "Прибрати авто з гаражу?",
    description: "Автомобіль зникне з гаража, але журнал сервісу за цим авто залишиться у вашому обліку.",
    action: "Прибрати з гаражу"
  }
} as const;