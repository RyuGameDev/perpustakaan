export type Role = "mahasiswa" | "admin";

export type SessionUser = {
  role: Role;
  id: string;
  name: string;
  email: string;
  npm?: string;
  id_admin?: number;
  expiresAt: number;
};

export type Book = {
  id_buku: number;
  judul: string;
  penulis: string;
  penerbit: string | null;
  tahun_terbit: number | null;
  isbn: string | null;
  kategori: string | null;
  lokasi_rak: string | null;
  stok: number;
  cover_url: string | null;
};

export type Student = {
  npm: string;
  nama: string;
  email: string;
  nomor_induk: string | null;
  jurusan: string | null;
  no_telepon: string | null;
};

export type Admin = {
  id_admin: number;
  nama_admin: string;
  email_admin: string;
  jabatan: string | null;
};

export type LoanStatus = "menunggu" | "disetujui" | "ditolak" | "dipinjam" | "dikembalikan";

export type Loan = {
  id_pinjam: number;
  npm: string;
  id_buku: number;
  id_admin: number | null;
  tanggal_pinjam: string | null;
  tanggal_jatuh_tempo: string | null;
  tanggal_kembali_real: string | null;
  status_peminjaman: LoanStatus;
  alasan_ditolak: string | null;
  created_at: string;
  buku?: Book | null;
  mahasiswa?: Student | null;
};

export type ExtensionStatus = "menunggu" | "disetujui" | "ditolak";

export type LoanExtension = {
  id_perpanjangan: number;
  id_admin: number | null;
  id_pinjam: number;
  tanggal_perpanjangan: string | null;
  durasi_perpanjangan: number;
  status_perpanjangan: ExtensionStatus;
  alasan_ditolak: string | null;
  created_at: string;
  peminjaman?: Loan | null;
};

export type Notification = {
  id_notif: number;
  npm: string | null;
  id_admin: number | null;
  target_role: Role;
  email_tujuan: string;
  pesan: string;
  jenis: string;
  tanggal_notif: string;
  sudah_dibaca: boolean;
  email_status: string;
};
