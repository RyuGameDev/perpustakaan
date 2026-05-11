import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import {
  approveExtensionAction,
  approveLoanAction,
  createBookAction,
  deleteBookAction,
  rejectExtensionAction,
  rejectLoanAction,
  returnLoanAction,
  updateBookAction
} from "@/app/actions";
import { formatDate, formatDateTime } from "@/lib/date";
import type { Book, Loan, LoanExtension } from "@/lib/types";
import { BookCover } from "./book-cover";
import { StatusPill } from "./status-pill";

export function AdminStats({
  totalBooks,
  totalStudents,
  activeLoans,
  pendingLoans
}: {
  totalBooks: number;
  totalStudents: number;
  activeLoans: number;
  pendingLoans: number;
}) {
  return (
    <div className="stat-grid">
      <Link className="stat-card stat-link" href="/dashboard/admin/buku">
        <span>Total buku</span>
        <strong>{totalBooks}</strong>
      </Link>
      <div className="stat-card">
        <span>Anggota terdaftar</span>
        <strong>{totalStudents}</strong>
      </div>
      <Link className="stat-card stat-link" href="/dashboard/admin/pengembalian">
        <span>Peminjaman aktif</span>
        <strong>{activeLoans}</strong>
      </Link>
      <Link className="stat-card stat-link" href="/dashboard/admin/peminjaman">
        <span>Menunggu proses</span>
        <strong>{pendingLoans}</strong>
      </Link>
    </div>
  );
}

