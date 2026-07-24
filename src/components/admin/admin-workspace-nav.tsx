import Link from "next/link";

import { APP_ROUTES } from "@/lib/routes";

const items = [
  { href: APP_ROUTES.admin, label: "Хаб" },
  { href: APP_ROUTES.adminOverview, label: "Огляд" },
  { href: APP_ROUTES.adminCatalog, label: "Довідник" },
  { href: APP_ROUTES.adminUsers, label: "Користувачі" }
] as const;

type AdminWorkspaceNavProps = {
  activeHref: string;
};

export function AdminWorkspaceNav({ activeHref }: AdminWorkspaceNavProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {items.map((item) => {
        const active = item.href === activeHref;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={active
              ? "rounded-full border border-[rgba(76,207,255,0.45)] bg-[rgba(79,132,255,0.18)] px-4 py-2 text-sm font-semibold text-white"
              : "rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--muted)] transition hover:border-white/20 hover:text-white"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}