import Link from "next/link";
import {
  markNotificationReadAction,
  requestExtensionAction,
  requestLoanAction,
  updateProfileAction
} from "@/app/actions";
import { formatDate, formatDateTime } from "@/lib/date";
import type { Book, Loan, Notification, Student } from "@/lib/types";
import { BookCover } from "./book-cover";
import { StatusPill } from "./status-pill";

export function StudentStats({
  activeLoans,
  historyCount,
  unreadCount,
  bookCount
}: {
  activeLoans: Loan[];
  historyCount: number;
  unreadCount: number;
  bookCount: number;
}) {
  return (
    <div className="stat-grid">
      <Link className="stat-card stat-link" href="/dashboard/mahasiswa/status">
        <span>Peminjaman aktif</span>
        <strong>{activeLoans.filter((loan) => loan.status_peminjaman !== "ditolak").length}</strong>
      </Link>
      <Link className="stat-card stat-link" href="/dashboard/mahasiswa/riwayat">
        <span>Riwayat selesai</span>
        <strong>{historyCount}</strong>
      </Link>
      <Link className="stat-card stat-link" href="/dashboard/mahasiswa/notifikasi">
        <span>Notifikasi baru</span>
        <strong>{unreadCount}</strong>
      </Link>
      <Link className="stat-card stat-link" href="/dashboard/mahasiswa/katalog">
        <span>Katalog tersedia</span>
        <strong>{bookCount}</strong>
      </Link>
    </div>
  );
}

export function StudentStatusSection({ loans, preview = false }: { loans: Loan[]; preview?: boolean }) {
  const visibleLoans = preview ? loans.slice(0, 4) : loans;
  const redirectTo = preview ? "/dashboard/mahasiswa" : "/dashboard/mahasiswa/status";

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Status Peminjaman</h2>
          <p className="muted">Pantau proses pengajuan, persetujuan, dan masa pinjam aktif.</p>
        </div>
        {preview ? (
          <Link className="ghost-button" href="/dashboard/mahasiswa/status">
            Lihat Semua
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
                <p className="muted">{loan.buku?.penulis}</p>
                <div className="meta-row">
                  <StatusPill status={loan.status_peminjaman} />
                  <span className="tag">Pinjam {formatDate(loan.tanggal_pinjam)}</span>
                  <span className="tag">Jatuh tempo {formatDate(loan.tanggal_jatuh_tempo)}</span>
                </div>
                {loan.alasan_ditolak ? <p className="muted">Catatan admin: {loan.alasan_ditolak}</p> : null}
              </div>
              {["disetujui", "dipinjam"].includes(loan.status_peminjaman) ? (
                <form className="inline-form" action={requestExtensionAction}>
                  <input type="hidden" name="id_pinjam" value={loan.id_pinjam} />
                  <input type="hidden" name="redirect_to" value={redirectTo} />
                  <select className="select" name="durasi_perpanjangan" defaultValue="7" aria-label="Durasi perpanjangan">
                    <option value="7">7 hari</option>
                    <option value="14">14 hari</option>
                  </select>
                  <button className="subtle-button" type="submit">
                    Ajukan Perpanjangan
                  </button>
                </form>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">Belum ada peminjaman aktif.</div>
      )}
    </section>
  );
}

export function StudentCatalogSection({ books, preview = false }: { books: Book[]; preview?: boolean }) {
  const visibleBooks = preview ? books.slice(0, 4) : books;
  const redirectTo = preview ? "/dashboard/mahasiswa" : "/dashboard/mahasiswa/katalog";

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Katalog Buku</h2>
          <p className="muted">Pilih judul yang tersedia untuk mengirim pengajuan peminjaman.</p>
        </div>
        {preview ? (
          <Link className="ghost-button" href="/dashboard/mahasiswa/katalog">
            Buka Katalog
          </Link>
        ) : null}
      </div>
      <div className="book-grid">
        {visibleBooks.map((book) => (
          <article className="book-card" key={book.id_buku}>
            <BookCover title={book.judul} author={book.penulis} url={book.cover_url} />
            <div>
              <h3>{book.judul}</h3>
              <p className="muted">{book.penulis}</p>
              <div className="meta-row">
                <span className="tag">Stok {book.stok}</span>
                <span className="tag">{book.lokasi_rak || "Rak -"}</span>
              </div>
            </div>
            <form action={requestLoanAction}>
              <input type="hidden" name="id_buku" value={book.id_buku} />
              <input type="hidden" name="redirect_to" value={redirectTo} />
              <button className="button" type="submit" disabled={book.stok <= 0}>
                Ajukan Peminjaman
              </button>
            </form>
          </article>
        ))}
      </div>
    </section>
  );
}

