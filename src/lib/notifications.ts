import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "./email";
import type { Role } from "./types";

type NotificationInput = {
  targetRole: Role;
  email: string;
  message: string;
  subject: string;
  jenis?: string;
  npm?: string | null;
  idAdmin?: number | null;
};

export async function createNotification(supabase: SupabaseClient, input: NotificationInput) {
  let emailStatus = "pending";
  let sentAt: string | null = null;

  try {
    const result = await sendEmail({
      to: input.email,
      subject: input.subject,
      message: input.message
    });
    emailStatus = result.status;
    sentAt = result.status === "sent" ? new Date().toISOString() : null;
  } catch (error) {
    emailStatus = "failed";
    console.error(error);
  }

  const { error } = await supabase.from("notifikasi").insert({
    npm: input.npm || null,
    id_admin: input.idAdmin || null,
    target_role: input.targetRole,
    email_tujuan: input.email,
    pesan: input.message,
    jenis: input.jenis || "status",
    email_status: emailStatus,
    sent_at: sentAt
  });

  if (error) {
    throw error;
  }
}

export async function notifyAdmins(supabase: SupabaseClient, message: string, subject: string, jenis = "permintaan") {
  const { data, error } = await supabase.from("admin").select("id_admin, email_admin");

  if (error) {
    throw error;
  }

  await Promise.all(
    (data || []).map((admin) =>
      createNotification(supabase, {
        targetRole: "admin",
        idAdmin: admin.id_admin,
        email: admin.email_admin,
        subject,
        message,
        jenis
      })
    )
  );
}
