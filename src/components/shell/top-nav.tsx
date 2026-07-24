"use client";

import Link from "next/link";

import { CarFront, ChevronRight, type LucideIcon } from "lucide-react";

import type { AuthUser } from "@/lib/types";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badgeCount?: number;
};

type TopNavProps = {
  primaryItems: NavItem[];
  utilityItems: NavItem[];
  activeHref: string;
  pathname: string;
  session: AuthUser | null;
};

export function TopNav({ primaryItems, utilityItems, activeHref, pathname, session }: TopNavProps) {
  return (
    <div className="sticky top-4 z-30 mb-5">
      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(6,17,31,0.78)] shadow-[0_20px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl">
        <div className="border-b border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(76,207,255,0.18),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0))] px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-black/15 px-3 py-2 text-white transition hover:border-white/20">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(79,132,255,0.95),rgba(76,207,255,0.95))] text-slate-950">
                  <CarFront className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--accent-cyan)]">Кабінет водія</span>
                  <span className="mt-1 block text-sm font-semibold text-white">Сервіс, історія та нагадування</span>
                </span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {utilityItems.map((item) => {
                const Icon = item.icon;
                const active = isActiveRoute(item.href, activeHref, pathname);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={active
                      ? "inline-flex items-center gap-2 rounded-full border border-[rgba(76,207,255,0.42)] bg-[rgba(79,132,255,0.16)] px-4 py-2 text-sm font-semibold text-white"
                      : "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--muted)] transition hover:border-white/20 hover:text-white"
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}

              {session ? (
                <div className="flex items-center gap-2 rounded-full border border-[rgba(76,207,255,0.2)] bg-[rgba(76,207,255,0.08)] px-4 py-2 text-sm text-white">
                  <span className="truncate max-w-[160px] sm:max-w-none">{session.fullName}</span>
                  <span className="text-[var(--muted)]">•</span>
                  <span className="text-[var(--muted)]">{session.role === "admin" ? "адміністратор" : "водій"}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <nav className="overflow-x-auto px-3 py-3 sm:px-4">
          <div className="flex min-w-max gap-2 rounded-[22px] border border-white/8 bg-black/15 p-2">
            {primaryItems.map((item) => {
              const Icon = item.icon;
              const active = isActiveRoute(item.href, activeHref, pathname);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active
                    ? "inline-flex items-center gap-2 rounded-[18px] bg-[linear-gradient(135deg,rgba(79,132,255,0.22),rgba(76,207,255,0.22))] px-4 py-3 text-sm font-semibold text-white shadow-[inset_0_0_0_1px_rgba(76,207,255,0.35)]"
                    : "inline-flex items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-semibold text-[var(--muted)] transition hover:bg-white/6 hover:text-white"
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {item.badgeCount && item.badgeCount > 0 ? (
                    <span className="inline-flex min-w-6 items-center justify-center rounded-full border border-[rgba(76,207,255,0.45)] bg-[rgba(76,207,255,0.14)] px-2 py-0.5 text-[11px] font-semibold leading-none text-[var(--accent-cyan)]">
                      {item.badgeCount > 99 ? "99+" : item.badgeCount}
                    </span>
                  ) : null}
                  {active ? <ChevronRight className="h-4 w-4 text-[var(--accent-cyan)]" /> : null}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

function isActiveRoute(href: string, activeHref: string, pathname: string) {
  return href === activeHref || (pathname !== href && pathname.startsWith(`${href}/`));
}