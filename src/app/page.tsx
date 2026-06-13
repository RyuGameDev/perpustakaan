import { Bell, BookOpen, CheckCircle2, ClipboardList, LayoutDashboard, LogIn, MapPin, Menu, Search } from "lucide-react";
import Link from "next/link";
import { requestLoanAction } from "./actions";
import { BookCover } from "@/components/book-cover";
import { SubmitButton } from "@/components/submit-button";
import { getBooks } from "@/lib/queries";
import { getSession } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase";

type HomePageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const search = params?.q || "";
  const [session, books] = await Promise.all([getSession(), getBooks(search)]);

  return (
    <main className="page">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link className="brand" href="/">
            <span className="brand-mark">
              <BookOpen size={22} />
            </span>
            <span>Perpustakaan Digital</span>
          </Link>
          <nav className="nav-actions public-nav-desktop">
            {session ? (
              <Link className="button" href={session.role === "admin" ? "/dashboard/admin" : "/dashboard/mahasiswa"}>
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
            ) : (
              <>
                <Link className="ghost-button" href="/register">
                  Daftar
                </Link>
                <Link className="button" href="/login">
                  <LogIn size={16} />
                  Login
                </Link>
              </>
            )}
          </nav>
          <details className="public-menu">
            <summary className="ghost-button">
              <Menu size={16} />
              Menu
            </summary>
            <div className="public-menu-panel">
              {session ? (
                <Link className="button" href={session.role === "admin" ? "/dashboard/admin" : "/dashboard/mahasiswa"}>
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link className="ghost-button" href="/register">
                    Daftar
                  </Link>
                  <Link className="button" href="/login">
                    <LogIn size={16} />
                    Login
                  </Link>
                </>
              )}
            </div>
          </details>
        </div>
      </header>

      <section className="hero-band">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Layanan Perpustakaan Terpadu</p>
            <h1>Perpustakaan Digital</h1>
            <p className="lead">
              Akses katalog, ajukan peminjaman, pantau persetujuan, kelola pengembalian, dan terima notifikasi email dari satu sistem layanan perpustakaan.
            </p>
            <div className="hero-actions">
              <Link className="button" href="#katalog">
                <Search size={16} />
                Cari Buku
              </Link>
              <Link className="ghost-button" href="/login">
                <LogIn size={16} />
                Masuk Akun
              </Link>
            </div>
          </div>

          <div className="hero-media" aria-label="Ringkasan layanan perpustakaan">
            <div className="service-preview">
              <div className="service-preview-header">
                <div>
                  <span className="tag">Layanan Aktif</span>
                  <h2>Alur Peminjaman</h2>
                </div>
                <span className="status-pill status-disetujui">Online</span>
              </div>
              <div className="service-steps">
                <div className="service-step">
                  <span className="service-icon">
                    <Search size={18} />
                  </span>
                  <div>
                    <strong>Cari koleksi</strong>
                    <small>Temukan buku berdasarkan judul, penulis, kategori, atau ISBN.</small>
                  </div>
                </div>
                <div className="service-step">
                  <span className="service-icon">
                    <ClipboardList size={18} />
                  </span>
                  <div>
                    <strong>Ajukan peminjaman</strong>
                    <small>Pengajuan tercatat dan masuk ke antrian petugas.</small>
                  </div>
                </div>
                <div className="service-step">
                  <span className="service-icon">
                    <CheckCircle2 size={18} />
                  </span>
                  <div>
                    <strong>Diproses admin</strong>
                    <small>Petugas menyetujui, menolak, atau memvalidasi pengembalian.</small>
                  </div>
                </div>
                <div className="service-step">
                  <span className="service-icon">
                    <Bell size={18} />
                  </span>
                  <div>
                    <strong>Pantau status</strong>
                    <small>Perubahan status dan pengingat jatuh tempo tersedia di dashboard.</small>
                  </div>
                </div>
              </div>
              <div className="service-summary">
                <div className="mini-stat">
                  <strong>{books.length}</strong>
                  <span>Koleksi</span>
                </div>
                <div className="mini-stat">
                  <strong>7</strong>
                  <span>Hari pinjam</span>
                </div>
                <div className="mini-stat">
                  <strong>24/7</strong>
                  <span>Akses katalog</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="katalog">
        <div className="container">
          {!isSupabaseConfigured() ? (
            <div className="flash flash-error">
              Supabase belum dikonfigurasi. Katalog di bawah memakai data demo sampai `.env.local` diisi.
            </div>
          ) : null}

          <div className="section-header">
            <div>
              <h2>Katalog Buku</h2>
              <p>Pilih buku yang tersedia lalu ajukan peminjaman.</p>
            </div>
            <form className="search-form" action="/">
              <input className="field" name="q" defaultValue={search} placeholder="Cari judul, penulis, kategori, ISBN" />
              <SubmitButton className="button" pendingLabel="Mencari...">
                <Search size={16} />
                Cari
              </SubmitButton>
            </form>
          </div>

          <div className="book-grid">
            {books.map((book) => (
              <article className="book-card" key={book.id_buku}>
                <BookCover title={book.judul} author={book.penulis} url={book.cover_url} />
                <div className="book-card-body">
                  <h3>{book.judul}</h3>
                  <p className="muted">{book.penulis}</p>
                  <div className="meta-row">
                    <span className="tag">{book.kategori || "Umum"}</span>
                    <span className="tag">Stok {book.stok}</span>
                    <span className="tag">{book.lokasi_rak || "Rak -"}</span>
                  </div>
                </div>
                {session?.role === "mahasiswa" ? (
                  <form action={requestLoanAction}>
                    <input type="hidden" name="id_buku" value={book.id_buku} />
                    <SubmitButton className="button" disabled={book.stok <= 0} pendingLabel="Mengirim...">
                      Ajukan Peminjaman
                    </SubmitButton>
                  </form>
                ) : (
                  <Link className="ghost-button" href="/login">
                    Login untuk Pinjam
                  </Link>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer-band">
        <div className="container nav-actions" style={{ justifyContent: "space-between" }}>
          <a
            className="brand"
            href="https://www.google.com/maps/search/?api=1&query=Perpustakaan%20Kampus"
            rel="noreferrer"
            target="_blank"
          >
            <MapPin size={18} />
            Perpustakaan Pusat, Gedung Akademik Lt. 1
          </a>
          <span>Layanan Senin-Jumat, 08.00-16.00</span>
        </div>
      </footer>
    </main>
  );
}
