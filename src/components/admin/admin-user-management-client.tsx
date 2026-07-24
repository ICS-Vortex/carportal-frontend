"use client";

import { useEffect, useState, useTransition } from "react";

import { useToast } from "@/components/shared/toast-provider";
import { getAdminUsers, getApiErrorMessage, updateAdminUser } from "@/lib/api";
import type { AdminManagedUser } from "@/lib/types";

function userStateLabel(user: AdminManagedUser): string {
  if (user.deleted) {
    return "деактивований";
  }

  if (user.is_blocked) {
    return "заблокований";
  }

  return "активний";
}

function userStateClass(user: AdminManagedUser): string {
  if (user.deleted) {
    return "border-[rgba(255,95,87,0.3)] bg-[rgba(255,95,87,0.1)] text-[rgba(255,180,173,1)]";
  }

  if (user.is_blocked) {
    return "border-[rgba(255,143,76,0.3)] bg-[rgba(255,143,76,0.1)] text-[rgba(255,214,194,1)]";
  }

  return "border-[rgba(76,207,255,0.24)] bg-[rgba(76,207,255,0.08)] text-white";
}

export function AdminUserManagementClient() {
  const [users, setUsers] = useState<AdminManagedUser[]>([]);
  const [status, setStatus] = useState("Завантажуємо користувачів...");
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  async function refresh(nextStatus?: string) {
    try {
      const payload = await getAdminUsers();
      setUsers(payload);
      setStatus(nextStatus ?? "Користувачів синхронізовано.");
    } catch (error) {
      const message = getApiErrorMessage(error);
      setStatus(message);
      toast.error(message);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  function mutateUser(userId: string, input: { role?: "user" | "admin"; isBlocked?: boolean; deleted?: boolean }, pendingStatus: string, doneStatus: string) {
    setStatus(pendingStatus);

    startTransition(() => {
      void updateAdminUser(userId, input)
        .then(async () => {
          await refresh(doneStatus);
          toast.success(doneStatus);
        })
        .catch((error) => {
          const message = getApiErrorMessage(error);
          setStatus(message);
          toast.error(message);
        });
    });
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <article key={user.id} className="rounded-[20px] border border-white/8 bg-white/4 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-white">{user.full_name}</h3>
                <span className={`rounded-full border px-3 py-1 text-xs ${userStateClass(user)}`}>{userStateLabel(user)}</span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white">{user.role === "admin" ? "адміністратор" : "водій"}</span>
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">{user.email}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Зареєстровано {new Date(user.created_at).toLocaleDateString("uk-UA")} · {user.vehicles_count} авто</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isPending || user.deleted}
                onClick={() => mutateUser(user.id, { isBlocked: !user.is_blocked }, user.is_blocked ? "Знімаємо блокування..." : "Блокуємо користувача...", user.is_blocked ? "Користувача розблоковано." : "Користувача заблоковано.")}
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {user.is_blocked ? "Розблокувати" : "Заблокувати"}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => mutateUser(user.id, { role: user.role === "admin" ? "user" : "admin" }, "Оновлюємо роль...", "Роль користувача оновлено.")}
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {user.role === "admin" ? "Зробити водієм" : "Зробити адміністратором"}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => mutateUser(user.id, user.deleted ? { deleted: false, isBlocked: false } : { deleted: true }, user.deleted ? "Відновлюємо користувача..." : "Деактивуємо користувача...", user.deleted ? "Користувача відновлено." : "Користувача деактивовано.")}
                className="rounded-full border border-[rgba(255,95,87,0.3)] px-4 py-2 text-sm font-semibold text-[rgba(255,180,173,1)] disabled:opacity-50"
              >
                {user.deleted ? "Відновити" : "Деактивувати"}
              </button>
            </div>
          </div>
        </article>
      ))}

      <p className="text-sm leading-6 text-[var(--muted)]">{status}</p>
    </div>
  );
}