export function StudentNotificationsSection({
  notifications,
  preview = false
}: {
  notifications: Notification[];
  preview?: boolean;
}) {
  const visibleNotifications = preview ? notifications.slice(0, 4) : notifications;
  const redirectTo = preview ? "/dashboard/mahasiswa" : "/dashboard/mahasiswa/notifikasi";

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Notifikasi</h2>
          <p className="muted">Informasi status pengajuan dan pengingat jatuh tempo.</p>
        </div>
        {preview ? (
          <Link className="ghost-button" href="/dashboard/mahasiswa/notifikasi">
            Lihat Notifikasi
          </Link>
        ) : null}
      </div>
      {visibleNotifications.length ? (
        <div className="record-list">
          {visibleNotifications.map((notification) => (
            <article className="record" key={notification.id_notif}>
              <div className="record-main">
                <h3>{notification.jenis}</h3>
                <p>{notification.pesan}</p>
                <p className="muted">{formatDateTime(notification.tanggal_notif)}</p>
              </div>
              {!notification.sudah_dibaca ? (
                <form action={markNotificationReadAction}>
                  <input type="hidden" name="id_notif" value={notification.id_notif} />
                  <input type="hidden" name="redirect_to" value={redirectTo} />
                  <button className="ghost-button" type="submit">
                    Tandai Dibaca
                  </button>
                </form>
              ) : (
                <span className="tag">Dibaca</span>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">Belum ada notifikasi.</div>
      )}
    </section>
  );
}

export function StudentProfileSection({ student }: { student: Student | null }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Profil Anggota</h2>
          <p className="muted">Pastikan data kontak selalu aktif agar notifikasi email dapat diterima.</p>
        </div>
      </div>
      <form className="form-stack" action={updateProfileAction}>
        <input type="hidden" name="redirect_to" value="/dashboard/mahasiswa/profil" />
        <div className="field-group">
          <label htmlFor="nama">Nama</label>
          <input className="field" id="nama" name="nama" defaultValue={student?.nama || ""} />
        </div>
        <div className="field-group">
          <label htmlFor="email">Email</label>
          <input className="field" id="email" name="email" type="email" defaultValue={student?.email || ""} />
        </div>
        <div className="field-group">
          <label htmlFor="nomor_induk">Nomor induk</label>
          <input className="field" id="nomor_induk" name="nomor_induk" defaultValue={student?.nomor_induk || ""} />
        </div>
        <div className="field-group">
          <label htmlFor="jurusan">Jurusan</label>
          <input className="field" id="jurusan" name="jurusan" defaultValue={student?.jurusan || ""} />
        </div>
        <div className="field-group">
          <label htmlFor="no_telepon">No. telepon</label>
          <input className="field" id="no_telepon" name="no_telepon" defaultValue={student?.no_telepon || ""} />
        </div>
        <button className="button" type="submit">
          Simpan Profil
        </button>
      </form>
    </section>
  );
}

export function StudentHistorySection({ history }: { history: Loan[] }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Riwayat Peminjaman</h2>
          <p className="muted">Arsip transaksi buku yang sudah dikembalikan dan divalidasi petugas.</p>
        </div>
      </div>
      {history.length ? (
        <div className="table-panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>Buku</th>
                <th>Tanggal pinjam</th>
                <th>Jatuh tempo</th>
                <th>Tanggal kembali</th>
              </tr>
            </thead>
            <tbody>
              {history.map((loan) => (
                <tr key={loan.id_pinjam}>
                  <td>{loan.buku?.judul || "-"}</td>
                  <td>{formatDate(loan.tanggal_pinjam)}</td>
                  <td>{formatDate(loan.tanggal_jatuh_tempo)}</td>
                  <td>{formatDate(loan.tanggal_kembali_real)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">Riwayat peminjaman masih kosong.</div>
      )}
    </section>
  );
}
