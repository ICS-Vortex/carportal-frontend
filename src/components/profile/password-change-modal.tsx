"use client";

import { useEffect, useState, useTransition } from "react";

import { AppModal } from "@/components/shared/app-modal";
import { useToast } from "@/components/shared/toast-provider";
import { changePassword, getApiErrorMessage } from "@/lib/api";

const initialForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
};

type PasswordChangeModalProps = {
  open: boolean;
  hasPassword: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function PasswordChangeModal({ open, hasPassword, onClose, onSuccess }: PasswordChangeModalProps) {
  const [form, setForm] = useState(initialForm);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  useEffect(() => {
    if (!open) {
      setForm(initialForm);
    }
  }, [open]);

  function updateField(name: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Підтвердження пароля не збігається.");
      return;
    }

    startTransition(() => {
      void changePassword({
        currentPassword: hasPassword ? form.currentPassword : undefined,
        newPassword: form.newPassword
      })
        .then(() => {
          setForm(initialForm);
          toast.success(hasPassword ? "Пароль змінено." : "Пароль для входу створено.");
          onSuccess();
          onClose();
        })
        .catch((error) => {
          toast.error(getApiErrorMessage(error));
        });
    });
  }

  const title = hasPassword ? "Зміна пароля" : "Пароль для входу";
  const description = hasPassword
    ? "Підтвердіть поточний пароль і задайте новий — не менше 8 символів."
    : "Задайте пароль, щоб мати альтернативний вхід по email.";

  return (
    <AppModal open={open} title={title} description={description} onClose={onClose} maxWidthClassName="max-w-md">
      <form className="form-stack" onSubmit={handleSubmit}>
        {hasPassword ? (
          <label className="form-label">
            Поточний пароль
            <input
              value={form.currentPassword}
              onChange={(event) => updateField("currentPassword", event.target.value)}
              className="field"
              type="password"
              autoComplete="current-password"
              minLength={8}
              required
            />
          </label>
        ) : null}
        <label className="form-label">
          Новий пароль
          <input
            value={form.newPassword}
            onChange={(event) => updateField("newPassword", event.target.value)}
            className="field"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        <label className="form-label">
          Підтвердження
          <input
            value={form.confirmPassword}
            onChange={(event) => updateField("confirmPassword", event.target.value)}
            className="field"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        <div className="flex flex-wrap gap-3 pt-1">
          <button type="submit" disabled={isPending} className="btn-primary btn-sm btn-sentence">
            {isPending ? "Зберігаємо…" : hasPassword ? "Змінити пароль" : "Створити пароль"}
          </button>
          <button type="button" onClick={onClose} disabled={isPending} className="btn-ghost btn-sm btn-sentence">
            Скасувати
          </button>
        </div>
      </form>
    </AppModal>
  );
}
