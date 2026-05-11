insert into admin (id_admin, nama_admin, email_admin, password_hash, jabatan)
values (
  1,
  'Admin Perpustakaan',
  'admin@kampus.ac.id',
  'scrypt$02c727b1e9e3cc5ba64cf779f2c95028$91b65098c07a6ea8661a8da69acd9febf58ebd1b544cd3b67061502cd8841c596b0be673aacca2a1cf8270573b4c672fc77ff483f42e6baf5d73b3176408e8fd',
  'Petugas Perpustakaan'
)
on conflict (id_admin) do update
set nama_admin = excluded.nama_admin,
    email_admin = excluded.email_admin,
    password_hash = excluded.password_hash,
    jabatan = excluded.jabatan;

insert into mahasiswa (npm, nama, email, password_hash, nomor_induk, jurusan, no_telepon)
values (
  '2210631170001',
  'Ryu Mahasiswa',
  'mahasiswa@kampus.ac.id',
  'scrypt$6f624c986486a6a2e12f26a923e82452$a4cf82ae744df77653443ff992815da3d0b718a34c19fc5f55fc1934394021386df559fcfeaa25cda5a752c8b45b4670ddaef714e647ed87d3a0378219003358',
  'MHS-0001',
  'Sistem Informasi',
  '081234567890'
)
on conflict (npm) do update
set nama = excluded.nama,
    email = excluded.email,
    password_hash = excluded.password_hash,
    nomor_induk = excluded.nomor_induk,
    jurusan = excluded.jurusan,
    no_telepon = excluded.no_telepon;

insert into buku (id_buku, judul, penulis, penerbit, tahun_terbit, isbn, kategori, lokasi_rak, stok, cover_url)
values
  (1, 'Clean Code', 'Robert C. Martin', 'Prentice Hall', 2008, '9780132350884', 'Pemrograman', 'A-01', 5, 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg'),
  (2, 'Database System Concepts', 'Abraham Silberschatz', 'McGraw-Hill', 2019, '9780078022159', 'Database', 'B-03', 4, 'https://covers.openlibrary.org/b/isbn/9780078022159-L.jpg'),
  (3, 'Introduction to Algorithms', 'Thomas H. Cormen', 'MIT Press', 2022, '9780262046305', 'Algoritma', 'C-02', 3, 'https://covers.openlibrary.org/b/isbn/9780262046305-L.jpg'),
  (4, 'Designing Data-Intensive Applications', 'Martin Kleppmann', 'O''Reilly Media', 2017, '9781449373320', 'Sistem Terdistribusi', 'D-04', 2, 'https://covers.openlibrary.org/b/isbn/9781449373320-L.jpg')
on conflict (id_buku) do update
set judul = excluded.judul,
    penulis = excluded.penulis,
    penerbit = excluded.penerbit,
    tahun_terbit = excluded.tahun_terbit,
    isbn = excluded.isbn,
    kategori = excluded.kategori,
    lokasi_rak = excluded.lokasi_rak,
    stok = excluded.stok,
    cover_url = excluded.cover_url;

select setval(pg_get_serial_sequence('admin', 'id_admin'), coalesce((select max(id_admin) from admin), 1), true);
select setval(pg_get_serial_sequence('buku', 'id_buku'), coalesce((select max(id_buku) from buku), 1), true);
