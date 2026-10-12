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
    <section className={clsx("rounded-[32px] border border-[var(--line)] bg-[var(--panel)] p-6 backdrop-blur-xl", className)}>
      {(eyebrow || title) ? (
        <div className="mb-5">
          {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
          {title ? <h2 className="display mt-2 text-3xl text-[var(--foreground)]">{title}</h2> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
