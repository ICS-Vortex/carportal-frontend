"use client";

import { useEffect, useState } from "react";

import { getApiErrorMessage, listServiceStationAppointmentSlots } from "@/lib/api";
import type { AppointmentSlot } from "@/lib/types";

type AppointmentTimeSlotsProps = {
  stationId: string;
  serviceDate: string;
  value: string;
  onChange: (time: string) => void;
};

export function AppointmentTimeSlots({ stationId, serviceDate, value, onChange }: AppointmentTimeSlotsProps) {
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stationId || !serviceDate) {
      setSlots([]);
      onChange("");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void listServiceStationAppointmentSlots(stationId, serviceDate)
      .then((items) => {
        if (cancelled) {
          return;
        }

        setSlots(items);

        if (value && !items.some((slot) => slot.time === value && slot.available)) {
          onChange("");
        }
      })
      .catch((fetchError) => {
        if (!cancelled) {
          setSlots([]);
          setError(getApiErrorMessage(fetchError));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [stationId, serviceDate]);

  if (!stationId) {
    return (
      <p className="rounded-[20px] border border-[var(--line)] bg-black/5 px-4 py-3 text-sm leading-6 text-[var(--muted)]">
        Спочатку оберіть СТО у блоці вище — тоді зʼявляться вільні години на обраний день.
      </p>
    );
  }

  if (loading) {
    return <p className="text-sm text-[var(--muted)]">Завантажуємо вільні слоти...</p>;
  }

  if (error) {
    return <p className="text-sm text-[var(--accent)]">{error}</p>;
  }

  const availableSlots = slots.filter((slot) => slot.available);

  if (availableSlots.length === 0) {
    return (
      <p className="rounded-[20px] border border-[rgba(224,163,106,0.35)] bg-[rgba(224,163,106,0.08)] px-4 py-3 text-sm leading-6 text-[var(--muted)]">
        На цей день немає вільних годин. Спробуйте іншу дату або інше СТО.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 text-sm text-[var(--muted)]">
      <span>Час візиту</span>
      <div className="flex flex-wrap gap-2">
        {availableSlots.map((slot) => {
          const selected = value === slot.time;

          return (
            <button
              key={slot.time}
              type="button"
              onClick={() => onChange(slot.time)}
              className={selected ? "btn-primary btn-sm" : "btn-ghost btn-sm"}
              aria-pressed={selected}
            >
              {slot.time}
              {slot.capacity > 1 ? ` · ${slot.capacity - slot.booked_count} вільно` : ""}
            </button>
          );
        })}
      </div>
      <p className="text-xs leading-5 text-[var(--muted)]">
        Слоти залежать від черги на обраному СТО. Зайняті години не показуються.
      </p>
    </div>
  );
}
