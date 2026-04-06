/** URL pública del sitio (sin barra final). En Vercel: NEXT_PUBLIC_APP_URL. */
export function getSiteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(path: string): string {
  const base = getSiteOrigin();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export const siteConfig = {
  name: "Ana Harff",
  tagline: "Fotografía analógica",
  locale: "es_AR",
  defaultTitle: "Ana Harff | Fotografía analógica | Buenos Aires",
  defaultDescription:
    "Fotografía analógica en Buenos Aires. Portfolio de retratos, desnudos artísticos y series. Igualdad, diversidad y autenticidad corporal.",
} as const;

export const portfolioSlugs = ["desnudos", "retratos", "artistico", "experimental"] as const;

export const seriesSlugs = [
  "unica",
  "ser-gorda",
  "venus-as-a-boy",
  "desde-la-distancia",
] as const;
