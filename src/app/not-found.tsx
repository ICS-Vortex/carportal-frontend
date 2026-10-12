import type { Metadata } from "next";
import Link from "next/link";

import { PublicHeader } from "@/components/public/public-header";
import { APP_ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Сторінку не знайдено · Carmain",
  robots: { index: false, follow: false }
};

export default function NotFound() {
  return (
    <div className="shop-site flex min-h-screen flex-col">
      <PublicHeader />
      <main className="shop-hero flex flex-1 flex-col items-center justify-center px-4 py-20 text-center text-white sm:px-6">
        <p className="shop-kicker">404</p>
        <h1 className="display mt-4 text-4xl leading-none sm:text-6xl">Сторінку не знайдено</h1>
        <p className="mt-6 max-w-lg text-base leading-7 text-white/85 sm:text-lg">
          Перевірте адресу або поверніться на головну. Якщо ви вже маєте обліковий запис — відкрийте кабінет.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href={APP_ROUTES.home} className="shop-btn">
            На головну
          </Link>
          <Link
            href={APP_ROUTES.dashboard}
            className="inline-flex items-center justify-center border border-white/30 bg-transparent px-6 py-3 text-xs font-medium tracking-[0.08em] text-white uppercase transition hover:border-white hover:bg-white/10"
          >
            До кабінету
          </Link>
        </div>
      </main>
    </div>
  );
}
