import { BookManagementSection } from "@/components/admin-sections";
import { DashboardShell } from "@/components/dashboard-shell";
import { FlashMessage } from "@/components/flash-message";
import { SetupErrorPanel } from "@/components/setup-error-panel";
import { getSafeAdminDashboard } from "@/lib/dashboard-data";
import { adminNav } from "@/lib/dashboard-nav";
import { requireSession } from "@/lib/session";

type PageProps = {
  searchParams?: Promise<{ success?: string; error?: string }>;
};

export default async function AdminBooksPage({ searchParams }: PageProps) {
  const session = await requireSession("admin");
  const params = await searchParams;
  const { dashboard, setupError } = await getSafeAdminDashboard();

  return (
    <DashboardShell
      eyebrow="Koleksi Perpustakaan"
      title="Manajemen Data Buku"
      subtitle={`${session.name} - perbarui katalog, stok, cover, dan lokasi rak`}
      navItems={adminNav("buku")}
    >
      <FlashMessage success={params?.success} error={params?.error} />
      {setupError || !dashboard ? <SetupErrorPanel /> : <BookManagementSection books={dashboard.books} />}
    </DashboardShell>
  );
}
