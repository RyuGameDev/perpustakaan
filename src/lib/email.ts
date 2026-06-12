import "server-only";

import nodemailer from "nodemailer";

type EmailPayload = {
  to: string;
  subject: string;
  message: string;
};

function emailEnv(key: "HOST" | "PORT" | "SECURE" | "USER" | "PASS" | "FROM") {
  return process.env[`SMTP_${key}`] || process.env[`EMAIL_${key}`];
}

function smtpReady() {
  return Boolean(emailEnv("HOST") && emailEnv("USER") && emailEnv("PASS"));
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendEmail({ to, subject, message }: EmailPayload) {
  if (!smtpReady()) {
    console.log(`[email skipped] ${to} - ${subject}: ${message}`);
    return { status: "skipped" as const };
  }

  const port = Number(emailEnv("PORT") || 587);
  const secureEnv = emailEnv("SECURE");

  const transporter = nodemailer.createTransport({
    host: emailEnv("HOST"),
    port,
    secure: secureEnv ? secureEnv === "true" : port === 465,
    auth: {
      user: emailEnv("USER"),
      pass: emailEnv("PASS")
    }
  });

  await transporter.sendMail({
    from: emailEnv("FROM") || "Perpustakaan Online <noreply@localhost>",
    to,
    subject,
    text: message,
    html: `<p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>`
  });

  return { status: "sent" as const };
}
