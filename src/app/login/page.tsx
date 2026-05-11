import { BookOpen, LogIn } from "lucide-react";
import Link from "next/link";
import { loginAction } from "../actions";
import { FlashMessage } from "@/components/flash-message";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams?: Promise<{
    success?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();

  if (session) {
    redirect(session.role === "admin" ? "/dashboard/admin" : "/dashboard/mahasiswa");
  }

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

        <h1>Login</h1>
        <p className="lead">Masuk ke dashboard layanan sesuai peran akun Anda.</p>
        <FlashMessage success={params?.success} error={params?.error} />

        <form className="form-stack" action={loginAction}>
          <div className="role-toggle">
            <label>
              <input type="radio" name="role" value="mahasiswa" defaultChecked />
              <span>Mahasiswa</span>
            </label>
            <label>
              <input type="radio" name="role" value="admin" />
              <span>Admin</span>
            </label>
          </div>

          <div className="field-group">
            <label htmlFor="identifier">NPM atau email kerja</label>
            <input className="field" id="identifier" name="identifier" placeholder="2210631170001 atau admin@kampus.ac.id" />
          </div>
          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input className="field" id="password" name="password" type="password" placeholder="Masukkan password" />
          </div>
          <button className="button" type="submit">
            <LogIn size={16} />
            Masuk
          </button>
        </form>

        <p className="muted">
          Belum terdaftar sebagai anggota? <Link href="/register">Daftar akun</Link>
        </p>
      </section>
    </main>
  );
}
