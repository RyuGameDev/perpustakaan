import { Bell, BookMarked, Clock3, History, Home, LibraryBig, ListChecks, RefreshCw, RotateCcw, Settings2, UserRound } from "lucide-react";

export function studentNav(active: string) {
  const items = [
    { href: "/dashboard/mahasiswa", label: "Ringkasan", icon: <Home size={16} />, key: "overview" },
    { href: "/dashboard/mahasiswa/status", label: "Status", icon: <Clock3 size={16} />, key: "status" },
    { href: "/dashboard/mahasiswa/katalog", label: "Katalog", icon: <LibraryBig size={16} />, key: "katalog" },
    { href: "/dashboard/mahasiswa/notifikasi", label: "Notifikasi", icon: <Bell size={16} />, key: "notifikasi" },
    { href: "/dashboard/mahasiswa/riwayat", label: "Riwayat", icon: <History size={16} />, key: "riwayat" },
    { href: "/dashboard/mahasiswa/profil", label: "Profil", icon: <UserRound size={16} />, key: "profil" }
  ];

  return items.map((item) => ({ ...item, active: item.key === active }));
}

export function adminNav(active: string) {
  const items = [
    { href: "/dashboard/admin", label: "Ringkasan", icon: <Home size={16} />, key: "overview" },
    { href: "/dashboard/admin/peminjaman", label: "Peminjaman", icon: <ListChecks size={16} />, key: "peminjaman" },
    { href: "/dashboard/admin/perpanjangan", label: "Perpanjangan", icon: <RefreshCw size={16} />, key: "perpanjangan" },
    { href: "/dashboard/admin/pengembalian", label: "Pengembalian", icon: <RotateCcw size={16} />, key: "pengembalian" },
    { href: "/dashboard/admin/buku", label: "Data Buku", icon: <BookMarked size={16} />, key: "buku" },
    { href: "/dashboard/admin/monitoring", label: "Monitoring", icon: <Settings2 size={16} />, key: "monitoring" }
  ];

  return items.map((item) => ({ ...item, active: item.key === active }));
}
