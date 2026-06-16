export type ShippingZoneId = "buenos_aires" | "resto_argentina" | "internacional";

export interface TiendaEnvios {
  buenosAires: number;
  restoArgentina: number;
  internacional: number;
}

export const SHIPPING_ZONE_OPTIONS: {
  id: ShippingZoneId;
  label: string;
  hint: string;
}[] = [
  {
    id: "buenos_aires",
    label: "CABA y GBA",
    hint: "Ciudad Autónoma de Buenos Aires y Gran Buenos Aires.",
  },
  {
    id: "resto_argentina",
    label: "Resto de Argentina",
    hint: "Provincias fuera de CABA y GBA.",
  },
  {
    id: "internacional",
    label: "Internacional",
    hint: "Envíos fuera de Argentina.",
  },
];

export const SHIPPING_LINE_ITEM_ID = "__envio__";

export interface ShippingAddress {
  nombre: string;
  telefono: string;
  calle: string;
  numero: string;
  piso?: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  pais: string;
  zona: ShippingZoneId;
  notas?: string;
}

export function emptyShippingAddress(zona: ShippingZoneId = "buenos_aires"): ShippingAddress {
  return {
    nombre: "",
    telefono: "",
    calle: "",
    numero: "",
    piso: "",
    ciudad: "",
    provincia: zona === "buenos_aires" ? "CABA" : "",
    codigoPostal: "",
    pais: zona === "internacional" ? "" : "Argentina",
    zona,
    notas: "",
  };
}

export function normalizeShippingZoneId(raw: unknown): ShippingZoneId {
  if (raw === "resto_argentina" || raw === "internacional") return raw;
  return "buenos_aires";
}

export function shippingZoneLabel(zona: ShippingZoneId): string {
  return SHIPPING_ZONE_OPTIONS.find((z) => z.id === zona)?.label ?? zona;
}

export function normalizeTiendaEnvios(raw: unknown): TiendaEnvios {
  const row = raw && typeof raw === "object" ? (raw as Partial<TiendaEnvios>) : {};
  const num = (v: unknown) =>
    typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.round(v)) : 0;
  return {
    buenosAires: num(row.buenosAires),
    restoArgentina: num(row.restoArgentina),
    internacional: num(row.internacional),
  };
}

export function shippingCostForZone(envios: TiendaEnvios, zona: ShippingZoneId): number {
  switch (zona) {
    case "resto_argentina":
      return envios.restoArgentina;
    case "internacional":
      return envios.internacional;
    default:
      return envios.buenosAires;
  }
}

export function normalizeShippingAddress(raw: unknown): ShippingAddress | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<ShippingAddress>;
  const zona = normalizeShippingZoneId(row.zona);
  const nombre = typeof row.nombre === "string" ? row.nombre.trim() : "";
  const telefono = typeof row.telefono === "string" ? row.telefono.trim() : "";
  const calle = typeof row.calle === "string" ? row.calle.trim() : "";
  const numero = typeof row.numero === "string" ? row.numero.trim() : "";
  const ciudad = typeof row.ciudad === "string" ? row.ciudad.trim() : "";
  const provincia = typeof row.provincia === "string" ? row.provincia.trim() : "";
  const codigoPostal = typeof row.codigoPostal === "string" ? row.codigoPostal.trim() : "";
  const pais = typeof row.pais === "string" ? row.pais.trim() : "";
  if (!nombre || !telefono || !calle || !ciudad || !codigoPostal) return null;
  if (zona !== "internacional" && !provincia) return null;
  if (zona === "internacional" && !pais) return null;
  return {
    nombre,
    telefono,
    calle,
    numero,
    piso: typeof row.piso === "string" ? row.piso.trim() : undefined,
    ciudad,
    provincia: zona === "internacional" ? provincia : provincia || "—",
    codigoPostal,
    pais: pais || (zona === "internacional" ? "" : "Argentina"),
    zona,
    notas: typeof row.notas === "string" ? row.notas.trim() : undefined,
  };
}

export function validateShippingAddress(address: ShippingAddress): string | null {
  const normalized = normalizeShippingAddress(address);
  if (!normalized) {
    return "Completá todos los datos de envío obligatorios.";
  }
  return null;
}

export function formatShippingAddressBlock(address: ShippingAddress): string {
  const lines = [
    address.nombre,
    address.telefono,
    [address.calle, address.numero].filter(Boolean).join(" "),
    address.piso ? `Piso / depto: ${address.piso}` : null,
    [address.codigoPostal, address.ciudad].filter(Boolean).join(" "),
    address.provincia,
    address.pais,
    `Zona: ${shippingZoneLabel(address.zona)}`,
    address.notas ? `Notas: ${address.notas}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}
