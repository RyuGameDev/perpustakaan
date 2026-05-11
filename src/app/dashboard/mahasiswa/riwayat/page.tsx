import { DashboardShell } from "@/components/dashboard-shell";
import { SetupErrorPanel } from "@/components/setup-error-panel";
import { StudentHistorySection } from "@/components/student-sections";
import { getSafeStudentDashboard } from "@/lib/dashboard-data";
import { studentNav } from "@/lib/dashboard-nav";
import { requireSession } from "@/lib/session";

export default async function StudentHistoryPage() {
  const session = await requireSession("mahasiswa");
  const { profile, dashboard, setupError } = await getSafeStudentDashboard(session.npm || "");

  return (
    <DashboardShell
      eyebrow="Arsip Anggota"
      title="Riwayat Peminjaman"
      subtitle={`${profile?.nama || session.name} - daftar transaksi yang telah selesai`}
      navItems={studentNav("riwayat")}
    >
      {setupError || !dashboard ? <SetupErrorPanel /> : <StudentHistorySection history={dashboard.history} />}
    </DashboardShell>
  );
}
