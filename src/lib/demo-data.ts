import type { Book } from "./types";

export const demoBooks: Book[] = [
  {
    id_buku: 1,
    judul: "Clean Code",
    penulis: "Robert C. Martin",
    penerbit: "Prentice Hall",
    tahun_terbit: 2008,
    isbn: "9780132350884",
    kategori: "Pemrograman",
    lokasi_rak: "A-01",
    stok: 5,
    cover_url: "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg"
  },
  {
    id_buku: 2,
    judul: "Database System Concepts",
    penulis: "Abraham Silberschatz",
    penerbit: "McGraw-Hill",
    tahun_terbit: 2019,
    isbn: "9780078022159",
    kategori: "Database",
    lokasi_rak: "B-03",
    stok: 4,
    cover_url: "https://covers.openlibrary.org/b/isbn/9780078022159-L.jpg"
  },
  {
    id_buku: 3,
    judul: "Introduction to Algorithms",
    penulis: "Thomas H. Cormen",
    penerbit: "MIT Press",
    tahun_terbit: 2022,
    isbn: "9780262046305",
    kategori: "Algoritma",
    lokasi_rak: "C-02",
    stok: 3,
    cover_url: "https://covers.openlibrary.org/b/isbn/9780262046305-L.jpg"
  }
];
