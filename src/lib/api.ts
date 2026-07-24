import type { AdminCatalogResponse, AdminManagedUser, AdminOverviewResponse, AuthUser, CatalogResponse, LandingContentResponse, MaintenancePlanResponse, Reminder, ServiceLog, Vehicle, VehicleCatalogResponse } from "@/lib/types";
import { API_ROUTES } from "@/lib/routes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://api.carmain.localhost.com";
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

function resetCsrfToken(): void {
  csrfTokenPromise = null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractErrorPayload(payload: unknown): { message: string; code?: string; details?: unknown } {
  if (isRecord(payload) && "error" in payload && isRecord(payload.error)) {
    return {
      message: typeof payload.error.message === "string" ? payload.error.message : "Помилка запиту до API.",
      code: typeof payload.error.code === "string" ? payload.error.code : undefined,
      details: payload.error.details
    };
  }

  if (isRecord(payload)) {
    return {
      message: typeof payload.message === "string" ? payload.message : "Помилка запиту до API.",
      code: typeof payload.code === "string" ? payload.code : undefined,
      details: payload.details
    };
  }

  return { message: "Помилка запиту до API." };
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
    csrfTokenPromise = fetch(`${API_BASE_URL}${API_ROUTES.auth.csrf}`, {
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

async function apiRequest<T>(path: string, init?: RequestInit, needsCsrf = false, csrfRetry = true): Promise<T> {
  const headers = new Headers(init?.headers);

  if (needsCsrf) {
    headers.set("X-CSRF-Token", await ensureCsrfToken());
  }

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
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

export async function getSession(): Promise<AuthUser | null> {
  try {
    const payload = await apiRequest<{ user: AuthUser }>(API_ROUTES.auth.me);
    return payload.user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
}

export async function registerWithEmail(input: { email: string; password: string; fullName: string }): Promise<void> {
  await apiRequest(API_ROUTES.auth.register, {
    method: "POST",
    body: JSON.stringify(input)
  }, true);
}

export async function loginWithEmail(input: { email: string; password: string }): Promise<void> {
  await apiRequest(API_ROUTES.auth.login, {
    method: "POST",
    body: JSON.stringify(input)
  }, true);
}

export async function loginWithGoogle(idToken: string): Promise<void> {
  await apiRequest(API_ROUTES.auth.google, {
    method: "POST",
    body: JSON.stringify({ idToken })
  }, true);
}

export async function updateProfile(input: { email: string; fullName: string; avatarUrl?: string | null }): Promise<AuthUser> {
  const payload = await apiRequest<{ user: AuthUser }>(API_ROUTES.auth.profile, {
    method: "PATCH",
    body: JSON.stringify(input)
  }, true);

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
}

export async function logout(): Promise<void> {
  await apiRequest(API_ROUTES.auth.logout, { method: "POST" }, true);
  resetCsrfToken();
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

export async function getMaintenancePlan(vehicleId: string): Promise<MaintenancePlanResponse> {
  return apiRequest<MaintenancePlanResponse>(API_ROUTES.vehicles.maintenancePlan(vehicleId));
}

export async function requestMissingMaintenancePlan(vehicleId: string, input?: { noteUk?: string | null }): Promise<MaintenancePlanResponse> {
  return apiRequest<MaintenancePlanResponse>(API_ROUTES.vehicles.maintenancePlanRequest(vehicleId), {
    method: "POST",
    body: JSON.stringify({ noteUk: input?.noteUk ?? null })
  }, true);
}

export async function assignMaintenanceTemplate(vehicleId: string, templateId: string): Promise<MaintenancePlanResponse> {
  return apiRequest<MaintenancePlanResponse>(API_ROUTES.vehicles.maintenancePlanAssignTemplate(vehicleId), {
    method: "POST",
    body: JSON.stringify({ templateId })
  }, true);
}

export async function updateMaintenanceItemStatus(vehicleId: string, planItemId: string, status: "pending" | "skipped"): Promise<MaintenancePlanResponse> {
  return apiRequest<MaintenancePlanResponse>(API_ROUTES.vehicles.maintenancePlanItemStatus(vehicleId, planItemId), {
    method: "PATCH",
    body: JSON.stringify({ status })
  }, true);
}

export async function completeMaintenanceItem(vehicleId: string, planItemId: string, input: {
  serviceDate: string;
  mileageKm: number;
  serviceStation?: string | null;
  notesUk?: string | null;
}): Promise<MaintenancePlanResponse> {
  return apiRequest<MaintenancePlanResponse>(API_ROUTES.vehicles.maintenancePlanItemComplete(vehicleId, planItemId), {
    method: "POST",
    body: JSON.stringify(input)
  }, true);
}

export async function getAdminCatalog(): Promise<AdminCatalogResponse> {
  return apiRequest<AdminCatalogResponse>(API_ROUTES.admin.catalog);
}

export async function getAdminOverview(): Promise<AdminOverviewResponse> {
  return apiRequest<AdminOverviewResponse>(API_ROUTES.admin.overview);
}

export async function resolveAdminMissingPlanRequest(requestId: string): Promise<void> {
  await apiRequest(API_ROUTES.admin.missingPlanRequestDetail(requestId), {
    method: "PATCH",
    body: JSON.stringify({})
  }, true);
}

export async function getAdminUsers(): Promise<AdminManagedUser[]> {
  const payload = await apiRequest<{ items: AdminManagedUser[] }>(API_ROUTES.admin.users);
  return payload.items;
}

export async function updateAdminUser(userId: string, input: {
  role?: "user" | "admin";
  isBlocked?: boolean;
  deleted?: boolean;
}): Promise<void> {
  await apiRequest(API_ROUTES.admin.userDetail(userId), {
    method: "PATCH",
    body: JSON.stringify(input)
  }, true);
}

export async function getLandingContent(): Promise<LandingContentResponse> {
  return apiRequest<LandingContentResponse>(API_ROUTES.public.landing);
}

export async function createAdminProcedure(input: {
  code: string;
  titleUk: string;
  descriptionUk?: string | null;
  defaultIntervalKm?: number | null;
  defaultIntervalMonths?: number | null;
  category: string;
}): Promise<void> {
  await apiRequest(API_ROUTES.admin.procedures, {
    method: "POST",
    body: JSON.stringify(input)
  }, true);
}

export async function updateAdminProcedure(procedureId: string, input: {
  code: string;
  titleUk: string;
  descriptionUk?: string | null;
  defaultIntervalKm?: number | null;
  defaultIntervalMonths?: number | null;
  category: string;
}): Promise<void> {
  await apiRequest(API_ROUTES.admin.procedureDetail(procedureId), {
    method: "PATCH",
    body: JSON.stringify(input)
  }, true);
}

export async function deleteAdminProcedure(procedureId: string): Promise<void> {
  await apiRequest(API_ROUTES.admin.procedureDetail(procedureId), {
    method: "DELETE"
  }, true);
}

export async function createAdminTemplate(input: {
  nameUk: string;
  configurationId: string;
  notesUk?: string | null;
}): Promise<void> {
  await apiRequest(API_ROUTES.admin.templates, {
    method: "POST",
    body: JSON.stringify(input)
  }, true);
}

export async function updateAdminTemplate(templateId: string, input: {
  nameUk: string;
  configurationId: string;
  notesUk?: string | null;
}): Promise<void> {
  await apiRequest(API_ROUTES.admin.templateDetail(templateId), {
    method: "PATCH",
    body: JSON.stringify(input)
  }, true);
}

export async function deleteAdminTemplate(templateId: string): Promise<void> {
  await apiRequest(API_ROUTES.admin.templateDetail(templateId), {
    method: "DELETE"
  }, true);
}

export async function createAdminTemplateItem(input: {
  templateId: string;
  procedureId: string;
  intervalKm?: number | null;
  intervalMonths?: number | null;
  notesUk?: string | null;
}): Promise<void> {
  await apiRequest(API_ROUTES.admin.templateItems, {
    method: "POST",
    body: JSON.stringify(input)
  }, true);
}

export async function updateAdminTemplateItem(scheduleItemId: string, input: {
  templateId: string;
  procedureId: string;
  intervalKm?: number | null;
  intervalMonths?: number | null;
  notesUk?: string | null;
}): Promise<void> {
  await apiRequest(API_ROUTES.admin.templateItemDetail(scheduleItemId), {
    method: "PATCH",
    body: JSON.stringify(input)
  }, true);
}

export async function deleteAdminTemplateItem(scheduleItemId: string): Promise<void> {
  await apiRequest(API_ROUTES.admin.templateItemDetail(scheduleItemId), {
    method: "DELETE"
  }, true);
}


export function getApiErrorMessage(error: unknown): string {
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
