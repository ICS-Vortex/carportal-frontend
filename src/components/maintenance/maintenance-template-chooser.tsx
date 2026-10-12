"use client";

import { Building2, ClipboardList } from "lucide-react";

import type { MaintenanceTemplateCandidate } from "@/lib/types";

type MaintenanceTemplateChooserProps = {
  templates: MaintenanceTemplateCandidate[];
  selectedStationId: string;
  busy?: boolean;
  onAssign: (templateId: string) => void;
};

function scopeLabel(template: MaintenanceTemplateCandidate): { text: string; tone: "station" | "global" } {
  if (template.station_id) {
    return {
      text: template.station_name_uk ? `СТО · ${template.station_name_uk}` : "Для обраного СТО",
      tone: "station"
    };
  }

  return { text: "Загальний регламент", tone: "global" };
}

export function MaintenanceTemplateChooser({
  templates,
  selectedStationId,
  busy = false,
  onAssign
}: MaintenanceTemplateChooserProps) {
  if (templates.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[28px] border border-[var(--line)] bg-white/70 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-[rgba(197,27,27,0.1)] text-[#c51b1b]">
          <ClipboardList className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">Оберіть регламент</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Для цієї комплектації є кілька варіантів. Станційні регламенти враховують ціни та інтервали конкретного СТО.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {templates.map((template) => {
          const scope = scopeLabel(template);
          const isStationMatch = Boolean(selectedStationId && template.station_id === selectedStationId);

          return (
            <button
              key={template.id}
              type="button"
              disabled={busy}
              onClick={() => onAssign(template.id)}
              className={`group flex h-full flex-col rounded-[22px] border p-4 text-left transition ${
                isStationMatch
                  ? "border-[rgba(197,27,27,0.45)] bg-[rgba(197,27,27,0.06)] hover:border-[#c51b1b]"
                  : "border-[var(--line)] bg-white/50 hover:border-[rgba(197,27,27,0.35)] hover:bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-base font-semibold leading-snug text-[var(--foreground)]">{template.name_uk}</p>
                <span className={scope.tone === "station" ? "status-done shrink-0" : "status-wait shrink-0"}>{scope.text}</span>
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {template.item_count} {template.item_count === 1 ? "робота" : "робіт"}
                {template.configuration_label ? ` · ${template.configuration_label}` : ""}
              </p>
              {template.notes_uk ? (
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--muted)]">{template.notes_uk}</p>
              ) : null}
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#c51b1b] opacity-80 group-hover:opacity-100">
                <Building2 className="h-3.5 w-3.5" />
                Підключити цей регламент
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
