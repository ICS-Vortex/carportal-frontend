export const APP_ROUTES = {
  home: "/",
  auth: "/auth",
  dashboard: "/dashboard",
  garage: "/garage",
  maintenance: "/maintenance",
  serviceLogs: "/service-logs",
  reminders: "/reminders",
  profile: "/profile",
  profilePassword: "/profile/password",
  profileDelete: "/profile/delete",
  admin: "/admin",
  adminOverview: "/admin/overview",
  adminCatalog: "/admin/cms",
  adminUsers: "/admin/users"
} as const;

export const API_ROUTES = {
  auth: {
    csrf: "/v1/auth/csrf",
    me: "/v1/auth/me",
    register: "/v1/auth/register",
    login: "/v1/auth/login",
    google: "/v1/auth/google",
    profile: "/v1/auth/profile",
    changePassword: "/v1/auth/change-password",
    account: "/v1/auth/account",
    logout: "/v1/auth/logout"
  },
  public: {
    landing: "/v1/public/landing"
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
    reminders: "/v1/reminders"
  },
  admin: {
    catalog: "/v1/admin/catalog",
    overview: "/v1/admin/overview",
    missingPlanRequestDetail: (requestId: string) => `/v1/admin/missing-plan-requests/${requestId}`,
    users: "/v1/admin/users",
    userDetail: (userId: string) => `/v1/admin/users/${userId}`,
    procedures: "/v1/admin/procedures",
    procedureDetail: (procedureId: string) => `/v1/admin/procedures/${procedureId}`,
    templates: "/v1/admin/templates",
    templateDetail: (templateId: string) => `/v1/admin/templates/${templateId}`,
    templateItems: "/v1/admin/template-items",
    templateItemDetail: (scheduleItemId: string) => `/v1/admin/template-items/${scheduleItemId}`
  }
} as const;
