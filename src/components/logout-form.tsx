import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions";

export function LogoutForm() {
  return (
    <form action={logoutAction}>
      <button className="ghost-button" type="submit">
        <LogOut size={16} />
        Keluar
      </button>
    </form>
  );
}
