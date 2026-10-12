import { GarageClient } from "@/components/garage/garage-client";
import { AppShell } from "@/components/shell/app-shell";

export default function GaragePage() {
  return (
    <AppShell
      heading="Гараж"
      description="Ваші автомобілі: покоління, комплектація, VIN, номер і актуальний пробіг."
    >
      <GarageClient />
    </AppShell>
  );
}
