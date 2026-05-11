import { BookOpen, UserPlus } from "lucide-react";
import Link from "next/link";
import { registerStudentAction } from "../actions";
import { FlashMessage } from "@/components/flash-message";

type RegisterPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="brand" href="/">
          <span className="brand-mark">
            <BookOpen size={22} />
          </span>
          <span>Perpustakaan Digital</span>
        </Link>

        <div className="auth-nav">
          <Link className="ghost-button" href="/">
            Katalog
          </Link>
          <Link className="subtle-button" href="/login">
            Login
          </Link>
        </div>

        <h1>Daftar Anggota</h1>
        <p className="lead">Aktivasi akun anggota dilakukan otomatis setelah data berhasil disimpan.</p>
        <FlashMessage error={params?.error} />

        <form className="form-stack" action={registerStudentAction}>
          <div className="field-group">
            <label htmlFor="npm">NPM</label>
            <input className="field" id="npm" name="npm" placeholder="2210631170001" />
          </div>
          <div className="field-group">
            <label htmlFor="nama">Nama lengkap</label>
            <input className="field" id="nama" name="nama" placeholder="Nama mahasiswa" />
          </div>
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input className="field" id="email" name="email" type="email" placeholder="nama@kampus.ac.id" />
          </div>
          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input className="field" id="password" name="password" type="password" placeholder="Minimal 6 karakter" />
          </div>
          <div className="field-group">
            <label htmlFor="jurusan">Jurusan</label>
            <input className="field" id="jurusan" name="jurusan" placeholder="Sistem Informasi" />
          </div>
          <div className="field-group">
            <label htmlFor="no_telepon">No. telepon</label>
            <input className="field" id="no_telepon" name="no_telepon" placeholder="081234567890" />
          </div>
          <button className="button" type="submit">
            <UserPlus size={16} />
            Daftar
          </button>
        </form>

        <p className="muted">
          Sudah punya akun? <Link href="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
