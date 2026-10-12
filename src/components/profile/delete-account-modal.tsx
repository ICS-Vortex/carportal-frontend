"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { AppModal } from "@/components/shared/app-modal";
import { useToast } from "@/components/shared/toast-provider";
import { deleteAccount, getApiErrorMessage } from "@/lib/api";
import { APP_ROUTES } from "@/lib/routes";

type DeleteAccountModalProps = {
  open: boolean;
  hasPassword: boolean;
  onClose: () => void;
};

export function DeleteAccountModal({ open, hasPassword, onClose }: DeleteAccountModalProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmationText, setConfirmationText] = useState("");
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  useEffect(() => {
    if (!open) {
      setPassword("");
      setConfirmationText("");
    }
  }, [open]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(() => {
      void deleteAccount({
        confirmationText,
        password: hasPassword ? password : undefined
      })
        .then(() => {
          toast.success("Акаунт деактивовано.");
          onClose();
          router.replace(APP_ROUTES.home);
          router.refresh();
        })
        .catch((error) => {
          toast.error(getApiErrorMessage(error));
        });
    });
  }

  return (
    <AppModal
      open={open}
      title="Закриття акаунта"
      description="Вхід буде заблоковано. Історія авто залишиться в обліку, але кабінет для вас закриється."
      onClose={onClose}
      maxWidthClassName="max-w-md"
    >
      <p className="mb-4 border border-[rgba(197,27,27,0.25)] bg-[rgba(197,27,27,0.06)] px-3 py-3 text-sm leading-6 text-[var(--muted)]">
        Акаунт буде деактивовано: вхід заблокується. Журнал сервісу та дані по авто залишаться в обліку за потреби звітності.
      </p>

      <form className="form-stack" onSubmit={handleSubmit}>
        {hasPassword ? (
          <label className="form-label">
            Поточний пароль
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field"
              type="password"
              autoComplete="current-password"
              minLength={8}
              required
            />
          </label>
        ) : null}
        <label className="form-label">
          Для підтвердження введіть слово ВИДАЛИТИ
          <input
            value={confirmationText}
            onChange={(event) => setConfirmationText(event.target.value)}
            className="field"
            placeholder="ВИДАЛИТИ"
            required
          />
        </label>
        <div className="flex flex-wrap gap-3 pt-1">
          <button type="submit" disabled={isPending} className="btn-danger btn-sm btn-sentence">
            {isPending ? "Видаляємо…" : "Видалити акаунт"}
          </button>
          <button type="button" onClick={onClose} disabled={isPending} className="btn-ghost btn-sm btn-sentence">
            Скасувати
          </button>
        </div>
      </form>
    </AppModal>
  );
}
