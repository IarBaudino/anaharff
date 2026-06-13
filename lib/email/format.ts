export function formatMoneyArs(amount: number, currency = "ARS"): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return `${currency} $${value.toLocaleString("es-AR")}`;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
