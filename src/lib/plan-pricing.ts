import type { MaintenancePlanItem } from "@/lib/types";
import { sumUah } from "@/lib/format-money";

export function planPricingSummary(items: MaintenancePlanItem[]) {
  const pricedItems = items.filter((item) => item.labor_price_uah !== null && item.labor_price_uah !== undefined);
  const planTotal = sumUah(items.map((item) => item.labor_price_uah));
  const dueSoon = items.filter((item) => item.current_status === "overdue" || item.current_status === "pending");
  const dueSoonTotal = sumUah(dueSoon.map((item) => item.labor_price_uah));

  return {
    pricedCount: pricedItems.length,
    planTotal,
    dueSoonTotal,
    hasAnyPrice: pricedItems.length > 0
  };
}
