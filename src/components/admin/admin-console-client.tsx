import Link from "next/link";

import { APP_ROUTES } from "@/lib/routes";

const workspaces = [
  {
    href: APP_ROUTES.adminOverview,
    eyebrow: "Огляд",
    title: "Стан платформи",
    summary: "Швидка картина по користувачах, авто, сервісних записах і загальному стану системи."
  },
  {
    href: APP_ROUTES.adminCatalog,
    eyebrow: "Довідник",
    title: "Плани обслуговування і правила",
    summary: "Окрема робоча сторінка для шаблонів, процедур і привʼязок без важкого вертикального полотна."
  },
  {
    href: APP_ROUTES.adminUsers,
    eyebrow: "Користувачі",
    title: "Блокування, ролі та деактивація",
    summary: "Увесь доступ і стан акаунтів винесено в окремий операційний контур."
  }
] as const;

export function AdminConsoleClient() {

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {workspaces.map((workspace) => (
          <Link
            key={workspace.href}
            href={workspace.href}
            className="group rounded-[28px] border border-white/10 bg-[rgba(8,20,39,0.9)] p-6 transition hover:border-[rgba(76,207,255,0.35)] hover:bg-[rgba(10,24,46,0.96)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-cyan)]">{workspace.eyebrow}</p>
            <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-white">{workspace.title}</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{workspace.summary}</p>
            <div className="mt-6 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition group-hover:border-[rgba(76,207,255,0.35)] group-hover:text-[var(--accent-cyan)]">
              Відкрити розділ
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}