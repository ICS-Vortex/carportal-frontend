"use client";

import type { ReactNode } from "react";

import { AppModal } from "@/components/shared/app-modal";

type AdminModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
};

export function AdminModal({ open, title, description, onClose, children }: AdminModalProps) {
  return (
    <AppModal open={open} title={title} description={description} onClose={onClose} maxWidthClassName="max-w-xl lg:max-w-2xl">
      {children}
    </AppModal>
  );
}