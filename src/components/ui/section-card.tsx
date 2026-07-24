import type { ReactNode } from "react";

import { clsx } from "clsx";

type SectionCardProps = {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
};

export function SectionCard({ title, eyebrow, children, className }: SectionCardProps) {
  return (
    <section
      className={clsx(
        "panel-glow rounded-[28px] border border-white/10 bg-[var(--panel)] p-6 shadow-[0_24px_80px_rgba(3,9,21,0.45)] backdrop-blur-xl",
        className
      )}
    >
      {(eyebrow || title) && (
        <div className="mb-5 flex flex-col gap-1">
          {eyebrow ? <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-cyan)]">{eyebrow}</span> : null}
          {title ? <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white">{title}</h2> : null}
        </div>
      )}
      {children}
    </section>
  );
}
