export type AuthUser = {
  userId: string;
  email: string;
  fullName: string;
  role: "user" | "admin";
  avatarUrl?: string | null;
  hasPassword?: boolean;
  hasGoogleAccount?: boolean;
  preferredServiceStationId?: string | null;
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
  fuel_type: string | null;
  year: number;
  vin: string | null;
  license_plate: string | null;
  image_url: string | null;
  mileage_km: number;
  last_service_date: string | null;
  last_service_mileage_km: number | null;
  has_maintenance_plan: boolean;
  created_at: string;
  updated_at: string;
};

export type GarageVehicleInsight = {
  dueCount: number;
  upcomingCount: number;
  nextProcedureTitle: string | null;
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
  labor_price_uah: number | null;
  category: string;
};

export type ServiceStation = {
  id: string;
  slug: string;
  name_uk: string;
  city_uk: string | null;
  address_uk: string | null;
  image_url: string | null;
  sort_order: number;
};

export type ServiceLog = {
  id: string;
  vehicle_id: string;
  service_date: string;
  service_time?: string | null;
  record_kind?: "visit" | "appointment";
  mileage_km: number;
  service_station: string | null;
  service_station_id?: string | null;
  notes_uk: string | null;
  items: Array<{
    procedure_id: string;
    title_uk: string;
    notes_uk: string | null;
  }>;
};

export type AppointmentSlot = {
  time: string;
  available: boolean;
  booked_count: number;
  capacity: number;
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
    labor_price_uah: number | null;
  }>;
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
  station_id: string | null;
  station_name_uk: string | null;
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
  labor_price_uah: number | null;
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
  serviceStationId: string | null;
  activeTemplate: {
    id: string;
    station_id: string | null;
    station_name_uk: string | null;
  } | null;
};

export type MaintenanceRequestOptions = {
  stationId?: string | null;
};