export function PendingLoansSection({ loans, preview = false }: { loans: Loan[]; preview?: boolean }) {
  const visibleLoans = preview ? loans.slice(0, 3) : loans;
  const redirectTo = preview ? "/dashboard/admin" : "/dashboard/admin/peminjaman";

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Permintaan Peminjaman</h2>
          <p className="muted">Tinjau pengajuan anggota dan tetapkan masa pinjam sebelum disetujui.</p>
        </div>
        {preview ? (
          <Link className="ghost-button" href="/dashboard/admin/peminjaman">
            Buka Antrian
          </Link>
        ) : null}
      </div>
      {visibleLoans.length ? (
        <div className="record-list">
          {visibleLoans.map((loan) => (
            <article className="record" key={loan.id_pinjam}>
              <BookCover size="sm" title={loan.buku?.judul || "Buku"} author={loan.buku?.penulis} url={loan.buku?.cover_url} />
              <div className="record-main">
                <h3>{loan.buku?.judul || "Buku"}</h3>
                <p className="muted">
                  {loan.mahasiswa?.nama || loan.npm} - {loan.mahasiswa?.email}
                </p>
                <div className="meta-row">
                  <StatusPill status={loan.status_peminjaman} />
                  <span className="tag">Diajukan {formatDateTime(loan.created_at)}</span>
                  <span className="tag">Stok {loan.buku?.stok ?? "-"}</span>
                </div>
              </div>
              <div className="record-actions">
                <form className="inline-form" action={approveLoanAction}>
                  <input type="hidden" name="id_pinjam" value={loan.id_pinjam} />
                  <input type="hidden" name="redirect_to" value={redirectTo} />
                  <select className="select" name="durasi" defaultValue="7" aria-label="Durasi peminjaman">
                    <option value="7">7 hari</option>
                    <option value="14">14 hari</option>
                  </select>
                  <button className="button" type="submit">
                    <CheckCircle2 size={16} />
                    Setujui
                  </button>
                </form>
                <form className="inline-form" action={rejectLoanAction}>
                  <input type="hidden" name="id_pinjam" value={loan.id_pinjam} />
                  <input type="hidden" name="redirect_to" value={redirectTo} />
                  <input className="field" name="alasan" placeholder="Catatan penolakan" />
                  <button className="danger-button" type="submit">
                    Tolak
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">Tidak ada permintaan peminjaman yang menunggu.</div>
      )}
    </section>
  );
}

export function PendingExtensionsSection({ extensions, preview = false }: { extensions: LoanExtension[]; preview?: boolean }) {
  const visibleExtensions = preview ? extensions.slice(0, 3) : extensions;
  const redirectTo = preview ? "/dashboard/admin" : "/dashboard/admin/perpanjangan";

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Permintaan Perpanjangan</h2>
          <p className="muted">Evaluasi permintaan tambah durasi untuk peminjaman yang masih aktif.</p>
        </div>
        {preview ? (
          <Link className="ghost-button" href="/dashboard/admin/perpanjangan">
            Lihat Semua
          </Link>
        ) : null}
      </div>
      {visibleExtensions.length ? (
        <div className="record-list">
          {visibleExtensions.map((extension) => {
            const loan = extension.peminjaman;
            return (
              <article className="record" key={extension.id_perpanjangan}>
                <BookCover size="sm" title={loan?.buku?.judul || "Buku"} author={loan?.buku?.penulis} url={loan?.buku?.cover_url} />
                <div className="record-main">
                  <h3>{loan?.buku?.judul || "Buku"}</h3>
                  <p className="muted">
                    {loan?.mahasiswa?.nama || loan?.npm} - tambah {extension.durasi_perpanjangan} hari
                  </p>
                  <div className="meta-row">
                    <StatusPill status={extension.status_perpanjangan} />
                    <span className="tag">Jatuh tempo {formatDate(loan?.tanggal_jatuh_tempo)}</span>
                  </div>
                </div>
                <div className="record-actions">
                  <form action={approveExtensionAction}>
                    <input type="hidden" name="id_perpanjangan" value={extension.id_perpanjangan} />
                    <input type="hidden" name="redirect_to" value={redirectTo} />
                    <button className="button" type="submit">
                      Setujui
                    </button>
                  </form>
                  <form className="inline-form" action={rejectExtensionAction}>
                    <input type="hidden" name="id_perpanjangan" value={extension.id_perpanjangan} />
                    <input type="hidden" name="redirect_to" value={redirectTo} />
                    <input className="field" name="alasan" placeholder="Catatan penolakan" />
                    <button className="danger-button" type="submit">
                      Tolak
                    </button>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">Tidak ada permintaan perpanjangan.</div>
      )}
    </section>
  );
}

export function ReturnsSection({ loans, preview = false }: { loans: Loan[]; preview?: boolean }) {
  const visibleLoans = preview ? loans.slice(0, 3) : loans;
  const redirectTo = preview ? "/dashboard/admin" : "/dashboard/admin/pengembalian";

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Validasi Pengembalian</h2>
          <p className="muted">Proses buku yang sudah diterima petugas agar stok kembali tersedia.</p>
        </div>
        {preview ? (
          <Link className="ghost-button" href="/dashboard/admin/pengembalian">
            Buka Daftar
          </Link>
        ) : null}
      </div>
      {visibleLoans.length ? (
        <div className="record-list">
          {visibleLoans.map((loan) => (
            <article className="record" key={loan.id_pinjam}>
              <BookCover size="sm" title={loan.buku?.judul || "Buku"} author={loan.buku?.penulis} url={loan.buku?.cover_url} />
              <div className="record-main">
                <h3>{loan.buku?.judul || "Buku"}</h3>
                <p className="muted">{loan.mahasiswa?.nama || loan.npm}</p>
                <div className="meta-row">
                  <span className="tag">Jatuh tempo {formatDate(loan.tanggal_jatuh_tempo)}</span>
                  <StatusPill status={loan.status_peminjaman} />
                </div>
              </div>
              <form action={returnLoanAction}>
                <input type="hidden" name="id_pinjam" value={loan.id_pinjam} />
                <input type="hidden" name="redirect_to" value={redirectTo} />
                <button className="subtle-button" type="submit">
                  Proses Pengembalian
                </button>
              </form>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">Tidak ada peminjaman aktif yang perlu divalidasi.</div>
      )}
    </section>
  );
}

export function BookManagementSection({ books }: { books: Book[] }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Data Buku</h2>
          <p className="muted">Kelola identitas, stok, lokasi rak, dan cover katalog.</p>
        </div>
      </div>
      <form className="compact-form" action={createBookAction} encType="multipart/form-data">
        <input type="hidden" name="redirect_to" value="/dashboard/admin/buku" />
        <input className="field" name="judul" placeholder="Judul" />
        <input className="field" name="penulis" placeholder="Penulis" />
        <input className="field" name="penerbit" placeholder="Penerbit" />
        <input className="field" name="tahun_terbit" type="number" placeholder="Tahun" />
        <input className="field" name="isbn" placeholder="ISBN" />
        <input className="field" name="kategori" placeholder="Kategori" />
        <input className="field" name="lokasi_rak" placeholder="Lokasi rak" />
        <input className="field" name="stok" type="number" min="0" placeholder="Stok" />
        <input className="field span-2" name="cover_url" placeholder="URL cover opsional" />
        <input className="field span-2" name="cover" type="file" accept="image/*" />
        <button className="button span-2" type="submit">
          Simpan Buku
        </button>
      </form>

      <div className="section-divider" />

      <div className="record-list">
        {books.map((book) => (
          <article className="record" key={book.id_buku}>
            <BookCover size="sm" title={book.judul} author={book.penulis} url={book.cover_url} />
            <div className="record-main">
              <form className="compact-form" action={updateBookAction} encType="multipart/form-data">
                <input type="hidden" name="id_buku" value={book.id_buku} />
                <input type="hidden" name="redirect_to" value="/dashboard/admin/buku" />
                <input className="field" name="judul" defaultValue={book.judul} />
                <input className="field" name="penulis" defaultValue={book.penulis} />
                <input className="field" name="penerbit" defaultValue={book.penerbit || ""} />
                <input className="field" name="tahun_terbit" type="number" defaultValue={book.tahun_terbit || ""} />
                <input className="field" name="isbn" defaultValue={book.isbn || ""} />
                <input className="field" name="kategori" defaultValue={book.kategori || ""} />
                <input className="field" name="lokasi_rak" defaultValue={book.lokasi_rak || ""} />
                <input className="field" name="stok" type="number" min="0" defaultValue={book.stok} />
                <input className="field span-2" name="cover" type="file" accept="image/*" />
                <button className="subtle-button" type="submit">
                  Simpan Perubahan
                </button>
              </form>
              <form action={deleteBookAction}>
                <input type="hidden" name="id_buku" value={book.id_buku} />
                <input type="hidden" name="redirect_to" value="/dashboard/admin/buku" />
                <button className="danger-button" type="submit">
                  Hapus
                </button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function MonitoringSection({ loans }: { loans: Loan[] }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Monitoring Aktivitas</h2>
          <p className="muted">Rekap aktivitas terbaru untuk operasional harian perpustakaan.</p>
        </div>
      </div>
      {loans.length ? (
        <div className="table-panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>Anggota</th>
                <th>Buku</th>
                <th>Status</th>
                <th>Diajukan</th>
                <th>Jatuh tempo</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan.id_pinjam}>
                  <td>{loan.mahasiswa?.nama || loan.npm}</td>
                  <td>{loan.buku?.judul || "-"}</td>
                  <td>
                    <StatusPill status={loan.status_peminjaman} />
                  </td>
                  <td>{formatDateTime(loan.created_at)}</td>
                  <td>{formatDate(loan.tanggal_jatuh_tempo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">Aktivitas operasional belum tersedia.</div>
      )}
    </section>
  );
}
