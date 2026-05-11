import { AdminStats, MonitoringSection, PendingExtensionsSection, PendingLoansSection, ReturnsSection } from "@/components/admin-sections";
import { DashboardShell } from "@/components/dashboard-shell";
import { FlashMessage } from "@/components/flash-message";
import { SetupErrorPanel } from "@/components/setup-error-panel";
import { getSafeAdminDashboard } from "@/lib/dashboard-data";
import { adminNav } from "@/lib/dashboard-nav";
import { requireSession } from "@/lib/session";

type AdminDashboardProps = {
  searchParams?: Promise<{
    success?: string;
    error?: string;
  }>;
};

export default async function AdminDashboard({ searchParams }: AdminDashboardProps) {
  const session = await requireSession("admin");
  const params = await searchParams;
  const { dashboard, setupError } = await getSafeAdminDashboard();

  return (
    <DashboardShell
      eyebrow="Dashboard Admin"
      title="Ringkasan Operasional"
      subtitle={`${session.name} - pusat kendali layanan perpustakaan`}
      navItems={adminNav("overview")}
    >
      <FlashMessage success={params?.success} error={params?.error} />

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
          <div className="dashboard-grid">
            <div className="section-stack">
              <PendingLoansSection loans={dashboard.pendingLoans} preview />
              <PendingExtensionsSection extensions={dashboard.pendingExtensions} preview />
            </div>
            <div className="section-stack">
              <ReturnsSection loans={dashboard.activeLoans} preview />
              <MonitoringSection loans={dashboard.recentLoans.slice(0, 5)} />
            </div>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
