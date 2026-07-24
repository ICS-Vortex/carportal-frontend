"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

import { useToast } from "@/components/shared/toast-provider";
import { changePassword, getApiErrorMessage, getSession } from "@/lib/api";
import { APP_ROUTES } from "@/lib/routes";
import type { AuthUser } from "@/lib/types";

const initialForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
};

export function PasswordChangeClient() {
  const [session, setSession] = useState<AuthUser | null>(null);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("Перевіряємо налаштування акаунта...");
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  useEffect(() => {
    void getSession()
      .then((user) => {
        setSession(user);
        setStatus(user?.hasPassword ? "Вкажіть поточний і новий пароль." : "Для цього акаунта можна створити пароль для входу по email.");
      })
      .catch((error) => {
        const message = getApiErrorMessage(error);
        setStatus(message);
        toast.error(message);
      });
  }, [toast]);

  function updateField(name: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      const message = "Підтвердження пароля не збігається.";
      setStatus(message);
      toast.error(message);
      return;
    }

    setStatus(session?.hasPassword ? "Оновлюємо пароль..." : "Створюємо пароль для входу...");

    startTransition(() => {
      void changePassword({
        currentPassword: session?.hasPassword ? form.currentPassword : undefined,
        newPassword: form.newPassword
      })
        .then(() => {
          setForm(initialForm);
          setStatus(session?.hasPassword ? "Пароль змінено." : "Пароль створено. Тепер можна входити і через email/пароль.");
          setSession((current) => (current ? { ...current, hasPassword: true } : current));
          toast.success(session?.hasPassword ? "Пароль змінено." : "Пароль для входу створено.");
        })
        .catch((error) => {
          const message = getApiErrorMessage(error);
          setStatus(message);
          toast.error(message);
        });
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <form className="grid gap-4" onSubmit={handleSubmit}>
        {session?.hasPassword ? (
          <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
            Поточний пароль
            <input
              value={form.currentPassword}
              onChange={(event) => updateField("currentPassword", event.target.value)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[var(--accent-cyan)]"
              type="password"
              minLength={8}
              required
            />
          </label>
        ) : null}
        <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
          Новий пароль
          <input
            value={form.newPassword}
            onChange={(event) => updateField("newPassword", event.target.value)}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[var(--accent-cyan)]"
            type="password"
            minLength={8}
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
          Підтвердження нового пароля
          <input
            value={form.confirmPassword}
            onChange={(event) => updateField("confirmPassword", event.target.value)}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[var(--accent-cyan)]"
            type="password"
            minLength={8}
            required
          />
        </label>
        <button
          disabled={isPending}
          className="w-fit rounded-full bg-[linear-gradient(135deg,#4f84ff,#4ccfff)] px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60"
        >
          {session?.hasPassword ? "Змінити пароль" : "Створити пароль"}
        </button>
      </form>

      <div className="space-y-4">
        <div className="rounded-[22px] border border-white/8 bg-white/4 p-5 text-sm leading-6 text-[var(--muted)]">
          {session?.hasPassword
            ? "Для безпеки підтвердіть поточний пароль, а потім задайте новий."
            : "Акаунт, створений через Google, може окремо отримати пароль для альтернативного входу по email."}
        </div>
        <div className="rounded-[22px] border border-[rgba(255,143,76,0.2)] bg-[rgba(255,143,76,0.08)] p-5 text-sm leading-6 text-[var(--muted)]">
          Рекомендується використовувати пароль від 8 символів і не повторювати його в інших сервісах.
        </div>
        <Link
          href={APP_ROUTES.profile}
          className="inline-flex w-fit rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-[rgba(76,207,255,0.4)] hover:text-[var(--accent-cyan)]"
        >
          Назад до профілю
        </Link>
        <p className="text-sm leading-6 text-[var(--muted)]">{status}</p>
      </div>
    </div>
  );
}