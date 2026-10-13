const KYIV_TIME_ZONE = "Europe/Kyiv";

export function kyivTodayDateString(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: KYIV_TIME_ZONE }).format(new Date());
}
