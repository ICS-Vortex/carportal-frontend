import type { AuthUser, CatalogResponse, MaintenancePlanResponse, MaintenanceRequestOptions, Reminder, ServiceLog, ServiceStation, Vehicle, VehicleCatalogResponse } from "@/lib/types";
import { API_ROUTES } from "@/lib/routes";

function apiBaseUrl(): string {
  // The browser talks to the same host. Nginx forwards /v1 to the API,
  // so carmain.local and carmain.localhost.com both avoid a cross-origin call.
  if (typeof window !== "undefined") {
    return "";
  }

  return process.env.INTERNAL_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://backend:4000";
}
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

type ApiSuccessEnvelope<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

type ApiErrorEnvelope = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
  code?: string;
  message?: string;
  details?: unknown;
};

class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let csrfTokenPromise: Promise<string> | null = null;
let sessionRequest: Promise<AuthUser | null> | null = null;
let cachedSession: AuthUser | null | undefined;

function resetCsrfToken(): void {
  csrfTokenPromise = null;
}

function resetSessionCache(): void {
  sessionRequest = null;
  cachedSession = undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractErrorPayload(payload: unknown): { message: string; code?: string; details?: unknown } {
  if (isRecord(payload) && "error" in payload && isRecord(payload.error)) {
    return {
      message: typeof payload.error.message === "string" ? payload.error.message : "Не вдалося виконати дію. Спробуйте ще раз.",
      code: typeof payload.error.code === "string" ? payload.error.code : undefined,
      details: payload.error.details
    };
  }

  if (isRecord(payload)) {
    return {
      message: typeof payload.message === "string" ? payload.message : "Не вдалося виконати дію. Спробуйте ще раз.",
      code: typeof payload.code === "string" ? payload.code : undefined,
      details: payload.details
    };
  }

  return { message: "Не вдалося виконати дію. Спробуйте ще раз." };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const payload = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const errorPayload = extractErrorPayload(payload);
    throw new ApiError(response.status, errorPayload.message, errorPayload.code, errorPayload.details);
  }

  if (isRecord(payload) && "data" in payload) {
    return (payload as ApiSuccessEnvelope<T>).data;
  }

  return payload as T;
}

export async function ensureCsrfToken(): Promise<string> {
  if (!csrfTokenPromise) {
    csrfTokenPromise = fetch(`${apiBaseUrl()}${API_ROUTES.auth.csrf}`, {
      credentials: "include"
    })
      .then((response) => parseResponse<{ csrfToken: string }>(response))
      .then((payload) => payload.csrfToken)
      .catch((error) => {
        resetCsrfToken();
        throw error;
      });
  }

  return csrfTokenPromise;
}

