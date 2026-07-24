"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Check, ChevronDown, X } from "lucide-react";

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
  emptyMessage = "Немає доступних варіантів."
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
        className={`group relative w-full overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.035))] text-left shadow-[0_18px_48px_rgba(0,0,0,0.18)] transition outline-none ${open ? "border-[rgba(76,207,255,0.58)] shadow-[0_0_0_1px_rgba(76,207,255,0.24)]" : ""}`}
        aria-expanded={open}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(76,207,255,0.16),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_60%)] opacity-90" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.05))]" />
        <div className="relative z-10 px-4 pb-3 pt-4 pr-12">
          <p className="text-base font-medium text-white">{selectionText}</p>
        </div>
        <div className="absolute right-4 top-4 z-10 text-[var(--muted)] transition group-hover:text-white group-aria-expanded:translate-y-0.5 group-aria-expanded:text-white">
          <ChevronDown className="h-5 w-5" />
        </div>
        {helperText ? (
          <div className="relative z-10 border-t border-white/8 bg-black/10 px-4 pb-3 pt-2 text-xs leading-5 text-[var(--muted)]">
            {helperText}
          </div>
        ) : null}
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-[170] overflow-hidden rounded-[22px] border border-white/10 bg-[rgba(8,20,38,0.96)] shadow-[0_28px_100px_rgba(0,0,0,0.42)] backdrop-blur-xl">
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
                    className={`flex w-full items-start gap-3 rounded-[16px] px-3 py-3 text-left text-sm transition ${active ? "bg-[rgba(76,207,255,0.18)] text-white" : "text-[var(--muted)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white"}`}
                  >
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${active ? "border-[rgba(76,207,255,0.45)] bg-[rgba(76,207,255,0.16)] text-[var(--accent-cyan)]" : "border-white/10 bg-white/5 text-transparent"}`}>
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
          <div className="flex items-center justify-between border-t border-white/8 bg-black/15 px-4 py-3">
            <p className="text-xs leading-5 text-[var(--muted)]">
              {selectedOptions.length > 0 ? `Обрано ${selectedOptions.length} пунктів.` : "Ще нічого не обрано."}
            </p>
            <div className="flex gap-2">
              {values.length > 0 ? (
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-[var(--muted)] transition hover:border-white/20 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                  Очистити
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full bg-[linear-gradient(135deg,#4f84ff,#4ccfff)] px-3 py-1.5 text-xs font-semibold text-slate-950"
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