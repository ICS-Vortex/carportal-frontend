"use client";

import { useEffect, useState, useTransition } from "react";

import { useToast } from "@/components/shared/toast-provider";
import { getAdminOverview, getApiErrorMessage, resolveAdminMissingPlanRequest } from "@/lib/api";
import type { AdminOverviewResponse } from "@/lib/types";

export function AdminOverviewClient() {
  const [overview, setOverview] = useState<AdminOverviewResponse | null>(null);
  const [status, setStatus] = useState("Завантажуємо огляд платформи...");
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  async function refresh() {
    return getAdminOverview()
      .then((payload) => {
        setOverview(payload);
        setStatus("Огляд платформи синхронізовано.");
      })
      .catch((error) => {
        const message = getApiErrorMessage(error);
        setStatus(message);
        toast.error(message);
      });
  }

  useEffect(() => {
    void refresh();
  }, [toast]);

  function handleResolveRequest(requestId: string) {
    setStatus("Закриваємо запит...");

    startTransition(() => {
      void resolveAdminMissingPlanRequest(requestId)
        .then(async () => {
          await refresh();
          setStatus("Запит закрито.");
          toast.success("Запит закрито", "Цей автомобіль більше не показується в списку відкритих звернень.");
        })
        .catch((error) => {
          const message = getApiErrorMessage(error);
          setStatus(message);
          toast.error(message);
        });
    });
  }

  const stats = overview?.stats;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {[
          ["Користувачі", stats?.users_count ?? "0"],
          ["Заблоковані", stats?.blocked_users_count ?? "0"],
          ["Деактивовані", stats?.deleted_users_count ?? "0"],
          ["Авто", stats?.vehicles_count ?? "0"],
          ["Сервісні записи", stats?.service_logs_count ?? "0"],
          ["Нагадування", stats?.reminders_count ?? "0"],
          ["Запити на план", stats?.missing_plan_requests_count ?? "0"],
          ["Шаблони", stats?.templates_count ?? "0"],
          ["Процедури", stats?.procedures_count ?? "0"]
        ].map(([label, value]) => (
          <div key={label} className="rounded-[22px] border border-white/8 bg-white/4 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
        <h3 className="text-xl font-semibold text-white">Авто без готового регламенту</h3>
        <div className="mt-4 space-y-3">
          {(overview?.missingPlanRequests ?? []).length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-white/10 bg-black/10 p-4 text-sm leading-6 text-[var(--muted)]">
              Нових запитів немає. Коли водій повідомить про відсутній план, це з’явиться тут.
            </div>
          ) : (overview?.missingPlanRequests ?? []).map((request) => (
            <article key={request.id} className="rounded-[18px] border border-white/8 bg-black/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-white">{request.vehicle_name} {request.vehicle_year}</h4>
                  <p className="mt-1 text-sm text-[var(--muted)]">{request.user_full_name} · {request.user_email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {request.generation_name ? <span className="rounded-full border border-white/10 px-3 py-2 text-xs text-white">{request.generation_name}</span> : null}
                  {request.configuration_label ? <span className="rounded-full border border-white/10 px-3 py-2 text-xs text-white">{request.configuration_label}</span> : null}
                  <span className="rounded-full border border-[rgba(255,143,76,0.24)] px-3 py-2 text-xs text-[rgba(255,214,194,1)]">{new Date(request.created_at).toLocaleDateString("uk-UA")}</span>
                  <button
                    type="button"
                    onClick={() => handleResolveRequest(request.id)}
                    disabled={isPending}
                    className="rounded-full bg-[linear-gradient(135deg,#4f84ff,#4ccfff)] px-3 py-2 text-xs font-semibold text-slate-950 disabled:opacity-60"
                  >
                    Закрити запит
                  </button>
                </div>
              </div>
              {request.request_note ? <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{request.request_note}</p> : null}
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
        <h3 className="text-xl font-semibold text-white">Останні користувачі</h3>
        <div className="mt-4 space-y-3">
          {(overview?.users ?? []).map((user) => (
            <article key={user.id} className="rounded-[18px] border border-white/8 bg-black/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-white">{user.full_name}</h4>
                  <p className="mt-1 text-sm text-[var(--muted)]">{user.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 px-3 py-2 text-xs text-white">{user.deleted ? "деактивований" : user.is_blocked ? "заблокований" : "активний"}</span>
                  <span className="rounded-full border border-white/10 px-3 py-2 text-xs text-white">{user.role === "admin" ? "адміністратор" : "водій"}</span>
                  <span className="rounded-full border border-white/10 px-3 py-2 text-xs text-white">{user.vehicles_count} авто</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <p className="text-sm leading-6 text-[var(--muted)]">{status}</p>
    </div>
  );
}