function withStationQuery(path: string, options?: MaintenanceRequestOptions): string {
  if (!options?.stationId) {
    return path;
  }

  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}stationId=${encodeURIComponent(options.stationId)}`;
}

async function apiRequest<T>(path: string, init?: RequestInit, needsCsrf = false, csrfRetry = true): Promise<T> {
  const headers = new Headers(init?.headers);

  if (needsCsrf) {
    headers.set("X-CSRF-Token", await ensureCsrfToken());
  }

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store"
  });

  if (response.status === 401) {
    throw new ApiError(401, "Потрібно увійти в кабінет.");
  }

  if (needsCsrf && response.status === 403) {
    const text = await response.text();
    const payload = text ? (JSON.parse(text) as unknown) : null;
    const errorPayload = extractErrorPayload(payload);
    const message = errorPayload.message;

    if (csrfRetry && errorPayload.code === "invalid_csrf_token") {
      resetCsrfToken();
      return apiRequest<T>(path, init, needsCsrf, false);
    }

    throw new ApiError(403, message, errorPayload.code, errorPayload.details);
  }

  return parseResponse<T>(response);
}

async function fetchSessionUser(): Promise<AuthUser | null> {
  try {
    const payload = await apiRequest<{ user: AuthUser | null }>(API_ROUTES.auth.me);
    const user = payload.user ?? null;
    cachedSession = user;
    return user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      cachedSession = null;
      return null;
    }

    throw error;
  }
}

export async function getSession(): Promise<AuthUser | null> {
  if (cachedSession !== undefined) {
    return cachedSession;
  }

  if (!sessionRequest) {
    sessionRequest = fetchSessionUser().finally(() => {
      sessionRequest = null;
    });
  }

  return sessionRequest;
}

function rememberSessionUser(user: AuthUser): void {
  cachedSession = user;
}

export async function registerWithEmail(input: { email: string; password: string; fullName: string }): Promise<AuthUser> {
  const payload = await apiRequest<{ user: AuthUser }>(API_ROUTES.auth.register, {
    method: "POST",
    body: JSON.stringify(input)
  }, true);
  resetSessionCache();
  rememberSessionUser(payload.user);
  return payload.user;
}

export async function loginWithEmail(input: { email: string; password: string }): Promise<AuthUser> {
  const payload = await apiRequest<{ user: AuthUser }>(API_ROUTES.auth.login, {
    method: "POST",
    body: JSON.stringify(input)
  }, true);
  resetSessionCache();
  rememberSessionUser(payload.user);
  return payload.user;
}

export async function loginWithGoogle(idToken: string): Promise<AuthUser> {
  const payload = await apiRequest<{ user: AuthUser }>(API_ROUTES.auth.google, {
    method: "POST",
    body: JSON.stringify({ idToken })
  }, true);
  resetSessionCache();
  rememberSessionUser(payload.user);
  return payload.user;
}

export async function updateCabinetPreferences(input: { preferredServiceStationId: string | null }): Promise<AuthUser> {
  const payload = await apiRequest<{ user: AuthUser }>(API_ROUTES.auth.preferences, {
    method: "PATCH",
    body: JSON.stringify(input)
  }, true);

  rememberSessionUser(payload.user);
  return payload.user;
}

export async function updateProfile(input: { email: string; fullName: string; avatarUrl?: string | null }): Promise<AuthUser> {
  const payload = await apiRequest<{ user: AuthUser }>(API_ROUTES.auth.profile, {
    method: "PATCH",
    body: JSON.stringify(input)
  }, true);

  rememberSessionUser(payload.user);
  return payload.user;
}

export async function uploadAvatarImage(input: { dataUrl: string }): Promise<AuthUser> {
  const payload = await apiRequest<{ user: AuthUser; url: string }>(API_ROUTES.auth.avatarUpload, {
    method: "POST",
    body: JSON.stringify(input)
  }, true);

  rememberSessionUser(payload.user);
  return payload.user;
}

export async function changePassword(input: { currentPassword?: string; newPassword: string }): Promise<void> {
  await apiRequest(API_ROUTES.auth.changePassword, {
    method: "POST",
    body: JSON.stringify(input)
  }, true);
}

export async function deleteAccount(input: { confirmationText: string; password?: string }): Promise<void> {
  await apiRequest(API_ROUTES.auth.account, {
    method: "DELETE",
    body: JSON.stringify(input)
  }, true);
  resetSessionCache();
}

export async function logout(): Promise<void> {
  await apiRequest(API_ROUTES.auth.logout, { method: "POST" }, true);
  resetCsrfToken();
  resetSessionCache();
}

export async function listVehicles(): Promise<Vehicle[]> {
  const payload = await apiRequest<{ items: Vehicle[] }>(API_ROUTES.vehicles.list);
  return payload.items;
}

export async function getVehicleCatalog(): Promise<VehicleCatalogResponse> {
  return apiRequest<VehicleCatalogResponse>(API_ROUTES.vehicles.catalog);
}

export async function createVehicle(input: {
  configurationId: string;
  year: number;
  vin?: string | null;
  licensePlate?: string | null;
  imageUrl?: string | null;
  mileageKm: number;
}): Promise<Vehicle> {
  const payload = await apiRequest<{ item: Vehicle }>(API_ROUTES.vehicles.list, {
    method: "POST",
    body: JSON.stringify(input)
  }, true);

  return payload.item;
}

export async function updateVehicle(vehicleId: string, input: {
  configurationId: string;
  year: number;
  vin?: string | null;
  licensePlate?: string | null;
  imageUrl?: string | null;
  mileageKm: number;
}): Promise<Vehicle> {
  const payload = await apiRequest<{ item: Vehicle }>(API_ROUTES.vehicles.detail(vehicleId), {
    method: "PATCH",
    body: JSON.stringify(input)
  }, true);

  return payload.item;
}

export async function uploadVehicleImage(input: { dataUrl: string }): Promise<{ url: string }> {
  return apiRequest<{ url: string }>(API_ROUTES.vehicles.imageUpload, {
    method: "POST",
    body: JSON.stringify(input)
  }, true);
}

export async function deleteVehicle(vehicleId: string): Promise<void> {
  await apiRequest(API_ROUTES.vehicles.detail(vehicleId), {
    method: "DELETE"
  }, true);
}

export async function listServiceLogs(vehicleId: string): Promise<ServiceLog[]> {
  const payload = await apiRequest<{ items: ServiceLog[] }>(API_ROUTES.vehicles.serviceLogs(vehicleId));
  return payload.items;
}

export async function createServiceLog(vehicleId: string, input: {
  serviceDate: string;
  mileageKm: number;
  serviceStation?: string | null;
  serviceStationId?: string | null;
  notesUk?: string | null;
  items: Array<{ procedureId: string; notesUk?: string | null }>;
}): Promise<void> {
  await apiRequest(API_ROUTES.vehicles.serviceLogs(vehicleId), {
    method: "POST",
    body: JSON.stringify(input)
  }, true);
}

export async function deleteServiceLog(vehicleId: string, serviceLogId: string): Promise<void> {
  await apiRequest(API_ROUTES.vehicles.serviceLogDetail(vehicleId, serviceLogId), {
    method: "DELETE"
  }, true);
}

export async function getCatalog(): Promise<CatalogResponse> {
  return apiRequest<CatalogResponse>(API_ROUTES.catalog.list);
}

export async function listReminders(): Promise<Reminder[]> {
  const payload = await apiRequest<{ items: Reminder[] }>(API_ROUTES.catalog.reminders);
  return payload.items;
}

export async function listServiceStations(): Promise<ServiceStation[]> {
  const payload = await apiRequest<{ items: ServiceStation[] }>(API_ROUTES.catalog.serviceStations);
  return payload.items;
}

export async function getMaintenancePlan(vehicleId: string, options?: MaintenanceRequestOptions): Promise<MaintenancePlanResponse> {
  return apiRequest<MaintenancePlanResponse>(withStationQuery(API_ROUTES.vehicles.maintenancePlan(vehicleId), options));
}

export async function requestMissingMaintenancePlan(
  vehicleId: string,
  input?: { noteUk?: string | null },
  options?: MaintenanceRequestOptions
): Promise<MaintenancePlanResponse> {
  return apiRequest<MaintenancePlanResponse>(withStationQuery(API_ROUTES.vehicles.maintenancePlanRequest(vehicleId), options), {
    method: "POST",
    body: JSON.stringify({ noteUk: input?.noteUk ?? null })
  }, true);
}

export async function assignMaintenanceTemplate(
  vehicleId: string,
  templateId: string,
  options?: MaintenanceRequestOptions
): Promise<MaintenancePlanResponse> {
  return apiRequest<MaintenancePlanResponse>(withStationQuery(API_ROUTES.vehicles.maintenancePlanAssignTemplate(vehicleId), options), {
    method: "POST",
    body: JSON.stringify({ templateId })
  }, true);
}

export async function updateMaintenanceItemStatus(
  vehicleId: string,
  planItemId: string,
  status: "pending" | "skipped",
  options?: MaintenanceRequestOptions
): Promise<MaintenancePlanResponse> {
  return apiRequest<MaintenancePlanResponse>(withStationQuery(API_ROUTES.vehicles.maintenancePlanItemStatus(vehicleId, planItemId), options), {
    method: "PATCH",
    body: JSON.stringify({ status })
  }, true);
}

export async function completeMaintenanceItem(
  vehicleId: string,
  planItemId: string,
  input: {
    serviceDate: string;
    mileageKm: number;
    serviceStation?: string | null;
    serviceStationId?: string | null;
    notesUk?: string | null;
  },
  options?: MaintenanceRequestOptions
): Promise<MaintenancePlanResponse> {
  return apiRequest<MaintenancePlanResponse>(withStationQuery(API_ROUTES.vehicles.maintenancePlanItemComplete(vehicleId, planItemId), options), {
    method: "POST",
    body: JSON.stringify(input)
  }, true);
}

function formatValidationIssue(issue: Record<string, unknown>): string {
  const code = typeof issue.code === "string" ? issue.code : "";
  const path = Array.isArray(issue.path) && typeof issue.path[0] === "string" ? issue.path[0] : "";
  const maximum = typeof issue.maximum === "number" ? issue.maximum : undefined;
  const minimum = typeof issue.minimum === "number" ? issue.minimum : undefined;

  if (code === "too_big" && maximum !== undefined) {
    if (path === "vin") {
      return `VIN містить щонайбільше ${maximum} символів.`;
    }

    if (path === "licensePlate") {
      return `Номер містить щонайбільше ${maximum} символів.`;
    }

    return `Значення не може перевищувати ${maximum}.`;
  }

  if (code === "too_small" && minimum !== undefined) {
    if (path === "vin") {
      return `VIN має містити щонайменше ${minimum} символів.`;
    }

    return `Значення має бути не менше ${minimum}.`;
  }

  if (code === "invalid_string" || code === "invalid_format" || code === "invalid_type") {
    return "Некоректне значення.";
  }

  if (typeof issue.message === "string" && !/^Too (big|small):/i.test(issue.message)) {
    return issue.message;
  }

  return "Некоректне значення.";
}

export function getValidationFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || error.code !== "validation_error" || !Array.isArray(error.details)) {
    return {};
  }

  const fieldErrors: Record<string, string> = {};

  for (const item of error.details) {
    if (!isRecord(item)) {
      continue;
    }

    const field = Array.isArray(item.path) && typeof item.path[0] === "string" ? item.path[0] : null;

    if (!field || fieldErrors[field]) {
      continue;
    }

    fieldErrors[field] = formatValidationIssue(item);
  }

  return fieldErrors;
}

export function getApiErrorMessage(error: unknown): string {
  const fieldErrors = getValidationFieldErrors(error);

  if (Object.keys(fieldErrors).length > 0) {
    return Object.values(fieldErrors)[0] ?? "Перевірте поля форми.";
  }

  if (error instanceof Error) {
    if (error.message === "Failed to fetch") {
      return "Не вдалося зʼєднатися із сервером. Оновіть сторінку або спробуйте трохи пізніше.";
    }

    if (error.message === "Load failed") {
      return "Сервер тимчасово недоступний. Спробуйте ще раз за мить.";
    }

    return error.message;
  }

  return "Сталася невідома помилка.";
}
