import Link from "next/link";

import { Newspaper, Smartphone, Sparkles, Waypoints } from "lucide-react";

import type { LandingContentResponse } from "@/lib/types";

import { SectionCard } from "@/components/ui/section-card";

import { MarketingCarousel } from "./marketing-carousel";

const audienceIcons = [Sparkles, Newspaper, Waypoints, Smartphone];

type LandingContentProps = {
  content: LandingContentResponse;
  sourceLabel?: string;
};

export function LandingContent({ content, sourceLabel = "Контент головної сторінки синхронізовано." }: LandingContentProps) {

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <MarketingCarousel slides={content.slides} />

        <div className="grid gap-6">
          <SectionCard eyebrow="Банери продукту" title="Що важливо прямо зараз">
            <div className="space-y-4">
              {content.banners.map((item) => (
                <article key={item.id} className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-cyan)]">
                      {item.tag}
                    </span>
                    <Link href={item.href} className="text-sm font-semibold text-white transition hover:text-[var(--accent-cyan)]">
                      {item.actionLabel}
                    </Link>
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.detail}</p>
                </article>
              ))}
            </div>
          </SectionCard>

          <SectionCard eyebrow="iOS та Android" title="Мобільний застосунок" className="scroll-mt-24" >
            <div id="mobile-app" className="grid gap-4">
              {content.downloads.map((item) => (
                <a key={item.platform} href={item.href} className="rounded-[24px] border border-white/8 bg-white/4 p-5 transition hover:border-[var(--accent-cyan)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-cyan)]">{item.platform}</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.caption}</p>
                    </div>
                    <span className="rounded-full border border-[rgba(255,143,76,0.2)] bg-[rgba(255,143,76,0.08)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                      {item.status === "soon" ? "Скоро" : item.status}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </SectionCard>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <SectionCard eyebrow="Для кого це" title="Портал, який працює як сервіс">
          <div className="grid gap-4 md:grid-cols-2">
            {content.audience.map((item, index) => {
              const Icon = audienceIcons[index % audienceIcons.length];

              return (
                <article key={item.id} className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                  <div className="flex items-center gap-3 text-white">
                    <div className="rounded-2xl bg-[rgba(79,132,255,0.18)] p-3">
                      <Icon className="h-5 w-5 text-[var(--accent-cyan)]" />
                    </div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.detail}</p>
                </article>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard eyebrow="Новини та релізи" title="Останні зміни у сервісі" className="scroll-mt-24">
          <div id="portal-news" className="space-y-4">
            {content.news.map((item) => (
              <article key={item.id} className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      {item.tag}
                    </span>
                    <span className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                      {new Date(item.publishedAt).toLocaleDateString("uk-UA")}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.detail}</p>
              </article>
            ))}
            <p className="text-sm leading-6 text-[var(--muted)]">{sourceLabel}</p>
          </div>
        </SectionCard>
      </section>
    </div>
  );
}