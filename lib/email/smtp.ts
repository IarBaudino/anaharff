import nodemailer from "nodemailer";
import {
  formatEmailFromAddress,
  getEmailFrom,
  getSmtpHost,
  getSmtpPass,
  getSmtpPort,
  getSmtpUser,
  isEmailConfigured,
} from "@/lib/email/config";

type SendSmtpParams = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

function normalizeRecipients(to: string | string[]): string[] {
  const list = Array.isArray(to) ? to : [to];
  return [...new Set(list.map((email) => email.trim()).filter((email) => email.includes("@")))];
}

export async function sendViaSmtp(
  params: SendSmtpParams
): Promise<{ ok: boolean; error?: string }> {
  if (!isEmailConfigured()) {
    return { ok: false, error: "email_not_configured" };
  }

  const recipients = normalizeRecipients(params.to);
  if (!recipients.length) {
    return { ok: false, error: "invalid_recipient" };
  }

  const user = getSmtpUser();
  const pass = getSmtpPass();
  if (!user || !pass) {
    return { ok: false, error: "email_not_configured" };
  }

  const transporter = nodemailer.createTransport({
    host: getSmtpHost(),
    port: getSmtpPort(),
    secure: getSmtpPort() === 465,
    auth: { user, pass },
  });

  const from = formatEmailFromAddress(getEmailFrom());

  try {
    await transporter.sendMail({
      from,
      to: recipients.join(", "),
      subject: params.subject,
      html: params.html,
      ...(params.replyTo?.includes("@") ? { replyTo: params.replyTo.trim() } : {}),
    });
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "send_failed";
    console.error("[email] SMTP error:", e);
    if (/invalid login|username and password|authentication/i.test(msg)) {
      return {
        ok: false,
        error:
          "smtp_auth_failed: revisá SMTP_USER y la contraseña de aplicación de Google (16 caracteres)",
      };
    }
    return { ok: false, error: msg };
  }
}
