"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { useToast } from "@/components/shared/toast-provider";
import { getApiErrorMessage, getSession, loginWithEmail, logout, registerWithEmail } from "@/lib/api";
import { APP_ROUTES } from "@/lib/routes";
import type { AuthUser } from "@/lib/types";

import { GoogleSignIn } from "./google-sign-in";

type Mode = "login" | "register";

type AuthPanelProps = {
  nextHref?: string;
};

export function AuthPanel({ nextHref = APP_ROUTES.dashboard }: AuthPanelProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [session, setSession] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<string>("Перевіряємо сесію...");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  async function refreshSession(nextStatus?: string) {
    const user = await getSession();
    setSession(user);
    setStatus(nextStatus ?? (user ? "Сесія активна." : "Ще не виконано вхід."));
  }

  useEffect(() => {
    void refreshSession()
      .catch((error) => {
        const message = getApiErrorMessage(error);
        setStatus(message);
        toast.error(message);
      });
  }, [toast]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Надсилаємо дані...");

    startTransition(() => {
      const action = mode === "register"
        ? registerWithEmail({ email, password, fullName })
        : loginWithEmail({ email, password });

      void action
        .then(async () => {
          await refreshSession(mode === "register" ? "Реєстрацію завершено." : "Вхід виконано.");
          setPassword("");
          toast.success(mode === "register" ? "Акаунт створено." : "Вхід виконано.");
          router.replace(nextHref);
        })
        .catch((error) => {
          const message = getApiErrorMessage(error);
          setStatus(message);
          toast.error(message);
        });
    });
  }

  function handleLogout() {
    setStatus("Завершуємо сесію...");

    startTransition(() => {
      void logout()
        .then(() => {
          setSession(null);
          setStatus("Ви вийшли з кабінету.");
          toast.success("Сесію завершено.");
          router.replace(APP_ROUTES.home);
        })
        .catch((error) => {
          const message = getApiErrorMessage(error);
          setStatus(message);
          toast.error(message);
        });
    });
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-3">
        {[
          ["login", "Вхід"],
          ["register", "Реєстрація"]
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value as Mode)}
            className={mode === value
              ? "rounded-full bg-[linear-gradient(135deg,#4f84ff,#4ccfff)] px-4 py-2 text-sm font-semibold text-slate-950"
              : "rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white"
            }
          >
            {label}
          </button>
        ))}
      </div>

      {session ? (
        <div className="rounded-[22px] border border-[rgba(76,207,255,0.2)] bg-[rgba(76,207,255,0.08)] p-4 text-sm text-[var(--muted)]">
          Активна сесія для <span className="font-semibold text-white">{session.email}</span>{" "}
          <span className="text-[var(--accent-cyan)]">· {session.role === "admin" ? "адміністратор" : "водій"}</span>
        </div>
      ) : null}

      <form className="grid gap-4" onSubmit={handleSubmit}>
        {mode === "register" ? (
          <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
            Імʼя та прізвище
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[var(--accent-cyan)]"
              placeholder="Імʼя та прізвище"
              required
            />
          </label>
        ) : null}
        <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
          Email
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[var(--accent-cyan)]"
            placeholder="name@example.com"
            type="email"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
          Пароль
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[var(--accent-cyan)]"
            placeholder="Не менше 8 символів"
            type="password"
            minLength={8}
            required
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            disabled={isPending}
            className="rounded-full bg-[linear-gradient(135deg,#4f84ff,#4ccfff)] px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60"
          >
            {mode === "register" ? "Створити акаунт" : "Увійти"}
          </button>
          <GoogleSignIn
            onSuccess={async () => {
              await refreshSession("Вхід через Google виконано.");
              router.replace(nextHref);
            }}
            onStatus={setStatus}
          />
          {session ? (
            <button
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              Вийти
            </button>
          ) : null}
        </div>
      </form>

      <p className="text-sm leading-6 text-[var(--muted)]">{status}</p>
    </div>
  );
}
