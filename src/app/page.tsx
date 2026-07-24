import { LandingPage } from "@/components/landing/landing-page";
import { AppShell } from "@/components/shell/app-shell";

export default async function Home() {
  return (
    <AppShell
      activeHref="/"
      access="public"
      heading="Car Portal"
      description="Сервіс для власників авто: гараж, регламент ТО, історія сервісу, нагадування і швидкий перехід у мобільний застосунок."
    >
      <LandingPage />
    </AppShell>
  );
}

