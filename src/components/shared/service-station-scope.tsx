"use client";

import type { ReactNode } from "react";

import { ServiceStationProvider } from "@/components/providers/service-station-provider";

type ServiceStationScopeProps = {
  children: ReactNode;
};

/** Wrap pages where prices / regulations depend on the selected STO (not the whole cabinet). */
export function ServiceStationScope({ children }: ServiceStationScopeProps) {
  return <ServiceStationProvider enabled>{children}</ServiceStationProvider>;
}
