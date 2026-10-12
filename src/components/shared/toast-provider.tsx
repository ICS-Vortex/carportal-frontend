"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";

import { APP_ROUTES } from "@/lib/routes";

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

function isShopRoute(pathname: string) {
  return pathname === APP_ROUTES.home || pathname === APP_ROUTES.auth || pathname.startsWith(`${APP_ROUTES.auth}/`);
}

function toneStyles(tone: ToastTone, shop: boolean) {
  if (shop) {
    const accent = tone === "error" ? "#c51b1b" : tone === "success" ? "#c51b1b" : "#3c3c3c";

    return {
      icon: tone === "success" ? CheckCircle2 : tone === "error" ? CircleAlert : Info,
      shell: "rounded-none border border-[#e6e6e6] border-l-4 bg-white shadow-[0_16px_40px_rgba(0,0,0,0.12)]",
      shellStyle: { borderLeftColor: accent },
      iconWrap: "rounded-none border-0 text-white",
      iconStyle: { background: accent },
      barStyle: { background: accent },
      glow: "",
      title: "text-[#2b2b2b]",
      description: "text-[#505050]",
      close: "rounded-none border border-[#e6e6e6] bg-white text-[#505050] hover:border-[#c51b1b] hover:bg-[#fff5f5] hover:text-[#c51b1b]",
      progress: "rounded-none"
    };
  }

  if (tone === "success") {
    return {
      icon: CheckCircle2,
      shell: "rounded-[26px] border border-[rgba(68,211,139,0.28)] bg-[linear-gradient(135deg,rgba(20,50,38,0.88),rgba(14,40,32,0.8))] shadow-[0_28px_100px_rgba(0,0,0,0.26)]",
      shellStyle: undefined,
      iconWrap: "rounded-[18px] border border-[rgba(68,211,139,0.28)] bg-[linear-gradient(180deg,rgba(68,211,139,0.22),rgba(68,211,139,0.12))] text-[rgb(193,255,223)]",
      iconStyle: undefined,
      barStyle: undefined,
      glow: "bg-[radial-gradient(circle,rgba(68,211,139,0.26),transparent_68%)]",
      title: "text-white",
      description: "text-[rgba(233,240,252,0.82)]",
      close: "rounded-full border border-white/12 bg-white/[0.03] text-[rgba(233,240,252,0.64)] hover:border-[rgba(68,211,139,0.3)] hover:bg-[rgba(68,211,139,0.12)] hover:text-white",
      progress: "rounded-full bg-[linear-gradient(90deg,#d2ffe6,#7ce8b0)]"
    };
  }

  if (tone === "error") {
    return {
      icon: CircleAlert,
      shell: "rounded-[26px] border border-[rgba(255,95,87,0.28)] bg-[linear-gradient(135deg,rgba(66,25,32,0.88),rgba(48,18,24,0.82))] shadow-[0_28px_100px_rgba(0,0,0,0.26)]",
      shellStyle: undefined,
      iconWrap: "rounded-[18px] border border-[rgba(255,95,87,0.28)] bg-[linear-gradient(180deg,rgba(255,95,87,0.22),rgba(255,95,87,0.12))] text-[rgb(255,213,209)]",
      iconStyle: undefined,
      barStyle: undefined,
      glow: "bg-[radial-gradient(circle,rgba(255,95,87,0.26),transparent_68%)]",
      title: "text-white",
      description: "text-[rgba(233,240,252,0.82)]",
      close: "rounded-full border border-white/12 bg-white/[0.03] text-[rgba(233,240,252,0.64)] hover:border-[rgba(255,95,87,0.3)] hover:bg-[rgba(255,95,87,0.12)] hover:text-white",
      progress: "rounded-full bg-[linear-gradient(90deg,#ffe5e2,#ff5f57)]"
    };
  }

  return {
    icon: Info,
      shell: "rounded-[26px] border border-[rgba(62,198,255,0.28)] bg-[linear-gradient(135deg,rgba(18,38,70,0.88),rgba(11,28,54,0.82))] shadow-[0_28px_100px_rgba(0,0,0,0.26)]",
      shellStyle: undefined,
    iconWrap: "rounded-[18px] border border-[rgba(62,198,255,0.28)] bg-[linear-gradient(180deg,rgba(62,198,255,0.22),rgba(62,198,255,0.12))] text-[rgb(205,247,255)]",
    iconStyle: undefined,
    barStyle: undefined,
    glow: "bg-[radial-gradient(circle,rgba(62,198,255,0.26),transparent_68%)]",
    title: "text-white",
    description: "text-[rgba(233,240,252,0.82)]",
    close: "rounded-full border border-white/12 bg-white/[0.03] text-[rgba(233,240,252,0.64)] hover:border-[rgba(62,198,255,0.3)] hover:bg-[rgba(62,198,255,0.12)] hover:text-white",
    progress: "rounded-full bg-[linear-gradient(90deg,#e5f9ff,#3ec6ff)]"
  };
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const shop = isShopRoute(pathname) || pathname.startsWith("/");
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
      <div className={`pointer-events-none fixed right-4 z-[180] flex w-[min(92vw,390px)] flex-col gap-3 sm:right-6 ${shop ? "top-24" : "top-4 sm:top-6"}`}>
        {toasts.map((toast) => {
          const styles = toneStyles(toast.tone, shop);
          const Icon = styles.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto relative overflow-hidden border px-4 py-4 backdrop-blur-xl [animation:toast-in-premium_320ms_cubic-bezier(.22,1,.36,1)] ${styles.shell}`}
              style={styles.shellStyle}
            >
              {styles.glow ? <div className={`pointer-events-none absolute -left-8 top-1/2 h-28 w-28 -translate-y-1/2 blur-2xl ${styles.glow}`} /> : null}
              <div className="relative flex items-start gap-3">
                <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center ${styles.iconWrap}`} style={styles.iconStyle}>
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold leading-6 ${styles.title}`}>{toast.title}</p>
                  {toast.description ? <p className={`mt-1 text-sm leading-6 ${styles.description}`}>{toast.description}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className={`p-2 transition ${styles.close}`}
                  aria-label="Закрити повідомлення"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className={`relative mt-3 h-[3px] overflow-hidden ${shop ? "bg-[#ececec]" : "bg-white/10"}`}>
                <div className={`h-full [animation:toast-progress_4200ms_linear_forwards] ${styles.progress}`} style={styles.barStyle} />
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