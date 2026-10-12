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
          className="btn-ghost"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onConfirm}
          className={tone === "danger" ? "btn-danger" : "btn-primary"}
        >
          {confirmLabel}
        </button>
      </div>
    </AppModal>
  );
}