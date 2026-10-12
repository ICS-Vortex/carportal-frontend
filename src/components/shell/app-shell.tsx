"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { Bell, CarFront, Gauge, ListChecks, LogOut, Menu, UserRound, Wrench, X } from "lucide-react";

import { getApiErrorMessage, getSession, listReminders, logout } from "@/lib/api";
import { APP_ROUTES } from "@/lib/routes";
import type { AuthUser } from "@/lib/types";

const primaryNavigation = [
  { href: APP_ROUTES.dashboard, label: "Огляд", icon: Gauge },
  { href: APP_ROUTES.garage, label: "Гараж", icon: CarFront },
  { href: APP_ROUTES.maintenance, label: "Регламент", icon: Wrench },
  { href: APP_ROUTES.serviceLogs, label: "Журнал", icon: ListChecks },
  { href: APP_ROUTES.reminders, label: "Нагадування", icon: Bell }
];

const accountNavigation = [
  { href: APP_ROUTES.profile, label: "Профіль", icon: UserRound }
];

type AppShellProps = {
  heading: string;
  description?: string;
  children: ReactNode;
};

function isActiveRoute(href: string, pathname: string) {
  if (href === APP_ROUTES.dashboard) {
    return pathname === APP_ROUTES.dashboard;
  }

  if (href === APP_ROUTES.profile) {
    return pathname === APP_ROUTES.profile || pathname.startsWith(`${APP_ROUTES.profileDelete}`);
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function initials(name: string) {
  const letters = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "");

  return letters.join("") || "В";
}

export function AppShell({ heading, description, children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [remindersCount, setRemindersCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void getSession()
      .then((user) => {
        if (cancelled) {
          return;
        }

        if (!user) {
          setLoading(false);
          router.replace(`${APP_ROUTES.auth}?next=${encodeURIComponent(pathname)}`);
          return;
        }

        setSession(user);
        setLoading(false);
      })
      .catch((requestError) => {
        if (cancelled) {
          return;
        }

        setError(getApiErrorMessage(requestError));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  useEffect(() => {
    let cancelled = false;

    if (!session) {
      return () => {
        cancelled = true;
      };
    }

    void listReminders()
      .then((items) => {
        if (!cancelled) {
          setRemindersCount(items.filter((item) => item.status === "due").length);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRemindersCount(0);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function handleLogout() {
    setSigningOut(true);
    void logout()
      .then(() => {
          router.replace(APP_ROUTES.home);
        router.refresh();
      })
      .catch((requestError) => {
        setError(getApiErrorMessage(requestError));
        setSigningOut(false);
      });
  }

  const navigation = (
    <nav className="flex flex-1 flex-col gap-6">
      <div className="space-y-1">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Кабінет</p>
        {primaryNavigation.map((item) => {
          const Icon = item.icon;
          const active = isActiveRoute(item.href, pathname);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={active
                ? "flex items-center justify-between bg-[#c51b1b] px-3 py-2.5 text-sm font-medium text-white"
                : "flex items-center justify-between px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
              }
            >
              <span className="inline-flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              {item.href === APP_ROUTES.reminders && remindersCount > 0 ? (
                <span className="inline-flex min-w-6 items-center justify-center bg-white px-1.5 py-0.5 text-[11px] font-semibold text-[#c51b1b]">
                  {remindersCount > 99 ? "99+" : remindersCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
      <div className="space-y-1">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Акаунт</p>
        {accountNavigation.map((item) => {
          const Icon = item.icon;
          const active = isActiveRoute(item.href, pathname);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={active
                ? "flex items-center gap-3 bg-[#c51b1b] px-3 py-2.5 text-sm font-medium text-white"
                : "flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );

  return (
    <div className="atelier">
      <aside className="atelier-rail">
        <div className="flex items-center justify-between gap-3">
          <Link href={APP_ROUTES.dashboard} className="leading-none">
            <span className="display block text-3xl text-[#c51b1b]">Carmain</span>
            <span className="mt-1 block text-[11px] font-medium tracking-[0.22em] text-[#e7b3b3]">КАБІНЕТ</span>
          </Link>
          <button
            type="button"
            className="btn-ghost btn-sm rail-toggle"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label={menuOpen ? "Закрити меню" : "Відкрити меню"}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        <div className={`rail-body ${menuOpen ? "is-open" : ""}`}>
          {navigation}
          <div className="mt-auto border border-white/15 p-3">
            <div className="flex items-center gap-3">
              {session?.avatarUrl ? (
                <img src={session.avatarUrl} alt="" className="h-10 w-10 object-cover" />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center bg-[#c51b1b] text-sm font-semibold text-white">
                  {initials(session?.fullName ?? "")}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{session?.fullName ?? "Власник"}</p>
                <p className="truncate text-xs text-white/55">{session?.email ?? "Потрібен вхід"}</p>
              </div>
            </div>
            <button type="button" onClick={handleLogout} disabled={signingOut || !session} className="mt-3 inline-flex w-full items-center justify-center gap-2 border border-white/20 px-3 py-2 text-xs font-medium tracking-[0.08em] text-white uppercase hover:bg-white/10">
              <LogOut className="h-4 w-4" />
              {signingOut ? "Вихід..." : "Вийти"}
            </button>
          </div>
        </div>
      </aside>

      <div className="atelier-main">
        <header className="mb-8 max-w-3xl">
          <p className="eyebrow">Кабінет</p>
          <h1 className="display mt-3 text-3xl text-[var(--foreground)] sm:text-5xl">{heading}</h1>
          {description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">{description}</p> : null}
        </header>
        <main>
          {loading ? (
            <div className="border border-[var(--line)] bg-white p-8 text-sm text-[var(--muted)]">
              Відкриваємо ваш кабінет...
            </div>
          ) : !session ? (
            <div className="border border-[var(--line)] bg-white p-8 text-sm text-[var(--muted)]">
              {error || "Потрібен вхід. Перенаправляємо на сторінку входу..."}
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
