"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";

type ToastTone = "success" | "error" | "info";

type ToastItem = {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ShowToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
};

type ToastContextValue = {
  showToast: (input: ShowToastInput) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function toneStyles(tone: ToastTone) {
  if (tone === "success") {
    return {
      icon: CheckCircle2,
      shell: "border-[rgba(68,211,139,0.28)] bg-[linear-gradient(135deg,rgba(20,50,38,0.88),rgba(14,40,32,0.8))]",
      iconWrap: "border-[rgba(68,211,139,0.28)] bg-[linear-gradient(180deg,rgba(68,211,139,0.22),rgba(68,211,139,0.12))] text-[rgb(193,255,223)]",
      glow: "bg-[radial-gradient(circle,rgba(68,211,139,0.26),transparent_68%)]",
      close: "hover:border-[rgba(68,211,139,0.3)] hover:bg-[rgba(68,211,139,0.12)] hover:text-white",
      progress: "from-[rgba(210,255,230,0.95)] via-[rgba(124,232,176,0.88)] to-[rgba(68,211,139,0.42)]"
    };
  }

  if (tone === "error") {
    return {
      icon: CircleAlert,
      shell: "border-[rgba(255,95,87,0.28)] bg-[linear-gradient(135deg,rgba(66,25,32,0.88),rgba(48,18,24,0.82))]",
      iconWrap: "border-[rgba(255,95,87,0.28)] bg-[linear-gradient(180deg,rgba(255,95,87,0.22),rgba(255,95,87,0.12))] text-[rgb(255,213,209)]",
      glow: "bg-[radial-gradient(circle,rgba(255,95,87,0.26),transparent_68%)]",
      close: "hover:border-[rgba(255,95,87,0.3)] hover:bg-[rgba(255,95,87,0.12)] hover:text-white",
      progress: "from-[rgba(255,229,226,0.95)] via-[rgba(255,168,162,0.88)] to-[rgba(255,95,87,0.42)]"
    };
  }

  return {
    icon: Info,
    shell: "border-[rgba(76,207,255,0.28)] bg-[linear-gradient(135deg,rgba(18,38,70,0.88),rgba(11,28,54,0.82))]",
    iconWrap: "border-[rgba(76,207,255,0.28)] bg-[linear-gradient(180deg,rgba(76,207,255,0.22),rgba(76,207,255,0.12))] text-[rgb(205,247,255)]",
    glow: "bg-[radial-gradient(circle,rgba(76,207,255,0.26),transparent_68%)]",
    close: "hover:border-[rgba(76,207,255,0.3)] hover:bg-[rgba(76,207,255,0.12)] hover:text-white",
    progress: "from-[rgba(229,249,255,0.95)] via-[rgba(128,225,255,0.88)] to-[rgba(76,207,255,0.42)]"
  };
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(({ title, description, tone = "info" }: ShowToastInput) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, title, description, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  const value = useMemo<ToastContextValue>(() => ({
    showToast,
    success: (title, description) => showToast({ title, description, tone: "success" }),
    error: (title, description) => showToast({ title, description, tone: "error" }),
    info: (title, description) => showToast({ title, description, tone: "info" })
  }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[180] flex w-[min(92vw,390px)] flex-col gap-3 sm:right-6 sm:top-6">
        {toasts.map((toast) => {
          const styles = toneStyles(toast.tone);
          const Icon = styles.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto relative overflow-hidden rounded-[26px] border px-4 py-4 shadow-[0_28px_100px_rgba(0,0,0,0.26)] backdrop-blur-2xl [animation:toast-in-premium_320ms_cubic-bezier(.22,1,.36,1)] ${styles.shell}`}
            >
              <div className={`pointer-events-none absolute -left-8 top-1/2 h-28 w-28 -translate-y-1/2 blur-2xl ${styles.glow}`} />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0))]" />
              <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.32),transparent)]" />
              <div className="relative flex items-start gap-3">
                <div className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border shadow-[0_12px_28px_rgba(0,0,0,0.16)] ${styles.iconWrap}`}>
                  <Icon className="h-[18px] w-[18px] drop-shadow-[0_0_8px_rgba(255,255,255,0.18)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold leading-6 tracking-[-0.01em] text-white drop-shadow-[0_1px_0_rgba(0,0,0,0.18)]">{toast.title}</p>
                  {toast.description ? <p className="mt-1 text-sm leading-6 text-[rgba(233,240,252,0.82)]">{toast.description}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className={`rounded-full border border-white/12 bg-white/[0.03] p-2 text-[rgba(233,240,252,0.64)] transition ${styles.close}`}
                  aria-label="Закрити повідомлення"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="relative mt-3 h-[4px] overflow-hidden rounded-full bg-white/10">
                <div className={`h-full rounded-full bg-[linear-gradient(90deg,var(--tw-gradient-stops))] ${styles.progress} [animation:toast-progress_4200ms_linear_forwards]`} />
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);

  if (!value) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return value;
}