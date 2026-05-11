import { DashboardShell } from "@/components/dashboard-shell";
import { FlashMessage } from "@/components/flash-message";
import { SetupErrorPanel } from "@/components/setup-error-panel";
import {
  StudentCatalogSection,
  StudentNotificationsSection,
  StudentStats,
  StudentStatusSection
} from "@/components/student-sections";
import { getSafeStudentDashboard } from "@/lib/dashboard-data";
import { studentNav } from "@/lib/dashboard-nav";
import { requireSession } from "@/lib/session";

type StudentDashboardProps = {
  searchParams?: Promise<{
    success?: string;
    error?: string;
  }>;
};

export default async function StudentDashboard({ searchParams }: StudentDashboardProps) {
  const session = await requireSession("mahasiswa");
  const params = await searchParams;
  const { profile, dashboard, setupError } = await getSafeStudentDashboard(session.npm || "");
  const activeLoans = dashboard?.loans.filter((loan) => ["menunggu", "disetujui", "dipinjam", "ditolak"].includes(loan.status_peminjaman)) || [];
  const unreadCount = dashboard?.notifications.filter((item) => !item.sudah_dibaca).length || 0;

  return (
    <DashboardShell
      eyebrow="Dashboard Anggota"
      title={`Halo, ${profile?.nama || session.name}`}
      subtitle={`NPM ${profile?.npm || session.npm} - kelola peminjaman dan katalog buku`}
      navItems={studentNav("overview")}
    >
      <FlashMessage success={params?.success} error={params?.error} />

      {setupError || !dashboard ? (
        <SetupErrorPanel />
      ) : (
        <>
          <StudentStats activeLoans={activeLoans} historyCount={dashboard.history.length} unreadCount={unreadCount} bookCount={dashboard.books.length} />
          <div className="dashboard-grid">
            <div className="section-stack">
              <StudentStatusSection loans={activeLoans} preview />
              <StudentCatalogSection books={dashboard.books} preview />
            </div>
            <div className="section-stack">
              <StudentNotificationsSection notifications={dashboard.notifications} preview />
            </div>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
