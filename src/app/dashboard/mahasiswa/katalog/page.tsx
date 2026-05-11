import { DashboardShell } from "@/components/dashboard-shell";
import { FlashMessage } from "@/components/flash-message";
import { SetupErrorPanel } from "@/components/setup-error-panel";
import { StudentCatalogSection } from "@/components/student-sections";
import { getSafeStudentDashboard } from "@/lib/dashboard-data";
import { studentNav } from "@/lib/dashboard-nav";
import { requireSession } from "@/lib/session";

type PageProps = {
  searchParams?: Promise<{ success?: string; error?: string }>;
};

export default async function StudentCatalogPage({ searchParams }: PageProps) {
  const session = await requireSession("mahasiswa");
  const params = await searchParams;
  const { profile, dashboard, setupError } = await getSafeStudentDashboard(session.npm || "");

  return (
    <DashboardShell
      eyebrow="Katalog Digital"
      title="Katalog Buku"
      subtitle={`${profile?.nama || session.name} - cari koleksi yang tersedia untuk dipinjam`}
      navItems={studentNav("katalog")}
    >
      <FlashMessage success={params?.success} error={params?.error} />
      {setupError || !dashboard ? <SetupErrorPanel /> : <StudentCatalogSection books={dashboard.books} />}
    </DashboardShell>
  );
}
