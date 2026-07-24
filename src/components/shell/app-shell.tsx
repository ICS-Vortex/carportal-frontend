"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { Bell, CarFront, Gauge, Home, KeyRound, ListChecks, Settings2, ShieldCheck, UserRound, Wrench } from "lucide-react";

import { TopNav } from "@/components/shell/top-nav";
import { getApiErrorMessage, getSession, listReminders } from "@/lib/api";
import { APP_ROUTES } from "@/lib/routes";
import type { AuthUser } from "@/lib/types";

const navigation = [
  { href: APP_ROUTES.home, label: "Головна", icon: Home, access: "all" },
  { href: APP_ROUTES.dashboard, label: "Кабінет", icon: Gauge, access: "auth" },
  { href: APP_ROUTES.garage, label: "Гараж", icon: CarFront, access: "auth" },
  { href: APP_ROUTES.maintenance, label: "Регламент ТО", icon: Wrench, access: "auth" },
  { href: APP_ROUTES.serviceLogs, label: "Журнал сервісу", icon: ListChecks, access: "auth" },
  { href: APP_ROUTES.reminders, label: "Нагадування", icon: Bell, access: "auth" },
  { href: APP_ROUTES.profile, label: "Профіль", icon: UserRound, access: "auth" },
  { href: APP_ROUTES.profilePassword, label: "Пароль", icon: KeyRound, access: "auth" },
  { href: APP_ROUTES.admin, label: "Керування", icon: Settings2, access: "admin" },
  { href: APP_ROUTES.auth, label: "Авторизація", icon: ShieldCheck, access: "public" }
];

type AppShellProps = {
  activeHref: string;
  heading: string;
  description: string;
  children: ReactNode;
  access?: "public" | "auth" | "admin";
};

export function AppShell({ activeHref, heading, description, children, access = "auth" }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(access !== "public");
  const [error, setError] = useState("");
  const [remindersCount, setRemindersCount] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;

    if (access === "public") {
      setLoading(false);
      void getSession()
        .then((user) => {
          if (!cancelled) {
            setSession(user);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setSession(null);
          }
        });

      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setError("");

    void getSession()
      .then((user) => {
        if (cancelled) {
          return;
        }

        setSession(user);

        if (!user) {
          router.replace(`${APP_ROUTES.auth}?next=${encodeURIComponent(pathname)}`);
          setLoading(false);
          return;
        }

        if (access === "admin" && user.role !== "admin") {
          router.replace(APP_ROUTES.dashboard);
          setLoading(false);
          return;
        }

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
  }, [access, pathname, router]);

  useEffect(() => {
    let cancelled = false;

    if (!session) {
      setRemindersCount(0);
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

  const visibleNavigation = navigation.filter((item) => {
    if (item.access === "all") {
      return true;
    }

    if (item.access === "public") {
      return !session;
    }

    if (item.access === "admin") {
      return session?.role === "admin";
    }

    return Boolean(session);
  });

  const blocked = !loading && access !== "public" && (!session || (access === "admin" && session.role !== "admin"));
  const isPublicGuest = access === "public" && !session;
  const isProtectedPreview = access !== "public" && !session;
  const resolvedHeading = isProtectedPreview ? "Закритий розділ" : heading;
  const resolvedDescription = isProtectedPreview
    ? "Авторизуйтеся, щоб перейти до внутрішніх сторінок кабінету водія."
    : description;
  const primaryHrefs = new Set<string>([APP_ROUTES.home, APP_ROUTES.dashboard, APP_ROUTES.garage, APP_ROUTES.maintenance, APP_ROUTES.serviceLogs, APP_ROUTES.reminders]);
  const primaryItems = visibleNavigation
    .filter((item) => primaryHrefs.has(item.href))
    .map((item) => item.href === APP_ROUTES.reminders ? { ...item, badgeCount: remindersCount } : item);
  const utilityItems = visibleNavigation.filter((item) => !primaryHrefs.has(item.href));
  const showTopNav = !isPublicGuest;
  const showHeader = access !== "public";

  return (
    <div className={`flex min-h-screen w-full flex-col px-4 pb-12 ${showTopNav ? "pt-4" : "pt-8"} sm:px-6 lg:px-10`}>
      {showTopNav ? <TopNav primaryItems={primaryItems} utilityItems={utilityItems} activeHref={activeHref} pathname={pathname} session={session} /> : null}
      {showHeader ? <header className="relative mb-8 overflow-hidden rounded-[32px] border border-white/10 bg-[rgba(6,17,31,0.72)] px-5 py-6 shadow-[0_24px_90px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:px-7 sm:py-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(76,207,255,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(79,132,255,0.16),transparent_28%)]" />
        <div className="relative">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-cyan)]">Кабінет водія</span>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-white sm:text-4xl">{resolvedHeading}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)] sm:text-base">{resolvedDescription}</p>
          </div>
        </div>
      </header> : null}
      <main className="flex-1">
        {loading ? (
          <div className="rounded-[28px] border border-white/10 bg-[rgba(6,17,31,0.72)] p-8 text-sm text-[var(--muted)] backdrop-blur-xl">
            Перевіряємо доступ до розділу...
          </div>
        ) : blocked ? (
          <div className="rounded-[28px] border border-white/10 bg-[rgba(6,17,31,0.72)] p-8 text-sm text-[var(--muted)] backdrop-blur-xl">
            {error || (access === "admin" ? "Доступ до розділу керування дозволено лише адміністратору." : "Потрібна авторизація. Перенаправляємо на сторінку входу...")}
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
