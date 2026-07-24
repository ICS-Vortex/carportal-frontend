import { AppShell } from "@/components/shell/app-shell";
import { AuthPanel } from "@/components/auth/auth-panel";
import { SectionCard } from "@/components/ui/section-card";
import { APP_ROUTES } from "@/lib/routes";

type AuthPageProps = {
  searchParams?: Promise<{ next?: string }>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const nextHref = params?.next || APP_ROUTES.dashboard;

  return (
    <AppShell
      activeHref={APP_ROUTES.auth}
      access="public"
      heading="Авторизація"
      description="Два сценарії входу: Google Sign-In або класичний email/пароль із захищеною сесією."
    >
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
        <div className="w-full max-w-xl space-y-6">
          <SectionCard eyebrow="Доступ" title="Вхід до кабінету" className="mx-auto">
            <AuthPanel nextHref={nextHref} />
          </SectionCard>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              "Особистий гараж, історія сервісу та фактичний пробіг.",
              "План обслуговування і нагадування без зайвих демонстраційних блоків.",
              "Окремі інструменти керування для адміністратора, якщо роль це дозволяє."
            ].map((item) => (
              <div key={item} className="rounded-[22px] border border-white/8 bg-white/4 p-4 text-sm leading-6 text-[var(--muted)]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
