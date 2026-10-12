import { DeleteAccountClient } from "@/components/profile/delete-account-client";
import { AppShell } from "@/components/shell/app-shell";

export default function DeleteProfilePage() {
  return (
    <AppShell
      heading="Закриття акаунта"
      description="Вхід буде заблоковано. Історія авто залишиться привʼязаною до запису, але кабінет для вас закриється."
    >
      <DeleteAccountClient />
    </AppShell>
  );
}