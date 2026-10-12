"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { useServiceStation } from "@/components/providers/service-station-provider";
import { FancySelect } from "@/components/ui/fancy-select";
import type { ServiceStation } from "@/lib/types";
import { Check, ChevronDown, Search } from "lucide-react";

function formatStationLabel(station: { name_uk: string; city_uk: string | null; address_uk: string | null }): string {
  const city = station.city_uk?.trim();
  const address = station.address_uk?.trim();

  if (city && address) {
    return `${station.name_uk} · ${city}, ${address}`;
  }

  if (city) {
    return `${station.name_uk} · ${city}`;
  }

  return station.name_uk;
}

function stationSearchText(station: ServiceStation): string {
  return [station.name_uk, station.city_uk, station.address_uk, station.slug]
    .filter((part) => typeof part === "string" && part.trim() !== "")
    .join(" ")
    .toLowerCase();
}

type ServiceStationSelectProps = {
  showImage?: boolean;
  searchable?: boolean;
  helper?: string;
};

const DEFAULT_HELPER = "Ціни та доступні регламенти залежать від обраної станції.";

function ServiceStationSearchSelect({
  stations,
  stationId,
  setStationId,
  helper
}: {
  stations: ServiceStation[];
  stationId: string;
  setStationId: (id: string) => void;
  helper: string;
}) {
  const labelId = useId();
  const helperId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedStation = stations.find((station) => station.id === stationId) ?? null;

  const filteredStations = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return stations;
    }

    return stations.filter((station) => stationSearchText(station).includes(normalized));
  }, [query, stations]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
        inputRef.current?.blur();
      }
    }

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function handleSelect(nextId: string) {
    setStationId(nextId);
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  }

  const inputDisplayValue = open ? query : selectedStation ? formatStationLabel(selectedStation) : "";

  return (
    <div className="flex flex-col gap-2 text-sm text-[var(--muted)]">
      <span id={labelId}>СТО</span>
      <div ref={rootRef} className="relative">
        <div
          className={`group relative w-full overflow-hidden border border-[#d5d5d5] bg-white text-left transition outline-none ${open ? "border-[#c51b1b] shadow-[0_0_0_1px_rgba(197,27,27,0.24)]" : ""}`}
        >
          <div className="relative z-10 flex items-center gap-2 px-4 pb-3 pt-4 pr-12">
          <Search className="h-5 w-5 shrink-0 text-[var(--muted)]" aria-hidden="true" />
          <input
            ref={inputRef}
            aria-labelledby={labelId}
            type="search"
            value={inputDisplayValue}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              setOpen(true);
              if (!query && selectedStation) {
                setQuery("");
              }
            }}
            placeholder="Пошук СТО за назвою, містом або адресою"
            aria-describedby={helper ? helperId : undefined}
            autoComplete="off"
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-base font-medium text-[var(--foreground)] outline-none placeholder:font-normal placeholder:text-[var(--muted)]"
          />
          </div>
          <div className="pointer-events-none absolute right-4 top-4 z-10 text-[var(--muted)]">
            <ChevronDown className={`h-5 w-5 transition ${open ? "translate-y-0.5 text-[var(--foreground)]" : ""}`} />
          </div>
          {helper ? (
            <div id={helperId} className="relative z-10 border-t border-[var(--line)] bg-black/10 px-4 pb-3 pt-2 text-xs leading-5 text-[var(--muted)]">
              {helper}
            </div>
          ) : null}
        </div>

        {open ? (
          <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-[170] overflow-hidden border border-[#e4e4e4] bg-white shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
          <div className="max-h-80 space-y-1 overflow-y-auto p-2">
            {filteredStations.length === 0 ? (
              <p className="rounded-[16px] px-3 py-3 text-sm text-[var(--muted)]">Нічого не знайдено. Спробуйте інший запит.</p>
            ) : (
              filteredStations.map((station) => {
                const active = station.id === stationId;

                return (
                  <button
                    key={station.id}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSelect(station.id)}
                    className={`flex w-full items-start gap-3 rounded-[16px] px-3 py-3 text-left text-sm transition ${active ? "bg-[rgba(197,27,27,0.08)] text-[var(--foreground)]" : "text-[var(--muted)] hover:bg-[rgba(197,27,27,0.08)] hover:text-[var(--foreground)]"}`}
                  >
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center ${active ? "text-[#c51b1b]" : "text-transparent"}`}>
                      <Check className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-[var(--foreground)]">{formatStationLabel(station)}</span>
                      {station.city_uk ? (
                        <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{station.city_uk}</span>
                      ) : null}
                    </span>
                  </button>
                );
              })
            )}
          </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ServiceStationSelect({
  showImage = true,
  searchable = false,
  helper = DEFAULT_HELPER
}: ServiceStationSelectProps) {
  const { stations, stationId, setStationId, loading, error } = useServiceStation();
  const selectedStation = stations.find((station) => station.id === stationId) ?? null;

  if (loading && stations.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">Завантажуємо список СТО...</p>
    );
  }

  if (stations.length === 0) {
    return error ? (
      <p className="text-sm text-[#c51b1b]">{error}</p>
    ) : (
      <p className="text-sm text-[var(--muted)]">Список СТО поки порожній.</p>
    );
  }

  if (searchable) {
    return (
      <ServiceStationSearchSelect
        stations={stations}
        stationId={stationId}
        setStationId={setStationId}
        helper={helper}
      />
    );
  }

  return (
    <div className="space-y-3">
      {showImage && selectedStation?.image_url ? (
        <div className="overflow-hidden border border-[#d5d5d5] bg-black/5">
          <img
            src={selectedStation.image_url}
            alt={selectedStation.name_uk}
            className="aspect-[2.4/1] max-h-44 w-full object-cover"
          />
        </div>
      ) : null}
      <FancySelect
        label="СТО"
        value={stationId}
        onChange={setStationId}
        placeholder="Оберіть СТО"
        helper={helper}
        options={stations.map((station) => ({
          value: station.id,
          label: formatStationLabel(station),
          description: station.city_uk ?? undefined,
          imageUrl: showImage ? station.image_url : undefined
        }))}
      />
    </div>
  );
}
