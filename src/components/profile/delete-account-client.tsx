"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

import { useToast } from "@/components/shared/toast-provider";
import { deleteAccount, getApiErrorMessage, getSession } from "@/lib/api";
import { APP_ROUTES } from "@/lib/routes";
import type { AuthUser } from "@/lib/types";

export function DeleteAccountClient() {
  const router = useRouter();
  const [session, setSession] = useState<AuthUser | null>(null);
  const [password, setPassword] = useState("");
  const [confirmationText, setConfirmationText] = useState("");
  const [status, setStatus] = useState("Підготуйте підтвердження для видалення акаунта.");
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  useEffect(() => {
    void getSession()
      .then((user) => setSession(user))
      .catch((error) => {
        const message = getApiErrorMessage(error);
        setStatus(message);
        toast.error(message);
      });
  }, [toast]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Видаляємо акаунт...");

    startTransition(() => {
      void deleteAccount({
        confirmationText,
        password: session?.hasPassword ? password : undefined
      })
        .then(() => {
          setStatus("Акаунт деактивовано. Повертаємо на головну...");
          toast.success("Акаунт деактивовано.");
          router.replace("/");
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
        {session?.hasPassword ? (
          <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
            Поточний пароль
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field"
              type="password"
              minLength={8}
              required
            />
          </label>
        ) : null}
        <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
          Для підтвердження введіть слово ВИДАЛИТИ
          <input
            value={confirmationText}
            onChange={(event) => setConfirmationText(event.target.value)}
            className="field"
            placeholder="ВИДАЛИТИ"
            required
          />
        </label>
        <button
          disabled={isPending}
          className="btn-danger w-fit"
        >
          Видалити акаунт
        </button>
      </form>

      <div className="space-y-4">
        <div className="rounded-[22px] border border-[rgba(255,143,76,0.25)] bg-[rgba(255,143,76,0.08)] p-5 text-sm leading-6 text-[var(--muted)]">
          Акаунт буде деактивовано умовно: вхід заблокується, але історичні дані по авто, сервісу та прив’язаних діях залишаться в системі.
        </div>
        <Link
          href={APP_ROUTES.profile}
          className="btn-ghost w-fit"
        >
          Назад до профілю
        </Link>
        <p className="text-sm leading-6 text-[var(--muted)]">{status}</p>
      </div>
    </div>
  );
}