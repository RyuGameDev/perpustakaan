import "server-only";

import nodemailer from "nodemailer";

type EmailPayload = {
  to: string;
  subject: string;
  message: string;
};

function smtpReady() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
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

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "Perpustakaan Online <noreply@localhost>",
    to,
    subject,
    text: message,
    html: `<p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>`
  });

  return { status: "sent" as const };
}
