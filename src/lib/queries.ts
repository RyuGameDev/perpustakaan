import "server-only";

import { demoBooks } from "./demo-data";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";
import type { Book, Loan, LoanExtension, Notification } from "./types";

export async function getBooks(search?: string) {
  if (!isSupabaseConfigured()) {
    return demoBooks.filter((book) => {
      if (!search) return true;
      const query = search.toLowerCase();
      return `${book.judul} ${book.penulis} ${book.kategori}`.toLowerCase().includes(query);
    });
  }

  const supabase = getSupabaseAdmin();
  let query = supabase.from("buku").select("*").order("judul");

  if (search) {
    const like = `%${search.replaceAll(",", " ")}%`;
    query = query.or(`judul.ilike.${like},penulis.ilike.${like},kategori.ilike.${like},isbn.ilike.${like}`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data || []) as Book[];
}

export async function getStudentDashboard(npm: string) {
  const supabase = getSupabaseAdmin();

  const [loans, history, notifications, books] = await Promise.all([
    supabase
      .from("peminjaman")
      .select("*, buku(*)")
      .eq("npm", npm)
      .neq("status_peminjaman", "dikembalikan")
      .order("created_at", { ascending: false }),
    supabase
      .from("peminjaman")
      .select("*, buku(*)")
      .eq("npm", npm)
      .eq("status_peminjaman", "dikembalikan")
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("notifikasi")
      .select("*")
      .eq("npm", npm)
      .order("tanggal_notif", { ascending: false })
      .limit(10),
    supabase.from("buku").select("*").order("judul")
  ]);

  for (const response of [loans, history, notifications, books]) {
    if (response.error) {
      throw response.error;
    }
  }

  return {
    loans: (loans.data || []) as Loan[],
    history: (history.data || []) as Loan[],
    notifications: (notifications.data || []) as Notification[],
    books: (books.data || []) as Book[]
  };
}

export async function getAdminDashboard() {
  const supabase = getSupabaseAdmin();

  const [
    books,
    pendingLoans,
    pendingExtensions,
    activeLoans,
    recentLoans,
    totalBooks,
    totalStudents,
    totalActiveLoans
  ] = await Promise.all([
    supabase.from("buku").select("*").order("judul"),
    supabase
      .from("peminjaman")
      .select("*, buku(*), mahasiswa(*)")
      .eq("status_peminjaman", "menunggu")
      .order("created_at", { ascending: true }),
    supabase
      .from("perpanjangan")
      .select("*, peminjaman(*, buku(*), mahasiswa(*))")
      .eq("status_perpanjangan", "menunggu")
      .order("created_at", { ascending: true }),
    supabase
      .from("peminjaman")
      .select("*, buku(*), mahasiswa(*)")
      .in("status_peminjaman", ["disetujui", "dipinjam"])
      .order("tanggal_jatuh_tempo", { ascending: true }),
    supabase
      .from("peminjaman")
      .select("*, buku(*), mahasiswa(*)")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("buku").select("*", { count: "exact", head: true }),
    supabase.from("mahasiswa").select("*", { count: "exact", head: true }),
    supabase.from("peminjaman").select("*", { count: "exact", head: true }).in("status_peminjaman", ["disetujui", "dipinjam"])
  ]);

  for (const response of [books, pendingLoans, pendingExtensions, activeLoans, recentLoans]) {
    if (response.error) {
      throw response.error;
    }
  }

  return {
    books: (books.data || []) as Book[],
    pendingLoans: (pendingLoans.data || []) as Loan[],
    pendingExtensions: (pendingExtensions.data || []) as LoanExtension[],
    activeLoans: (activeLoans.data || []) as Loan[],
    recentLoans: (recentLoans.data || []) as Loan[],
    stats: {
      totalBooks: totalBooks.count || 0,
      totalStudents: totalStudents.count || 0,
      activeLoans: totalActiveLoans.count || 0,
      pendingLoans: pendingLoans.data?.length || 0
    }
  };
}
