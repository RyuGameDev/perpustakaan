import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role, SessionUser } from "./types";

const COOKIE_NAME = "perpus_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

function getSecret() {
  return process.env.APP_SECRET || "dev-secret-change-me";
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function safeCompare(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function createSessionToken(session: Omit<SessionUser, "expiresAt">) {
  const payload: SessionUser = {
    ...session,
    expiresAt: Date.now() + SESSION_SECONDS * 1000
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export async function setSession(session: Omit<SessionUser, "expiresAt">) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createSessionToken(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const [encoded, signature] = token.split(".");

  if (!encoded || !signature || !safeCompare(signature, sign(encoded))) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionUser;

    if (!session.expiresAt || session.expiresAt < Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function requireSession(role?: Role) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (role && session.role !== role) {
    redirect(session.role === "admin" ? "/dashboard/admin" : "/dashboard/mahasiswa");
  }

  return session;
}
