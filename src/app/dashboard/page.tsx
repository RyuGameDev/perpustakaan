import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await requireSession();
  redirect(session.role === "admin" ? "/dashboard/admin" : "/dashboard/mahasiswa");
}
