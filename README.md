# Perpustakaan Online

Web peminjaman dan pengembalian buku berbasis Next.js dan Supabase, dengan custom auth sesuai rancangan database.

## Stack

- Next.js + TypeScript
- Supabase PostgreSQL + Storage
- Custom session cookie
- Email SMTP via Nodemailer
- Siap deploy ke Vercel; bisa juga dijalankan di Railway

## Setup Supabase

1. Buat project Supabase.
2. Buka SQL Editor, jalankan `supabase/schema.sql`.
3. Jalankan `supabase/seed.sql` untuk data awal.
4. Pastikan bucket `book-covers` sudah public. Script schema sudah mencoba membuat bucket ini otomatis.

## Setup Lokal

1. Copy `.env.example` menjadi `.env.local`.
2. Isi `NEXT_PUBLIC_SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY`.
3. Isi SMTP agar notifikasi email benar-benar terkirim.
4. Jalankan:

```bash
npm install
npm run dev
```

Default akun dari seed:

- Admin: `admin@kampus.ac.id` / `admin12345`
- Mahasiswa: `2210631170001` / `mahasiswa123`

## Generate Password Hash

Kalau ingin menambah admin langsung dari database:

```bash
npm run hash-password -- passwordBaru
```

Masukkan hasil hash ke kolom `password_hash` tabel `admin` atau `mahasiswa`.

## Catatan Deploy

Untuk Vercel, isi environment variable yang sama seperti `.env.example`. Cron reminder jatuh tempo sudah tersedia di `vercel.json`.

Untuk Railway, gunakan command:

```bash
npm run build
npm run start
```
