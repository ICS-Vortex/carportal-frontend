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
    void refreshSession().catch((error) => {
      const message = getApiErrorMessage(error);
      setStatus(message);
      toast.error(message);
    });
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Надсилаємо дані...");

    startTransition(() => {
      const action = mode === "register"
        ? registerWithEmail({ email, password, fullName })
        : loginWithEmail({ email, password });

      void action
        .then(async (user) => {
          setSession(user);
          setPassword("");
          setStatus(mode === "register" ? "Реєстрацію завершено." : "Вхід виконано.");
          toast.success(mode === "register" ? "Акаунт створено." : "Вхід виконано.");
          router.replace(nextHref);
          router.refresh();
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
            className={mode === value ? "btn-primary" : "btn-ghost"}
          >
            {label}
          </button>
        ))}
      </div>

      {session ? (
        <div className="rounded-[22px] border border-[var(--line)] bg-[rgba(197,27,27,0.06)] p-4 text-sm text-[var(--muted)]">
          Сесія відкрита для <span className="font-semibold text-[var(--foreground)]">{session.fullName}</span>
          <span className="mt-1 block text-xs">{session.email}</span>
        </div>
      ) : null}

      <form className="grid gap-4" onSubmit={handleSubmit}>
        {mode === "register" ? (
          <label htmlFor="full-name" className="flex flex-col gap-2 text-sm text-[var(--muted)]">
            Імʼя та прізвище
            <input
              id="full-name"
              name="fullName"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="field"
              placeholder="Імʼя та прізвище"
              required
            />
          </label>
        ) : null}
        <label htmlFor="email" className="flex flex-col gap-2 text-sm text-[var(--muted)]">
          Email
          <input
            id="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="field"
            placeholder="name@example.com"
            type="email"
            autoComplete="email"
            required
          />
        </label>
        <label htmlFor="password" className="flex flex-col gap-2 text-sm text-[var(--muted)]">
          Пароль
          <input
            id="password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="field"
            placeholder="Не менше 8 символів"
            type="password"
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            minLength={8}
            required
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            disabled={isPending}
            className="btn-primary"
          >
            {mode === "register" ? "Створити акаунт" : "Увійти"}
          </button>
          <GoogleSignIn
            onSuccess={async () => {
              await refreshSession("Вхід через Google виконано.");
              router.replace(nextHref);
              router.refresh();
            }}
            onStatus={setStatus}
          />
          {session ? (
            <>
              <button
                type="button"
                onClick={() => router.replace(nextHref)}
                className="btn-primary"
              >
                Перейти в кабінет
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isPending}
                className="btn-ghost"
              >
                Вийти
              </button>
            </>
          ) : null}
        </div>
      </form>

      <p className="text-sm leading-6 text-[var(--muted)]">{status}</p>
    </div>
  );
}
