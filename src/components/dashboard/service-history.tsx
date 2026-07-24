import type { ServiceLog } from "@/lib/types";

type ServiceHistoryProps = {
  logs: ServiceLog[];
};

export function ServiceHistory({ logs }: ServiceHistoryProps) {
  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <article
          key={log.id}
          className="flex flex-col gap-3 rounded-[22px] border border-white/8 bg-white/4 px-4 py-4 transition duration-200 hover:border-white/15 hover:bg-white/7 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
              <span>{new Date(log.service_date).toLocaleDateString("uk-UA")}</span>
              <span className="h-1 w-1 rounded-full bg-[var(--accent-cyan)]" />
              <span>{log.mileage_km.toLocaleString("uk-UA")} км</span>
            </div>
            <h3 className="mt-2 text-lg font-semibold text-white">{log.service_station ?? "Сервісний запис"}</h3>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{log.items.map((item) => item.title_uk).join(" · ")}</p>
          </div>
          <div className="self-start rounded-full border border-white/10 px-4 py-2 text-sm text-white sm:self-center">
            {log.notes_uk ? "Є примітка" : "Без примітки"}
          </div>
        </article>
      ))}
    </div>
  );
}
