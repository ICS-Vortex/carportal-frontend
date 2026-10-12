"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type AppModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  maxWidthClassName?: string;
};

export function AppModal({
  open,
  title,
  description,
  onClose,
  children,
  maxWidthClassName = "max-w-2xl"
}: AppModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(open);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setVisible(true);
      const animationFrame = window.requestAnimationFrame(() => {
        setEntered(true);
      });

      return () => {
        window.cancelAnimationFrame(animationFrame);
      };
    }

    setEntered(false);
    const timeout = window.setTimeout(() => {
      setVisible(false);
    }, 220);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [open]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, onClose]);

  if (!mounted || !visible) {
    return null;
  }

  return createPortal(
    <div className={`fixed inset-0 z-[120] overflow-y-auto px-3 py-4 backdrop-blur-[10px] transition-all duration-200 ease-out sm:px-4 sm:py-8 ${entered ? "bg-[rgba(8,7,6,0.72)]" : "bg-[rgba(8,7,6,0)]"}`}>
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="flex min-h-full items-center justify-center">
        <div className={`relative z-10 my-auto w-full ${maxWidthClassName} border border-[#e4e4e4] bg-white text-[#2b2b2b] shadow-[0_24px_80px_rgba(0,0,0,0.18)] transition-all duration-200 ease-out ${entered ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-[0.985] opacity-0"}`}>
          <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-4 py-3 sm:px-5">
            <div className="min-w-0">
              <h3 className="display text-3xl text-[var(--foreground)]">{title}</h3>
              {description ? <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted)]">{description}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost btn-sm shrink-0"
            >
              Закрити
            </button>
          </div>
          <div className="max-h-[calc(100vh-5.5rem)] overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}