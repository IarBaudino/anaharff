import { siteConfig } from "@/lib/seo";

const DEFAULT_FROM = "Ana Harff <hola@gmail.com>";

/**
 * Gmail SMTP: la clienta usa su Gmail + contraseña de aplicación (Google → Seguridad).
 * Sin cuentas en Brevo/Resend ni dominio propio.
 */
export function isEmailConfigured(): boolean {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  return Boolean(user && pass && user.includes("@"));
}

export function getSmtpHost(): string {
  return process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
}

export function getSmtpPort(): number {
  const raw = process.env.SMTP_PORT?.trim();
  const port = raw ? Number(raw) : 587;
  return Number.isFinite(port) && port > 0 ? port : 587;
}

export function getSmtpUser(): string {
  const user = process.env.SMTP_USER?.trim();
  if (user) return user;
  return getEmailFrom().email;
}

/** Gmail app passwords suelen copiarse con espacios: «abcd efgh …». */
export function getSmtpPass(): string {
  return (process.env.SMTP_PASS?.trim() || "").replace(/\s+/g, "");
}

export function getEmailFromRaw(): string {
  const from = process.env.EMAIL_FROM?.trim();
  if (from) return from;
  const user = getSmtpUser();
  return user ? `${siteConfig.name} <${user}>` : DEFAULT_FROM;
}

export function parseEmailFrom(raw: string): { name: string; email: string } {
  const trimmed = raw.trim();
  const match = trimmed.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { name: siteConfig.name, email: trimmed };
}

export function getEmailFrom(): { name: string; email: string } {
  return parseEmailFrom(getEmailFromRaw());
}

export function formatEmailFromAddress(sender: { name: string; email: string }): string {
  const safeName = sender.name.replace(/"/g, "'");
  return `"${safeName}" <${sender.email}>`;
}

/** Bandeja de Ana: contacto, avisos de venta, etc. */
export function getAdminEmail(): string | null {
  const raw =
    process.env.ADMIN_EMAIL?.trim() ||
    process.env.CONTACT_TO_EMAIL?.trim() ||
    getSmtpUser() ||
    null;
  return raw && raw.includes("@") ? raw : null;
}

export function getSiteName(): string {
  return siteConfig.name;
}
