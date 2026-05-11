export function SetupErrorPanel() {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Database Belum Terhubung</h2>
      </div>
      <p className="muted">
        Skema database aplikasi belum tersedia pada project Supabase yang sedang digunakan. Jalankan <strong>supabase/schema.sql</strong> lalu <strong>supabase/seed.sql</strong> melalui Supabase SQL Editor.
      </p>
      <div className="meta-row">
        <span className="tag">Verifikasi .env.local</span>
        <span className="tag">Jalankan schema.sql</span>
        <span className="tag">Jalankan seed.sql</span>
      </div>
    </section>
  );
}
