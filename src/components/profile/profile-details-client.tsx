"use client";

import { Camera, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { DeleteAccountModal } from "@/components/profile/delete-account-modal";
import { PasswordChangeModal } from "@/components/profile/password-change-modal";
import { useToast } from "@/components/shared/toast-provider";
import { getApiErrorMessage, getSession, logout, updateProfile, uploadAvatarImage } from "@/lib/api";
import { APP_ROUTES } from "@/lib/routes";
import type { AuthUser } from "@/lib/types";

const initialForm = {
  email: "",
  fullName: ""
};

function profileDisplayName(fullName: string | null | undefined): string {
  const cleaned = (fullName ?? "")
    .replace(/\bundefined\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || "Власник";
}

export function ProfileDetailsClient() {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [session, setSession] = useState<AuthUser | null>(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  async function refreshSession() {
    const user = await getSession();
    setSession(user);
    setForm({
      email: user?.email ?? "",
      fullName: user?.fullName ?? ""
    });
  }

  useEffect(() => {
    void refreshSession()
      .catch((error) => {
        toast.error(getApiErrorMessage(error));
      })
      .finally(() => setLoading(false));
  }, [toast]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(() => {
      void updateProfile({ email: form.email, fullName: form.fullName })
        .then(async () => {
          await refreshSession();
          toast.success("Профіль оновлено.");
        })
        .catch((error) => {
          toast.error(getApiErrorMessage(error));
        });
    });
  }

  function handleLogout() {
    startTransition(() => {
      void logout()
        .then(() => {
          setSession(null);
          toast.success("Сесію завершено.");
          router.replace(APP_ROUTES.home);
          router.refresh();
        })
        .catch((error) => {
          toast.error(getApiErrorMessage(error));
        });
    });
  }

  function handleAvatarSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Підтримуються лише JPG, PNG та WEBP.");
      return;
    }

    const reader = new FileReader();
    setIsUploadingAvatar(true);
    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        setIsUploadingAvatar(false);
        toast.error("Не вдалося прочитати файл.");
        return;
      }

      void uploadAvatarImage({ dataUrl: result })
        .then(async (user) => {
          setSession(user);
          toast.success("Фото профілю оновлено.");
          router.refresh();
        })
        .catch((error) => {
          toast.error(getApiErrorMessage(error));
        })
        .finally(() => setIsUploadingAvatar(false));
    };
    reader.onerror = () => {
      setIsUploadingAvatar(false);
      toast.error("Не вдалося прочитати файл.");
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveAvatar() {
    startTransition(() => {
      void updateProfile({ email: form.email, fullName: form.fullName, avatarUrl: null })
        .then(async () => {
          await refreshSession();
          toast.success("Фото профілю прибрано.");
          router.refresh();
        })
        .catch((error) => {
          toast.error(getApiErrorMessage(error));
        });
    });
  }

  const displayName = profileDisplayName(session?.fullName);
  const avatarUrl = session?.avatarUrl ?? null;

  return (
    <>
      <article className="overflow-hidden border border-[var(--line)] bg-[var(--panel-strong)]">
        <div className="grid lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="relative min-h-[200px] bg-[linear-gradient(160deg,#3c3c3c,#111111)] lg:min-h-full">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="flex h-full min-h-[200px] items-end p-6">
                <span className="display text-5xl text-[var(--accent-strong)]">{displayName.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div className="absolute bottom-3 right-3 flex gap-2">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleAvatarSelection}
                disabled={loading || isUploadingAvatar}
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={loading || isUploadingAvatar}
                aria-label="Змінити фото"
                title="Змінити фото"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/55 text-white shadow-sm backdrop-blur-sm transition hover:border-white/60 hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
              {avatarUrl ? (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={loading || isUploadingAvatar || isPending}
                  aria-label="Прибрати фото"
                  title="Прибрати фото"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/55 text-white shadow-sm backdrop-blur-sm transition hover:border-[#f5a8a8] hover:bg-[rgba(197,27,27,0.75)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>

          <div className="p-6">
            <p className="eyebrow">Обліковий запис</p>
            <h2 className="display mt-2 text-3xl text-[var(--foreground)] sm:text-4xl">{displayName}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{session?.email ?? "—"}</p>

            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="border border-[var(--line)] bg-white/3 px-4 py-3">
                <dt className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">Пароль</dt>
                <dd className="mt-1 text-sm font-medium text-[var(--foreground)]">
                  {session?.hasPassword ? "Задано" : "Не встановлено"}
                </dd>
              </div>
              <div className="border border-[var(--line)] bg-white/3 px-4 py-3">
                <dt className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">Google</dt>
                <dd className="mt-1 text-sm font-medium text-[var(--foreground)]">
                  {session?.hasGoogleAccount ? "Підключено" : "Не підключено"}
                </dd>
              </div>
            </dl>

            <form className="mt-6 border-t border-[var(--line)] pt-6" onSubmit={handleSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="form-label sm:col-span-1">
                  Імʼя та прізвище
                  <input
                    value={form.fullName}
                    onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                    className="field"
                    placeholder="Імʼя та прізвище"
                    minLength={2}
                    maxLength={120}
                    required
                    disabled={loading}
                  />
                </label>
                <label className="form-label sm:col-span-1">
                  Email
                  <input
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    className="field"
                    placeholder="name@example.com"
                    type="email"
                    required
                    disabled={loading}
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button type="submit" disabled={isPending || loading} className="btn-primary btn-sm btn-sentence">
                  {isPending ? "Зберігаємо…" : "Зберегти"}
                </button>
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(true)}
                  disabled={loading}
                  className="btn-ghost btn-sm btn-sentence"
                >
                  {session?.hasPassword ? "Змінити пароль" : "Задати пароль"}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isPending || loading}
                  className="btn-ghost btn-sm btn-sentence"
                >
                  Вийти
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(true)}
                  disabled={loading}
                  className="btn-danger btn-sm btn-sentence sm:ml-auto"
                >
                  Видалити акаунт
                </button>
              </div>
            </form>
          </div>
        </div>
      </article>

      <PasswordChangeModal
        open={passwordModalOpen}
        hasPassword={Boolean(session?.hasPassword)}
        onClose={() => setPasswordModalOpen(false)}
        onSuccess={() => {
          void refreshSession();
        }}
      />
      <DeleteAccountModal
        open={deleteModalOpen}
        hasPassword={Boolean(session?.hasPassword)}
        onClose={() => setDeleteModalOpen(false)}
      />
    </>
  );
}
