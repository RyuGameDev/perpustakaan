import { DashboardShell } from "@/components/dashboard-shell";
import { FlashMessage } from "@/components/flash-message";
import { SetupErrorPanel } from "@/components/setup-error-panel";
import { StudentStatusSection } from "@/components/student-sections";
import { getSafeStudentDashboard } from "@/lib/dashboard-data";
import { studentNav } from "@/lib/dashboard-nav";
import { requireSession } from "@/lib/session";

type PageProps = {
  searchParams?: Promise<{ success?: string; error?: string }>;
};

export default async function StudentStatusPage({ searchParams }: PageProps) {
  const session = await requireSession("mahasiswa");
  const params = await searchParams;
  const { profile, dashboard, setupError } = await getSafeStudentDashboard(session.npm || "");
  const activeLoans = dashboard?.loans.filter((loan) => ["menunggu", "disetujui", "dipinjam", "ditolak"].includes(loan.status_peminjaman)) || [];

  return (
    <DashboardShell
      eyebrow="Layanan Anggota"
      title="Status Peminjaman"
      subtitle={`${profile?.nama || session.name} - pantau semua pengajuan dan pinjaman aktif`}
      navItems={studentNav("status")}
    >
      <FlashMessage success={params?.success} error={params?.error} />
      {setupError || !dashboard ? <SetupErrorPanel /> : <StudentStatusSection loans={activeLoans} />}
    </DashboardShell>
  );
}
