import { NextRequest, NextResponse } from "next/server";
import { createNotification } from "@/lib/notifications";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

function jakartaDate(offsetDays: number) {
  const date = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");

  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const today = jakartaDate(0);
  const tomorrow = jakartaDate(1);

  const { data, error } = await supabase
    .from("peminjaman")
    .select("*, buku(*), mahasiswa(*)")
    .in("status_peminjaman", ["disetujui", "dipinjam"])
    .in("tanggal_jatuh_tempo", [today, tomorrow]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await Promise.all(
    (data || []).map((loan) => {
      const isToday = loan.tanggal_jatuh_tempo === today;
      return createNotification(supabase, {
        targetRole: "mahasiswa",
        npm: loan.npm,
        email: loan.mahasiswa.email,
        subject: isToday ? "Buku jatuh tempo hari ini" : "Buku jatuh tempo besok",
        message: `Buku "${loan.buku.judul}" ${isToday ? "jatuh tempo hari ini" : "jatuh tempo besok"}.`,
        jenis: "pengingat"
      });
    })
  );

  return NextResponse.json({
    ok: true,
    sent: data?.length || 0,
    dates: [today, tomorrow]
  });
}
