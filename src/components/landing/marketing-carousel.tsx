"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ArrowRight } from "lucide-react";

import type { LandingContentResponse } from "@/lib/types";

type MarketingCarouselProps = {
  slides: LandingContentResponse["slides"];
};

export function MarketingCarousel({ slides }: MarketingCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[activeIndex];

  if (!activeSlide) {
    return null;
  }

  return (
    <section className="panel-glow overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,24,45,0.9),rgba(7,17,33,0.82))] p-7 shadow-[0_24px_80px_rgba(3,9,21,0.45)] backdrop-blur-xl sm:p-9">
      <div className="inline-flex items-center rounded-full border border-[rgba(76,207,255,0.24)] bg-[rgba(76,207,255,0.08)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-[var(--accent-cyan)]">
        {activeSlide.eyebrow}
      </div>
      <h2 className="mt-6 max-w-4xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
        {activeSlide.title}
      </h2>
      <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--muted)] sm:text-lg">
        {activeSlide.detail}
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link href={activeSlide.primaryCta.href} className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#4f84ff,#4ccfff)] px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">
          {activeSlide.primaryCta.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href={activeSlide.secondaryCta.href} className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-[var(--accent-cyan)]">
          {activeSlide.secondaryCta.label}
        </Link>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {activeSlide.metrics.map((item) => (
          <div key={item.label} className="rounded-[24px] border border-white/8 bg-white/4 p-4">
            <p className="text-3xl font-semibold text-white">{item.value}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-7 flex gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Перейти до слайду ${index + 1}`}
            onClick={() => setActiveIndex(index)}
            className={index === activeIndex
              ? "h-2.5 w-10 rounded-full bg-[var(--accent-cyan)]"
              : "h-2.5 w-2.5 rounded-full bg-white/30 transition hover:bg-white/50"
            }
          />
        ))}
      </div>
    </section>
  );
}