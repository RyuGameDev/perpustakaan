import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions";
import { SubmitButton } from "./submit-button";

export function LogoutForm() {
  return (
    <form action={logoutAction}>
      <SubmitButton className="ghost-button" pendingLabel="Keluar...">
        <LogOut size={16} />
        Keluar
      </SubmitButton>
    </form>
  );
}
