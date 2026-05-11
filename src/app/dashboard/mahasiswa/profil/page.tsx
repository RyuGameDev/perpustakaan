import { DashboardShell } from "@/components/dashboard-shell";
import { FlashMessage } from "@/components/flash-message";
import { SetupErrorPanel } from "@/components/setup-error-panel";
import { StudentProfileSection } from "@/components/student-sections";
import { getSafeStudentDashboard } from "@/lib/dashboard-data";
import { studentNav } from "@/lib/dashboard-nav";
import { requireSession } from "@/lib/session";

type PageProps = {
  searchParams?: Promise<{ success?: string; error?: string }>;
};

export default async function StudentProfilePage({ searchParams }: PageProps) {
  const session = await requireSession("mahasiswa");
  const params = await searchParams;
  const { profile, setupError } = await getSafeStudentDashboard(session.npm || "");

  return (
    <DashboardShell
      eyebrow="Data Anggota"
      title="Profil Anggota"
      subtitle={`${profile?.nama || session.name} - kelola data identitas dan kontak`}
      navItems={studentNav("profil")}
    >
      <FlashMessage success={params?.success} error={params?.error} />
      {setupError ? <SetupErrorPanel /> : <StudentProfileSection student={profile} />}
    </DashboardShell>
  );
}
