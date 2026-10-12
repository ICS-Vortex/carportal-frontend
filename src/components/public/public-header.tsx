"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Menu, X } from "lucide-react";

import { getSession } from "@/lib/api";
import { APP_ROUTES } from "@/lib/routes";
import type { AuthUser } from "@/lib/types";

const links = [
  { href: "/#service", label: "Можливості" },
  { href: "/#cabinet", label: "Кабінет" },
  { href: "/#journal", label: "Журнал" }
];

export function PublicHeader() {
  const pathname = usePathname();
  const [session, setSession] = useState<AuthUser | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pathname === APP_ROUTES.auth || pathname.startsWith(`${APP_ROUTES.auth}/`)) {
      setSession(null);
      return;
    }

    void getSession()
      .then(setSession)
      .catch(() => setSession(null));
  }, [pathname]);

  const cta = session
    ? { href: APP_ROUTES.dashboard, label: "До кабінету" }
    : { href: APP_ROUTES.auth, label: "Увійти" };

  function goToHomeTop(event: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname !== APP_ROUTES.home) {
      return;
    }

    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.history.replaceState(null, "", APP_ROUTES.home);
    setOpen(false);
  }

  return (
    <header className="shop-header sticky top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href={APP_ROUTES.home} className="leading-none" onClick={goToHomeTop}>
          <span className="display block text-3xl text-[var(--shop-red)]">Carmain</span>
          <span className="mt-1 block text-[11px] font-medium tracking-[0.22em] text-[#e7b3b3]">СЕРВІС АВТО</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-white lg:flex">
          <Link href={APP_ROUTES.home} className="transition hover:text-[#f0c7c7]" onClick={goToHomeTop}>Головна</Link>
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-[#f0c7c7]">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href={cta.href} className="shop-btn">
            {cta.label}
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center bg-[var(--shop-red)] text-white lg:hidden"
            aria-label={open ? "Закрити меню" : "Відкрити меню"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open ? (
        <nav className="border-t border-white/10 px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-3 text-sm font-medium text-white">
            <Link href={APP_ROUTES.home} onClick={goToHomeTop}>Головна</Link>
            {links.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
