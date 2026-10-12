"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { getApiErrorMessage, getSession, listServiceStations, updateCabinetPreferences } from "@/lib/api";
import { readPreferredServiceStationId, writePreferredServiceStationId } from "@/lib/service-station-preference";
import type { ServiceStation } from "@/lib/types";

type ServiceStationContextValue = {
  stations: ServiceStation[];
  stationId: string;
  setStationId: (stationId: string) => void;
  loading: boolean;
  error: string;
  stationLabel: string | null;
};

const ServiceStationContext = createContext<ServiceStationContextValue | null>(null);

type ServiceStationProviderProps = {
  enabled: boolean;
  children: ReactNode;
};

function resolveInitialStationId(stations: ServiceStation[], serverId: string | null | undefined, localId: string): string {
  if (serverId && stations.some((station) => station.id === serverId)) {
    return serverId;
  }

  if (localId && stations.some((station) => station.id === localId)) {
    return localId;
  }

  return stations[0]?.id ?? "";
}

export function ServiceStationProvider({ enabled, children }: ServiceStationProviderProps) {
  const [stations, setStations] = useState<ServiceStation[]>([]);
  const [stationId, setStationIdState] = useState(() => readPreferredServiceStationId());
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    void Promise.all([listServiceStations(), getSession()])
      .then(([items, session]) => {
        if (cancelled) {
          return;
        }

        setStations(items);
        const resolved = resolveInitialStationId(
          items,
          session?.preferredServiceStationId,
          readPreferredServiceStationId()
        );

        setStationIdState(resolved);

        if (resolved) {
          writePreferredServiceStationId(resolved);
        }

        setLoading(false);
      })
      .catch((requestError) => {
        if (cancelled) {
          return;
        }

        setError(getApiErrorMessage(requestError));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const setStationId = useCallback((nextStationId: string) => {
    setStationIdState(nextStationId);
    writePreferredServiceStationId(nextStationId);

    void updateCabinetPreferences({
      preferredServiceStationId: nextStationId || null
    }).catch(() => {
      // Локальний вибір збережено; профіль синхронізується при наступному успішному запиті.
    });
  }, []);

  const stationLabel = useMemo(() => {
    const match = stations.find((item) => item.id === stationId);
    return match?.name_uk ?? null;
  }, [stationId, stations]);

  const value = useMemo(
    () => ({
      stations,
      stationId,
      setStationId,
      loading,
      error,
      stationLabel
    }),
    [stations, stationId, setStationId, loading, error, stationLabel]
  );

  return <ServiceStationContext.Provider value={value}>{children}</ServiceStationContext.Provider>;
}

export function useServiceStation(): ServiceStationContextValue {
  const context = useContext(ServiceStationContext);

  if (!context) {
    throw new Error("useServiceStation must be used within ServiceStationProvider");
  }

  return context;
}
