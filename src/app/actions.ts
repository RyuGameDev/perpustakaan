"use server";

import { redirect } from "next/navigation";
import { clearSession, requireSession, setSession } from "@/lib/session";
import { getBookBucket, getSupabaseAdmin } from "@/lib/supabase";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createNotification, notifyAdmins } from "@/lib/notifications";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function numberValue(formData: FormData, key: string, fallback = 0) {
  const value = Number(text(formData, key));
  return Number.isFinite(value) ? value : fallback;
}

function redirectWith(path: string, key: "error" | "success", message: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${key}=${encodeURIComponent(message)}`;
}

function redirectTarget(formData: FormData, fallback: string) {
  const target = text(formData, "redirect_to");

  if (target.startsWith("/dashboard/") || target === "/") {
    return target;
  }

  return fallback;
}

function messageFromError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Terjadi kesalahan. Coba lagi.";
}

async function uploadCover(file: File | null) {
  if (!file || file.size === 0) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Cover buku harus berupa gambar.");
  }

  const supabase = getSupabaseAdmin();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeName = file.name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const path = `covers/${Date.now()}-${safeName || "cover"}.${extension}`;

  const { error } = await supabase.storage
    .from(getBookBucket())
    .upload(path, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
      upsert: true
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(getBookBucket()).getPublicUrl(path);
  return data.publicUrl;
}

export async function registerStudentAction(formData: FormData) {
  let nextPath = "/login";

  try {
    const npm = text(formData, "npm");
    const nama = text(formData, "nama");
    const email = text(formData, "email").toLowerCase();
    const password = text(formData, "password");

    if (!npm || !nama || !email || password.length < 6) {
      throw new Error("Lengkapi NPM, nama, email, dan password minimal 6 karakter.");
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("mahasiswa").insert({
      npm,
      nama,
      email,
      password_hash: hashPassword(password),
      nomor_induk: text(formData, "nomor_induk") || null,
      jurusan: text(formData, "jurusan") || null,
      no_telepon: text(formData, "no_telepon") || null
    });

    if (error) {
      throw error;
    }

    nextPath = redirectWith("/login", "success", "Registrasi berhasil. Silakan login.");
  } catch (error) {
    nextPath = redirectWith("/register", "error", messageFromError(error));
  }

  redirect(nextPath);
}

export async function loginAction(formData: FormData) {
  let nextPath = "/login";

  try {
    const role = text(formData, "role") === "admin" ? "admin" : "mahasiswa";
    const identifier = text(formData, "identifier");
    const password = text(formData, "password");

    if (!identifier || !password) {
      throw new Error("Masukkan username/email dan password.");
    }

    const supabase = getSupabaseAdmin();

    if (role === "admin") {
      const { data, error } = await supabase
        .from("admin")
        .select("id_admin, nama_admin, email_admin, password_hash")
        .eq("email_admin", identifier.toLowerCase())
        .maybeSingle();

      if (error || !data || !verifyPassword(password, data.password_hash)) {
        throw new Error("Kredensial admin tidak valid.");
      }

      await setSession({
        role: "admin",
        id: String(data.id_admin),
        id_admin: data.id_admin,
        name: data.nama_admin,
        email: data.email_admin
      });

      nextPath = "/dashboard/admin";
    } else {
      let query = supabase.from("mahasiswa").select("npm, nama, email, password_hash");

      query = identifier.includes("@")
        ? query.eq("email", identifier.toLowerCase())
        : query.eq("npm", identifier);

      const { data, error } = await query.maybeSingle();

      if (error || !data || !verifyPassword(password, data.password_hash)) {
        throw new Error("Kredensial mahasiswa tidak valid.");
      }

      await setSession({
        role: "mahasiswa",
        id: data.npm,
        npm: data.npm,
        name: data.nama,
        email: data.email
      });

      nextPath = "/dashboard/mahasiswa";
    }
  } catch (error) {
    nextPath = redirectWith("/login", "error", messageFromError(error));
  }

  redirect(nextPath);
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function updateProfileAction(formData: FormData) {
  const session = await requireSession("mahasiswa");
  let nextPath = redirectTarget(formData, "/dashboard/mahasiswa/profil");

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("mahasiswa")
      .update({
        nama: text(formData, "nama"),
        email: text(formData, "email").toLowerCase(),
        nomor_induk: text(formData, "nomor_induk") || null,
        jurusan: text(formData, "jurusan") || null,
        no_telepon: text(formData, "no_telepon") || null
      })
      .eq("npm", session.npm);

    if (error) {
      throw error;
    }

    nextPath = redirectWith(nextPath, "success", "Profil berhasil diperbarui.");
  } catch (error) {
    nextPath = redirectWith(nextPath, "error", messageFromError(error));
  }

  redirect(nextPath);
}

export async function updateAdminProfileAction(formData: FormData) {
  const session = await requireSession("admin");
  let nextPath = redirectTarget(formData, "/dashboard/admin/profil");

  try {
    if (!session.id_admin) {
      throw new Error("Session admin tidak valid. Silakan login ulang.");
    }

    const namaAdmin = text(formData, "nama_admin");
    const emailAdmin = text(formData, "email_admin").toLowerCase();
    const jabatan = text(formData, "jabatan");

    if (!namaAdmin || !emailAdmin) {
      throw new Error("Nama dan email admin wajib diisi.");
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("admin")
      .update({
        nama_admin: namaAdmin,
        email_admin: emailAdmin,
        jabatan: jabatan || null
      })
      .eq("id_admin", session.id_admin);

    if (error) {
      throw error;
    }

    await setSession({
      role: "admin",
      id: String(session.id_admin),
      id_admin: session.id_admin,
      name: namaAdmin,
      email: emailAdmin
    });

    nextPath = redirectWith(nextPath, "success", "Profil admin berhasil diperbarui.");
  } catch (error) {
    nextPath = redirectWith(nextPath, "error", messageFromError(error));
  }

  redirect(nextPath);
}

export async function requestLoanAction(formData: FormData) {
  const session = await requireSession("mahasiswa");
  let nextPath = redirectTarget(formData, "/dashboard/mahasiswa/katalog");

  try {
    const idBuku = numberValue(formData, "id_buku");
    const supabase = getSupabaseAdmin();

    const { data: book, error: bookError } = await supabase
      .from("buku")
      .select("*")
      .eq("id_buku", idBuku)
      .maybeSingle();

    if (bookError || !book) {
      throw new Error("Buku tidak ditemukan.");
    }

    if (book.stok <= 0) {
      throw new Error("Stok buku sedang habis.");
    }

    const { data: existing, error: existingError } = await supabase
      .from("peminjaman")
      .select("id_pinjam")
      .eq("npm", session.npm)
      .eq("id_buku", idBuku)
      .in("status_peminjaman", ["menunggu", "disetujui", "dipinjam"])
      .limit(1)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existing) {
      throw new Error("Kamu masih punya pengajuan atau peminjaman aktif untuk buku ini.");
    }

    const { error } = await supabase.from("peminjaman").insert({
      npm: session.npm,
      id_buku: idBuku,
      status_peminjaman: "menunggu"
    });

    if (error) {
      throw error;
    }

    await notifyAdmins(
      supabase,
      `${session.name} mengajukan peminjaman buku "${book.judul}".`,
      "Pengajuan peminjaman baru",
      "peminjaman"
    );

    nextPath = redirectWith(nextPath, "success", "Pengajuan peminjaman dikirim ke admin.");
  } catch (error) {
    nextPath = redirectWith(nextPath, "error", messageFromError(error));
  }

  redirect(nextPath);
}

export async function requestExtensionAction(formData: FormData) {
  const session = await requireSession("mahasiswa");
  let nextPath = redirectTarget(formData, "/dashboard/mahasiswa/status");

  try {
    const idPinjam = numberValue(formData, "id_pinjam");
    const durasi = numberValue(formData, "durasi_perpanjangan", 7);
    const supabase = getSupabaseAdmin();

    const { data: loan, error: loanError } = await supabase
      .from("peminjaman")
      .select("*, buku(*)")
      .eq("id_pinjam", idPinjam)
      .eq("npm", session.npm)
      .in("status_peminjaman", ["disetujui", "dipinjam"])
      .maybeSingle();

    if (loanError || !loan) {
      throw new Error("Peminjaman aktif tidak ditemukan.");
    }

    const { data: pending, error: pendingError } = await supabase
      .from("perpanjangan")
      .select("id_perpanjangan")
      .eq("id_pinjam", idPinjam)
      .eq("status_perpanjangan", "menunggu")
      .maybeSingle();

    if (pendingError) {
      throw pendingError;
    }

    if (pending) {
      throw new Error("Masih ada permintaan perpanjangan yang menunggu.");
    }

    const { error } = await supabase.from("perpanjangan").insert({
      id_pinjam: idPinjam,
      durasi_perpanjangan: durasi,
      status_perpanjangan: "menunggu"
    });

    if (error) {
      throw error;
    }

    await notifyAdmins(
      supabase,
      `${session.name} mengajukan perpanjangan untuk buku "${loan.buku?.judul || "tanpa judul"}".`,
      "Pengajuan perpanjangan baru",
      "perpanjangan"
    );

    nextPath = redirectWith(nextPath, "success", "Permintaan perpanjangan dikirim.");
  } catch (error) {
    nextPath = redirectWith(nextPath, "error", messageFromError(error));
  }

  redirect(nextPath);
}

export async function markNotificationReadAction(formData: FormData) {
  const session = await requireSession();
  const idNotif = numberValue(formData, "id_notif");
  const supabase = getSupabaseAdmin();
  const nextPath = redirectTarget(formData, session.role === "admin" ? "/dashboard/admin" : "/dashboard/mahasiswa/notifikasi");

  let query = supabase.from("notifikasi").update({ sudah_dibaca: true }).eq("id_notif", idNotif);
  query = session.role === "admin" ? query.eq("id_admin", session.id_admin) : query.eq("npm", session.npm);

  await query;
  redirect(nextPath);
}

export async function createBookAction(formData: FormData) {
  await requireSession("admin");
  let nextPath = redirectTarget(formData, "/dashboard/admin/buku");

  try {
    const supabase = getSupabaseAdmin();
    const cover = formData.get("cover") instanceof File ? (formData.get("cover") as File) : null;
    const coverUrl = await uploadCover(cover);

    const { error } = await supabase.from("buku").insert({
      judul: text(formData, "judul"),
      penulis: text(formData, "penulis"),
      penerbit: text(formData, "penerbit") || null,
      tahun_terbit: numberValue(formData, "tahun_terbit") || null,
      isbn: text(formData, "isbn") || null,
      kategori: text(formData, "kategori") || null,
      lokasi_rak: text(formData, "lokasi_rak") || null,
      stok: numberValue(formData, "stok"),
      cover_url: coverUrl || text(formData, "cover_url") || null
    });

    if (error) {
      throw error;
    }

    nextPath = redirectWith(nextPath, "success", "Data buku berhasil ditambahkan.");
  } catch (error) {
    nextPath = redirectWith(nextPath, "error", messageFromError(error));
  }

  redirect(nextPath);
}

export async function updateBookAction(formData: FormData) {
  await requireSession("admin");
  let nextPath = redirectTarget(formData, "/dashboard/admin/buku");

  try {
    const supabase = getSupabaseAdmin();
    const idBuku = numberValue(formData, "id_buku");
    const cover = formData.get("cover") instanceof File ? (formData.get("cover") as File) : null;
    const coverUrl = await uploadCover(cover);

    const payload: Record<string, string | number | null> = {
      judul: text(formData, "judul"),
      penulis: text(formData, "penulis"),
      penerbit: text(formData, "penerbit") || null,
      tahun_terbit: numberValue(formData, "tahun_terbit") || null,
      isbn: text(formData, "isbn") || null,
      kategori: text(formData, "kategori") || null,
      lokasi_rak: text(formData, "lokasi_rak") || null,
      stok: numberValue(formData, "stok")
    };

    if (coverUrl) {
      payload.cover_url = coverUrl;
    }

    const { error } = await supabase.from("buku").update(payload).eq("id_buku", idBuku);

    if (error) {
      throw error;
    }

    nextPath = redirectWith(nextPath, "success", "Data buku diperbarui.");
  } catch (error) {
    nextPath = redirectWith(nextPath, "error", messageFromError(error));
  }

  redirect(nextPath);
}

export async function deleteBookAction(formData: FormData) {
  await requireSession("admin");
  let nextPath = redirectTarget(formData, "/dashboard/admin/buku");

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("buku").delete().eq("id_buku", numberValue(formData, "id_buku"));

    if (error) {
      throw error;
    }

    nextPath = redirectWith(nextPath, "success", "Data buku dihapus.");
  } catch (error) {
    nextPath = redirectWith(nextPath, "error", "Buku tidak bisa dihapus jika sudah memiliki transaksi.");
  }

  redirect(nextPath);
}

export async function approveLoanAction(formData: FormData) {
  const session = await requireSession("admin");
  let nextPath = redirectTarget(formData, "/dashboard/admin/peminjaman");

  try {
    const supabase = getSupabaseAdmin();
    const idPinjam = numberValue(formData, "id_pinjam");
    const durasi = numberValue(formData, "durasi", Number(process.env.DEFAULT_LOAN_DAYS || 7));

    const { error } = await supabase.rpc("approve_loan", {
      p_id_pinjam: idPinjam,
      p_id_admin: Number(session.id_admin || session.id),
      p_durasi_hari: durasi
    });

    if (error) {
      throw error;
    }

    const { data: loan } = await supabase
      .from("peminjaman")
      .select("*, buku(*), mahasiswa(*)")
      .eq("id_pinjam", idPinjam)
      .single();

    if (loan?.mahasiswa) {
      await createNotification(supabase, {
        targetRole: "mahasiswa",
        npm: loan.npm,
        email: loan.mahasiswa.email,
        subject: "Peminjaman disetujui",
        message: `Peminjaman buku "${loan.buku?.judul || "tanpa judul"}" disetujui. Jatuh tempo: ${loan.tanggal_jatuh_tempo}.`,
        jenis: "peminjaman"
      });
    }

    nextPath = redirectWith(nextPath, "success", "Peminjaman disetujui.");
  } catch (error) {
    nextPath = redirectWith(nextPath, "error", messageFromError(error));
  }

  redirect(nextPath);
}

export async function rejectLoanAction(formData: FormData) {
  const session = await requireSession("admin");
  let nextPath = redirectTarget(formData, "/dashboard/admin/peminjaman");

  try {
    const supabase = getSupabaseAdmin();
    const idPinjam = numberValue(formData, "id_pinjam");
    const alasan = text(formData, "alasan") || "Pengajuan belum dapat disetujui.";

    const { data: loan, error: fetchError } = await supabase
      .from("peminjaman")
      .select("*, buku(*), mahasiswa(*)")
      .eq("id_pinjam", idPinjam)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    const { error } = await supabase
      .from("peminjaman")
      .update({
        id_admin: Number(session.id_admin || session.id),
        status_peminjaman: "ditolak",
        alasan_ditolak: alasan
      })
      .eq("id_pinjam", idPinjam)
      .eq("status_peminjaman", "menunggu");

    if (error) {
      throw error;
    }

    if (loan?.mahasiswa) {
      await createNotification(supabase, {
        targetRole: "mahasiswa",
        npm: loan.npm,
        email: loan.mahasiswa.email,
        subject: "Peminjaman ditolak",
        message: `Pengajuan buku "${loan.buku?.judul || "tanpa judul"}" ditolak. Alasan: ${alasan}`,
        jenis: "peminjaman"
      });
    }

    nextPath = redirectWith(nextPath, "success", "Peminjaman ditolak.");
  } catch (error) {
    nextPath = redirectWith(nextPath, "error", messageFromError(error));
  }

  redirect(nextPath);
}

export async function returnLoanAction(formData: FormData) {
  const session = await requireSession("admin");
  let nextPath = redirectTarget(formData, "/dashboard/admin/pengembalian");

  try {
    const supabase = getSupabaseAdmin();
    const idPinjam = numberValue(formData, "id_pinjam");

    const { error } = await supabase.rpc("return_loan", {
      p_id_pinjam: idPinjam,
      p_id_admin: Number(session.id_admin || session.id)
    });

    if (error) {
      throw error;
    }

    const { data: loan } = await supabase
      .from("peminjaman")
      .select("*, buku(*), mahasiswa(*)")
      .eq("id_pinjam", idPinjam)
      .single();

    if (loan?.mahasiswa) {
      await createNotification(supabase, {
        targetRole: "mahasiswa",
        npm: loan.npm,
        email: loan.mahasiswa.email,
        subject: "Pengembalian berhasil",
        message: `Pengembalian buku "${loan.buku?.judul || "tanpa judul"}" sudah divalidasi admin.`,
        jenis: "pengembalian"
      });
    }

    nextPath = redirectWith(nextPath, "success", "Pengembalian diproses dan stok bertambah.");
  } catch (error) {
    nextPath = redirectWith(nextPath, "error", messageFromError(error));
  }

  redirect(nextPath);
}

export async function approveExtensionAction(formData: FormData) {
  const session = await requireSession("admin");
  let nextPath = redirectTarget(formData, "/dashboard/admin/perpanjangan");

  try {
    const supabase = getSupabaseAdmin();
    const idPerpanjangan = numberValue(formData, "id_perpanjangan");

    const { error } = await supabase.rpc("approve_extension", {
      p_id_perpanjangan: idPerpanjangan,
      p_id_admin: Number(session.id_admin || session.id)
    });

    if (error) {
      throw error;
    }

    const { data: extension } = await supabase
      .from("perpanjangan")
      .select("*, peminjaman(*, buku(*), mahasiswa(*))")
      .eq("id_perpanjangan", idPerpanjangan)
      .single();

    const loan = extension?.peminjaman;

    if (loan?.mahasiswa) {
      await createNotification(supabase, {
        targetRole: "mahasiswa",
        npm: loan.npm,
        email: loan.mahasiswa.email,
        subject: "Perpanjangan disetujui",
        message: `Perpanjangan buku "${loan.buku?.judul || "tanpa judul"}" disetujui. Jatuh tempo baru: ${loan.tanggal_jatuh_tempo}.`,
        jenis: "perpanjangan"
      });
    }

    nextPath = redirectWith(nextPath, "success", "Perpanjangan disetujui.");
  } catch (error) {
    nextPath = redirectWith(nextPath, "error", messageFromError(error));
  }

  redirect(nextPath);
}

export async function rejectExtensionAction(formData: FormData) {
  const session = await requireSession("admin");
  let nextPath = redirectTarget(formData, "/dashboard/admin/perpanjangan");

  try {
    const supabase = getSupabaseAdmin();
    const idPerpanjangan = numberValue(formData, "id_perpanjangan");
    const alasan = text(formData, "alasan") || "Perpanjangan belum dapat disetujui.";

    const { data: extension, error: fetchError } = await supabase
      .from("perpanjangan")
      .select("*, peminjaman(*, buku(*), mahasiswa(*))")
      .eq("id_perpanjangan", idPerpanjangan)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    const { error } = await supabase
      .from("perpanjangan")
      .update({
        id_admin: Number(session.id_admin || session.id),
        status_perpanjangan: "ditolak",
        tanggal_perpanjangan: new Date().toISOString().slice(0, 10),
        alasan_ditolak: alasan
      })
      .eq("id_perpanjangan", idPerpanjangan)
      .eq("status_perpanjangan", "menunggu");

    if (error) {
      throw error;
    }

    const loan = extension?.peminjaman;

    if (loan?.mahasiswa) {
      await createNotification(supabase, {
        targetRole: "mahasiswa",
        npm: loan.npm,
        email: loan.mahasiswa.email,
        subject: "Perpanjangan ditolak",
        message: `Perpanjangan buku "${loan.buku?.judul || "tanpa judul"}" ditolak. Alasan: ${alasan}`,
        jenis: "perpanjangan"
      });
    }

    nextPath = redirectWith(nextPath, "success", "Perpanjangan ditolak.");
  } catch (error) {
    nextPath = redirectWith(nextPath, "error", messageFromError(error));
  }

  redirect(nextPath);
}
