/** Public marketing site (new tab from cabinet). Falls back to same origin. */
export const PUBLIC_WEBSITE_URL =
  process.env.NEXT_PUBLIC_WEBSITE_URL?.trim() ||
  process.env.NEXT_PUBLIC_APP_BASE_URL?.trim() ||
  "";

export const APP_ROUTES = {
  home: "/",
  auth: "/auth",
  dashboard: "/dashboard",
  garage: "/garage",
  maintenance: "/maintenance",
  serviceLogs: "/service-logs",
  reminders: "/reminders",
  profile: "/profile"
} as const;

export const API_ROUTES = {
  auth: {
    csrf: "/v1/auth/csrf",
    me: "/v1/auth/me",
    register: "/v1/auth/register",
    login: "/v1/auth/login",
    google: "/v1/auth/google",
    profile: "/v1/auth/profile",
    avatarUpload: "/v1/auth/avatar",
    preferences: "/v1/auth/preferences",
    changePassword: "/v1/auth/change-password",
    account: "/v1/auth/account",
    logout: "/v1/auth/logout"
  },
  vehicles: {
    catalog: "/v1/vehicle-catalog",
    list: "/v1/vehicles",
    imageUpload: "/v1/vehicle-images",
    detail: (vehicleId: string) => `/v1/vehicles/${vehicleId}`,
    serviceLogs: (vehicleId: string) => `/v1/vehicles/${vehicleId}/service-logs`,
    serviceLogDetail: (vehicleId: string, serviceLogId: string) => `/v1/vehicles/${vehicleId}/service-logs/${serviceLogId}`,
    maintenancePlan: (vehicleId: string) => `/v1/vehicles/${vehicleId}/maintenance-plan`,
    maintenancePlanRequest: (vehicleId: string) => `/v1/vehicles/${vehicleId}/maintenance-plan/request`,
    maintenancePlanAssignTemplate: (vehicleId: string) => `/v1/vehicles/${vehicleId}/maintenance-plan/assign-template`,
    maintenancePlanItemStatus: (vehicleId: string, planItemId: string) => `/v1/vehicles/${vehicleId}/maintenance-plan/items/${planItemId}/status`,
    maintenancePlanItemComplete: (vehicleId: string, planItemId: string) => `/v1/vehicles/${vehicleId}/maintenance-plan/items/${planItemId}/complete`
  },
  catalog: {
    list: "/v1/catalog",
    reminders: "/v1/reminders",
    serviceStations: "/v1/service-stations"
  }
} as const;
