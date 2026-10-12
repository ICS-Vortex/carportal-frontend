import Link from "next/link";

import { AuthPanel } from "@/components/auth/auth-panel";
import { PublicHeader } from "@/components/public/public-header";
import { APP_ROUTES } from "@/lib/routes";

type AuthPageProps = {
  searchParams?: Promise<{ next?: string }>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const nextHref = params?.next || APP_ROUTES.dashboard;

  return (
    <div className="shop-site min-h-screen bg-white">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-lg flex-col px-4 py-12 sm:px-6 sm:py-16">
        <Link href={APP_ROUTES.home} className="text-sm font-semibold text-[var(--shop-muted)] transition hover:text-[var(--shop-ink)]">
          На головну
        </Link>
        <p className="shop-kicker mt-8">Кабінет</p>
        <h1 className="display mt-3 text-4xl text-[var(--shop-ink)]">Вхід</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--shop-muted)]">
          Email або Google. Після входу відкриється огляд, гараж, регламент і журнал.
        </p>
        <div className="mt-8 border border-[#e4e4e4] bg-white p-5 sm:p-6">
          <AuthPanel nextHref={nextHref} />
        </div>
      </main>
    </div>
  );
}
