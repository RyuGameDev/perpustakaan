import { DashboardShell } from "@/components/dashboard-shell";
import { SetupErrorPanel } from "@/components/setup-error-panel";
import { StudentNotificationsSection } from "@/components/student-sections";
import { getSafeStudentDashboard } from "@/lib/dashboard-data";
import { studentNav } from "@/lib/dashboard-nav";
import { requireSession } from "@/lib/session";

export default async function StudentNotificationsPage() {
  const session = await requireSession("mahasiswa");
  const { profile, dashboard, setupError } = await getSafeStudentDashboard(session.npm || "");

  return (
    <DashboardShell
      eyebrow="Pusat Informasi"
      title="Notifikasi"
      subtitle={`${profile?.nama || session.name} - status pengajuan, pengembalian, dan pengingat tempo`}
      navItems={studentNav("notifikasi")}
    >
      {setupError || !dashboard ? <SetupErrorPanel /> : <StudentNotificationsSection notifications={dashboard.notifications} />}
    </DashboardShell>
  );
}
