"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Check, ChevronDown, X } from "lucide-react";

import { formatUah } from "@/lib/format-money";

type FancyMultiSelectOption = {
  value: string;
  label: string;
  description?: string | null;
};

type FancyMultiSelectProps = {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: FancyMultiSelectOption[];
  helper?: string;
  placeholder?: string;
  emptyMessage?: string;
  selectionTotalUah?: number | null;
};

function summarizeSelection(selected: FancyMultiSelectOption[], placeholder: string) {
  if (selected.length === 0) {
    return placeholder;
  }

  if (selected.length === 1) {
    return selected[0].label;
  }

  if (selected.length === 2) {
    return `${selected[0].label} та ${selected[1].label}`;
  }

  return `${selected[0].label}, ${selected[1].label} та ще ${selected.length - 2}`;
}

export function FancyMultiSelect({
  label,
  values,
  onChange,
  options,
  helper,
  placeholder = "Оберіть значення",
  emptyMessage = "Немає доступних варіантів.",
  selectionTotalUah = null
}: FancyMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selectedOptions = useMemo(() => options.filter((option) => values.includes(option.value)), [options, values]);
  const selectionText = summarizeSelection(selectedOptions, placeholder);
  const helperText = selectedOptions.length > 0
    ? `Обрано ${selectedOptions.length} ${selectedOptions.length === 1 ? "пункт" : selectedOptions.length < 5 ? "пункти" : "пунктів"}.`
    : helper;

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function toggleValue(value: string) {
    onChange(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  }

  return (
    <div ref={rootRef} className="relative flex flex-col gap-2 text-sm text-[var(--muted)]">
      <span>{label}</span>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`group relative w-full overflow-hidden border border-[#d5d5d5] bg-white text-left transition outline-none ${open ? "border-[#c51b1b] shadow-[0_0_0_1px_rgba(197,27,27,0.24)]" : ""}`}
        aria-expanded={open}
      >
        <div className="pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.05))]" />
        <div className="relative z-10 px-4 pb-3 pt-4 pr-12">
          <p className="text-base font-medium text-[var(--foreground)]">{selectionText}</p>
        </div>
        <div className="absolute right-4 top-4 z-10 text-[var(--muted)] transition group-hover:text-[var(--foreground)] group-aria-expanded:translate-y-0.5 group-aria-expanded:text-[var(--foreground)]">
          <ChevronDown className="h-5 w-5" />
        </div>
        {helperText ? (
          <div className="relative z-10 border-t border-[var(--line)] bg-black/10 px-4 pb-3 pt-2 text-xs leading-5 text-[var(--muted)]">
            {helperText}
          </div>
        ) : null}
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-[170] overflow-hidden border border-[#e4e4e4] bg-white shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
          <div className="max-h-80 space-y-1 overflow-y-auto p-2">
            {options.length === 0 ? (
              <div className="rounded-[16px] px-3 py-3 text-sm text-[var(--muted)]">{emptyMessage}</div>
            ) : (
              options.map((option) => {
                const active = values.includes(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleValue(option.value)}
                    className={`flex w-full items-start gap-3 px-3 py-3 text-left text-sm transition ${active ? "bg-[rgba(197,27,27,0.08)] text-[var(--foreground)]" : "text-[var(--muted)] hover:bg-[#f6f6f6] hover:text-[var(--foreground)]"}`}
                  >
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border ${active ? "border-[#c51b1b] bg-[rgba(197,27,27,0.08)] text-[#c51b1b]" : "border-[#d5d5d5] bg-white text-transparent"}`}>
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{option.label}</span>
                      {option.description ? <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{option.description}</span> : null}
                    </span>
                  </button>
                );
              })
            )}
          </div>
          <div className="flex items-center justify-between border-t border-[var(--line)] bg-black/15 px-4 py-3">
            <p className="text-xs leading-5 text-[var(--muted)]">
              {selectedOptions.length > 0 ? (
                <>
                  Обрано {selectedOptions.length} пунктів.
                  {selectionTotalUah !== null && selectionTotalUah > 0 ? (
                    <span className="mt-1 block font-semibold text-[var(--foreground)]">
                      Орієнтовно: {formatUah(selectionTotalUah)}
                    </span>
                  ) : null}
                </>
              ) : (
                "Ще нічого не обрано."
              )}
            </p>
            <div className="flex gap-2">
              {values.length > 0 ? (
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] transition hover:border-[#c51b1b] hover:text-[var(--foreground)]"
                >
                  <X className="h-3.5 w-3.5" />
                  Очистити
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="bg-[#c51b1b] px-3 py-1.5 text-xs font-semibold tracking-[0.06em] text-white uppercase"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}