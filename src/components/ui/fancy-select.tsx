"use client";

import { useId } from "react";

import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

type FancySelectOption = {
  value: string;
  label: string;
  description?: string | null;
};

type FancySelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FancySelectOption[];
  helper?: string;
  accent?: "cyan" | "amber";
  required?: boolean;
  placeholder?: string;
};

export function FancySelect({ label, value, onChange, options, helper, accent = "cyan", required = false, placeholder }: FancySelectProps) {
  const triggerId = useId();
  const descriptionId = useId();
  const accentClass = accent === "amber"
    ? "data-[state=open]:border-[rgba(255,143,76,0.58)] data-[state=open]:shadow-[0_0_0_1px_rgba(255,143,76,0.24)]"
    : "data-[state=open]:border-[rgba(76,207,255,0.58)] data-[state=open]:shadow-[0_0_0_1px_rgba(76,207,255,0.24)]";
  const itemAccentClass = accent === "amber"
    ? "data-[highlighted]:bg-[rgba(255,143,76,0.16)] data-[highlighted]:text-white"
    : "data-[highlighted]:bg-[rgba(76,207,255,0.16)] data-[highlighted]:text-white";
  const current = options.find((item) => item.value === value) ?? null;
  const helperText = helper ?? current?.description;

  return (
    <div className="flex flex-col gap-2 text-sm text-[var(--muted)]">
      <span id={triggerId} className="text-sm text-[var(--muted)]">{label}</span>
      <Select.Root value={current?.value ?? value} onValueChange={onChange} required={required}>
        <Select.Trigger aria-labelledby={triggerId} aria-describedby={helperText ? descriptionId : undefined} className={`group relative w-full overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.035))] text-left shadow-[0_18px_48px_rgba(0,0,0,0.18)] transition outline-none ${accentClass}`}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(76,207,255,0.16),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_60%)] opacity-90" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.05))]" />
          <div className="relative z-10 px-4 pb-3 pt-4 pr-12">
            <Select.Value placeholder={placeholder ?? "Оберіть значення"} className="text-base font-medium text-white" />
          </div>
          <Select.Icon className="absolute right-4 top-4 z-10 text-[var(--muted)] transition group-data-[state=open]:translate-y-0.5 group-data-[state=open]:text-white">
            <ChevronDown className="h-5 w-5" />
          </Select.Icon>
          {helperText ? (
            <div id={descriptionId} className="relative z-10 border-t border-white/8 bg-black/10 px-4 pb-3 pt-2 text-xs leading-5 text-[var(--muted)]">
              {helperText}
            </div>
          ) : null}
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={10}
            className="z-[170] overflow-hidden rounded-[22px] border border-white/10 bg-[rgba(8,20,38,0.96)] shadow-[0_28px_100px_rgba(0,0,0,0.42)] backdrop-blur-xl"
          >
            <Select.Viewport className="max-h-80 min-w-[var(--radix-select-trigger-width)] p-2">
              {options.map((item) => (
                <Select.Item
                  key={item.value}
                  value={item.value}
                  className={`relative flex cursor-pointer select-none items-start gap-3 rounded-[16px] px-3 py-3 pr-9 text-sm text-[var(--muted)] outline-none transition ${itemAccentClass}`}
                >
                  <Select.ItemText>
                    <span className="block font-medium text-white">{item.label}</span>
                    {item.description ? <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{item.description}</span> : null}
                  </Select.ItemText>
                  <Select.ItemIndicator className="absolute right-3 top-3 text-[var(--accent-cyan)]">
                    <Check className="h-4 w-4" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}