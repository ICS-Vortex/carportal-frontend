export type AuthUser = {
  userId: string;
  email: string;
  fullName: string;
  role: "user" | "admin";
  avatarUrl?: string | null;
  hasPassword?: boolean;
  hasGoogleAccount?: boolean;
};

export type AdminOverviewResponse = {
  stats: {
    users_count: string;
    blocked_users_count: string;
    deleted_users_count: string;
    vehicles_count: string;
    service_logs_count: string;
    reminders_count: string;
    templates_count: string;
    procedures_count: string;
    missing_plan_requests_count: string;
  };
  users: Array<{
    id: string;
    email: string;
    full_name: string;
    role: "user" | "admin";
    avatar_url: string | null;
    is_blocked: boolean;
    deleted: boolean;
    created_at: string;
    vehicles_count: string;
  }>;
  missingPlanRequests: Array<{
    id: string;
    status: "open" | "resolved";
    request_note: string | null;
    created_at: string;
    user_id: string;
    user_full_name: string;
    user_email: string;
    vehicle_id: string;
    vehicle_name: string;
    vehicle_year: number;
    generation_name: string | null;
    configuration_label: string | null;
  }>;
};

export type AdminManagedUser = {
  id: string;
  email: string;
  full_name: string;
  role: "user" | "admin";
  avatar_url: string | null;
  is_blocked: boolean;
  blocked_at: string | null;
  deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  vehicles_count: string;
};

export type Vehicle = {
  id: string;
  user_id: string;
  generation_id: string;
  configuration_id: string;
  make: string;
  model: string;
  generation: string | null;
  engine_name: string;
  transmission_name: string;
  drivetrain_label: string | null;
  year: number;
  vin: string | null;
  license_plate: string | null;
  image_url: string | null;
  mileage_km: number;
  created_at: string;
  updated_at: string;
};

export type VehicleCatalogResponse = {
  brands: Array<{
    id: string;
    slug: string;
    name: string;
    models: Array<{
      id: string;
      slug: string;
      name: string;
      generations: Array<{
        id: string;
        slug: string;
        name: string;
        year_from: number;
        year_to: number;
        notes_uk: string | null;
        configurations: Array<{
          id: string;
          slug: string;
          engine_label: string;
          transmission_label: string;
          drivetrain_label: string | null;
          fuel_type: string | null;
          notes_uk: string | null;
        }>;
      }>;
    }>;
  }>;
};

export type Procedure = {
  id: string;
  code: string;
  title_uk: string;
  description_uk: string | null;
  default_interval_km: number | null;
  default_interval_months: number | null;
  category: string;
};

export type ServiceLog = {
  id: string;
  vehicle_id: string;
  service_date: string;
  mileage_km: number;
  service_station: string | null;
  notes_uk: string | null;
  items: Array<{
    procedure_id: string;
    title_uk: string;
    notes_uk: string | null;
  }>;
};

export type Reminder = {
  vehicle_id: string;
  vehicle_name: string;
  procedure_id: string;
  procedure_title: string;
  due_date: string | null;
  due_mileage_km: number | null;
  current_mileage_km: number;
  status: string;
};

export type CatalogResponse = {
  procedures: Procedure[];
  templates: Array<{
    schedule_item_id: string;
    template_id: string;
    template_name: string;
    generation_id: string;
    configuration_id: string | null;
    vehicle_make: string;
    vehicle_model: string;
    generation_code: string | null;
    configuration_label: string | null;
    engine_name: string | null;
    transmission_name: string | null;
    drivetrain_label: string | null;
    year_from: number | null;
    year_to: number | null;
    procedure_id: string;
    procedure_title: string;
    interval_km: number | null;
    interval_months: number | null;
    notes_uk: string | null;
  }>;
};

export type AdminCatalogResponse = CatalogResponse & {
  templateHeaders: Array<{
    id: string;
    name_uk: string;
    generation_id: string;
    configuration_id: string | null;
    vehicle_make: string;
    vehicle_model: string;
    generation_code: string | null;
    configuration_label: string | null;
    engine_name: string | null;
    transmission_name: string | null;
    drivetrain_label: string | null;
    year_from: number | null;
    year_to: number | null;
    notes_uk: string | null;
  }>;
  vehicleCatalog: VehicleCatalogResponse;
};

export type MaintenanceTemplateCandidate = {
  id: string;
  name_uk: string;
  generation_id: string;
  configuration_id: string | null;
  vehicle_make: string;
  vehicle_model: string;
  generation_code: string | null;
  configuration_label: string | null;
  engine_name: string | null;
  transmission_name: string | null;
  drivetrain_label: string | null;
  year_from: number | null;
  year_to: number | null;
  notes_uk: string | null;
  item_count: number;
};

export type MaintenancePlanItem = {
  id: string;
  plan_id: string;
  procedure_id: string | null;
  procedure_title: string;
  procedure_category: string;
  interval_km: number | null;
  interval_months: number | null;
  notes_uk: string | null;
  sort_order: number;
  status: "pending" | "done" | "skipped";
  current_status: "pending" | "done" | "skipped" | "overdue";
  done: boolean;
  baseline_date: string;
  baseline_mileage_km: number;
  last_completed_at: string | null;
  last_completed_mileage_km: number | null;
  last_service_log_id: string | null;
  next_due_date: string | null;
  next_due_mileage_km: number | null;
  overdue_by_days: number | null;
  overdue_by_km: number | null;
};

export type MaintenancePlanResponse = {
  vehicle: Vehicle;
  plan: {
    id: string;
    vehicle_id: string;
    template_id: string | null;
    template_name: string;
    source_template_updated_at: string;
    assigned_at: string;
    updated_at: string;
  } | null;
  items: MaintenancePlanItem[];
  availableTemplates: MaintenanceTemplateCandidate[];
  templateSync: {
    isStale: boolean;
    wasAutoReassigned: boolean;
    latestTemplateUpdatedAt: string | null;
    message: string | null;
  };
  missingPlanRequest: {
    id: string;
    status: "open" | "resolved";
    request_note: string | null;
    created_at: string;
  } | null;
};

export type LandingContentResponse = {
  slides: Array<{
    id: string;
    eyebrow: string;
    title: string;
    detail: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    metrics: Array<{ value: string; label: string }>;
  }>;
  banners: Array<{
    id: string;
    tag: string;
    title: string;
    detail: string;
    href: string;
    actionLabel: string;
  }>;
  audience: Array<{
    id: string;
    title: string;
    detail: string;
  }>;
  downloads: Array<{
    platform: string;
    title: string;
    caption: string;
    href: string;
    status: string;
  }>;
  news: Array<{
    id: string;
    title: string;
    detail: string;
    tag: string;
    publishedAt: string;
  }>;
  generatedAt: string;
};
