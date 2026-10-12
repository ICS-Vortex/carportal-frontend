"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { useToast } from "@/components/shared/toast-provider";
import { getApiErrorMessage, getSession, logout, updateProfile } from "@/lib/api";
import { APP_ROUTES } from "@/lib/routes";
import type { AuthUser } from "@/lib/types";

const initialForm = {
  email: "",
  fullName: "",
  avatarUrl: ""
};

export function ProfileDetailsClient() {
  const router = useRouter();
  const [session, setSession] = useState<AuthUser | null>(null);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("Завантажуємо профіль...");
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  async function refreshSession(nextStatus?: string) {
    const user = await getSession();
    setSession(user);
    setForm({
      email: user?.email ?? "",
      fullName: user?.fullName ?? "",
      avatarUrl: user?.avatarUrl ?? ""
    });
    setStatus(nextStatus ?? "Дані профілю синхронізовано.");
  }

  useEffect(() => {
    void refreshSession().catch((error) => {
      const message = getApiErrorMessage(error);
      setStatus(message);
      toast.error(message);
    });
  }, [toast]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Зберігаємо зміни...");

    startTransition(() => {
      void updateProfile({ email: form.email, fullName: form.fullName, avatarUrl: form.avatarUrl || null })
        .then(async () => {
          await refreshSession("Профіль оновлено.");
          toast.success("Профіль оновлено.");
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
          toast.success("Сесію завершено.");
          router.replace(APP_ROUTES.home);
          router.refresh();
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
        <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
          Імʼя та прізвище
          <input
            value={form.fullName}
            onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
            className="field"
            placeholder="Імʼя та прізвище"
            minLength={2}
            maxLength={120}
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
          Email
          <input
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="field"
            placeholder="name@example.com"
            type="email"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
          URL аватара
          <input
            value={form.avatarUrl}
            onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))}
            className="field"
            placeholder="https://example.com/avatar.jpg"
            type="url"
          />
        </label>
        <button
          disabled={isPending}
          className="btn-primary w-fit"
        >
          Зберегти профіль
        </button>
      </form>

      <div className="space-y-4">
        <div className="rounded-[22px] border border-[var(--line)] bg-white/4 p-5">
          {session?.avatarUrl ? (
            <img src={session.avatarUrl} alt={session.fullName} className="h-20 w-20 rounded-2xl object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[var(--line)] bg-white/5 text-2xl font-semibold text-[var(--foreground)]">
              {(session?.fullName ?? "U").charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="rounded-[22px] border border-[var(--line)] bg-white/4 p-5 text-sm leading-6 text-[var(--muted)]">
          <p className="font-semibold text-[var(--foreground)]">Стан акаунта</p>
          <p className="mt-3">Пароль: <span className="text-[var(--foreground)]">{session?.hasPassword ? "задано" : "ще не встановлено"}</span></p>
          <p className="mt-2">Google: <span className="text-[var(--foreground)]">{session?.hasGoogleAccount ? "підключено" : "ще не підключено"}</span></p>
        </div>
        <div className="rounded-[22px] border border-[rgba(197,27,27,0.22)] bg-[rgba(197,27,27,0.06)] p-5 text-sm leading-6 text-[var(--muted)]">
          Після зміни email наступні входи по email/паролю потрібно виконувати вже з новою адресою.
        </div>
        <Link
          href={APP_ROUTES.profilePassword}
          className="btn-ghost w-fit"
        >
          Перейти до зміни пароля
        </Link>
        <Link
          href={APP_ROUTES.profileDelete}
          className="btn-danger w-fit"
        >
          Видалити акаунт
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isPending}
          className="btn-ghost w-fit"
        >
          Вийти з профілю
        </button>
        <p className="text-sm leading-6 text-[var(--muted)]">{status}</p>
      </div>
    </div>
  );
}