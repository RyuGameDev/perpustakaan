import "server-only";

import { isMissingSchemaError } from "./errors";
import { getAdminDashboard, getStudentDashboard } from "./queries";
import { getSupabaseAdmin } from "./supabase";
import type { Admin, Student } from "./types";

export async function getSafeAdminDashboard() {
  try {
    return {
      dashboard: await getAdminDashboard(),
      setupError: false
    };
  } catch (error) {
    if (!isMissingSchemaError(error)) {
      throw error;
    }

    return {
      dashboard: null,
      setupError: true
    };
  }
}

export async function getSafeAdminProfile(idAdmin: number) {
  const supabase = getSupabaseAdmin();

  try {
    const { data } = await supabase
      .from("admin")
      .select("id_admin, nama_admin, email_admin, jabatan")
      .eq("id_admin", idAdmin)
      .single();

    return {
      profile: (data || null) as Admin | null,
      setupError: false
    };
  } catch (error) {
    if (!isMissingSchemaError(error)) {
      throw error;
    }

    return {
      profile: null,
      setupError: true
    };
  }
}

export async function getSafeStudentDashboard(npm: string) {
  const supabase = getSupabaseAdmin();

  try {
    const [profile, dashboard] = await Promise.all([
      supabase.from("mahasiswa").select("npm, nama, email, nomor_induk, jurusan, no_telepon").eq("npm", npm).single(),
      getStudentDashboard(npm)
    ]);

    return {
      profile: (profile.data || null) as Student | null,
      dashboard,
      setupError: false
    };
  } catch (error) {
    if (!isMissingSchemaError(error)) {
      throw error;
    }

    return {
      profile: null,
      dashboard: null,
      setupError: true
    };
  }
}
