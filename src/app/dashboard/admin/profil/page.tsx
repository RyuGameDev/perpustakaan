import { AdminProfileSection } from "@/components/admin-sections";
import { DashboardShell } from "@/components/dashboard-shell";
import { FlashMessage } from "@/components/flash-message";
import { SetupErrorPanel } from "@/components/setup-error-panel";
import { getSafeAdminProfile } from "@/lib/dashboard-data";
import { adminNav } from "@/lib/dashboard-nav";
import { requireSession } from "@/lib/session";

type PageProps = {
  searchParams?: Promise<{ success?: string; error?: string }>;
};

export default async function AdminProfilePage({ searchParams }: PageProps) {
  const session = await requireSession("admin");
  const params = await searchParams;
  const { profile, setupError } = session.id_admin
    ? await getSafeAdminProfile(session.id_admin)
    : { profile: null, setupError: false };

  return (
    <DashboardShell
      eyebrow="Data Admin"
      title="Profil Admin"
      subtitle={`${profile?.nama_admin || session.name} - kelola identitas dan jabatan petugas`}
      navItems={adminNav("profil")}
    >
      <FlashMessage success={params?.success} error={params?.error} />
      {setupError ? <SetupErrorPanel /> : <AdminProfileSection admin={profile} />}
    </DashboardShell>
  );
}
