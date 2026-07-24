"use client";

import { AppModal } from "@/components/shared/app-modal";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Підтвердити",
  cancelLabel = "Скасувати",
  tone = "default",
  busy = false,
  onConfirm,
  onClose
}: ConfirmModalProps) {
  return (
    <AppModal open={open} title={title} description={description} onClose={onClose} maxWidthClassName="max-w-lg">
      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[var(--muted)] transition hover:border-white/20 hover:text-white"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onConfirm}
          className={tone === "danger"
            ? "rounded-full border border-[rgba(255,95,87,0.35)] bg-[rgba(120,24,24,0.45)] px-4 py-2 text-sm font-semibold text-[rgba(255,221,217,1)] disabled:opacity-60"
            : "rounded-full bg-[linear-gradient(135deg,#4f84ff,#4ccfff)] px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
          }
        >
          {confirmLabel}
        </button>
      </div>
    </AppModal>
  );
}