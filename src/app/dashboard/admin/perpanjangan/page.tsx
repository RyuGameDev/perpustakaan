import { PendingExtensionsSection } from "@/components/admin-sections";
import { DashboardShell } from "@/components/dashboard-shell";
import { FlashMessage } from "@/components/flash-message";
import { SetupErrorPanel } from "@/components/setup-error-panel";
import { getSafeAdminDashboard } from "@/lib/dashboard-data";
import { adminNav } from "@/lib/dashboard-nav";
import { requireSession } from "@/lib/session";

type PageProps = {
  searchParams?: Promise<{ success?: string; error?: string }>;
};

export default async function AdminExtensionsPage({ searchParams }: PageProps) {
  const session = await requireSession("admin");
  const params = await searchParams;
  const { dashboard, setupError } = await getSafeAdminDashboard();

  return (
    <DashboardShell
      eyebrow="Layanan Sirkulasi"
      title="Permintaan Perpanjangan"
      subtitle={`${session.name} - kelola tambahan durasi peminjaman`}
      navItems={adminNav("perpanjangan")}
    >
      <FlashMessage success={params?.success} error={params?.error} />
      {setupError || !dashboard ? <SetupErrorPanel /> : <PendingExtensionsSection extensions={dashboard.pendingExtensions} />}
    </DashboardShell>
  );
}
