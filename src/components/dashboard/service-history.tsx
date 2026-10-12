import type { ServiceLog } from "@/lib/types";

type ServiceHistoryProps = {
  logs: ServiceLog[];
};

export function ServiceHistory({ logs }: ServiceHistoryProps) {
  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <article key={log.id} className="rounded-[24px] border border-[var(--line)] bg-white/3 px-4 py-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
            <span>{new Date(log.service_date).toLocaleDateString("uk-UA")}</span>
            <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
            <span>{log.mileage_km.toLocaleString("uk-UA")} км</span>
          </div>
          <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">{log.service_station ?? "Сервісний візит"}</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{log.items.map((item) => item.title_uk).join(" · ")}</p>
        </article>
      ))}
    </div>
  );
}
