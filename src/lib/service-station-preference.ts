const STORAGE_KEY = "carmain.preferredServiceStationId";

export function readPreferredServiceStationId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writePreferredServiceStationId(stationId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (stationId) {
      window.localStorage.setItem(STORAGE_KEY, stationId);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore quota / private mode
  }
}
