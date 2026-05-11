import { AdminStats, MonitoringSection } from "@/components/admin-sections";
import { DashboardShell } from "@/components/dashboard-shell";
import { SetupErrorPanel } from "@/components/setup-error-panel";
import { getSafeAdminDashboard } from "@/lib/dashboard-data";
import { adminNav } from "@/lib/dashboard-nav";
import { requireSession } from "@/lib/session";

export default async function AdminMonitoringPage() {
  const session = await requireSession("admin");
  const { dashboard, setupError } = await getSafeAdminDashboard();

  return (
    <DashboardShell
      eyebrow="Monitoring"
      title="Aktivitas Perpustakaan"
      subtitle={`${session.name} - pantau transaksi dan kapasitas layanan`}
      navItems={adminNav("monitoring")}
    >
      {setupError || !dashboard ? (
        <SetupErrorPanel />
      ) : (
        <>
          <AdminStats
            totalBooks={dashboard.stats.totalBooks}
            totalStudents={dashboard.stats.totalStudents}
            activeLoans={dashboard.stats.activeLoans}
            pendingLoans={dashboard.stats.pendingLoans}
          />
          <MonitoringSection loans={dashboard.recentLoans} />
        </>
      )}
    </DashboardShell>
  );
}
