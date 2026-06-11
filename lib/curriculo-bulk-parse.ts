import type { SobreMiCurriculoEntrada } from "@/lib/site-content";
import { newManagedItemId } from "@/lib/site-content";
import {
  repairCurriculoLineaFromParts,
  splitOnDashOutsideParens,
} from "@/lib/curriculo-display";

export type CurriculoBulkRow = Pick<
  SobreMiCurriculoEntrada,
  "anio" | "linea" | "nombre" | "descripcion" | "lugar" | "enlace"
>;

export type ParsedCurriculoSeccion = {
  titulo: string;
  entradas: CurriculoBulkRow[];
};

const YEAR_LINE_RE = /^(\d{4})\s+(.+)$/;

function cleanCell(value: string): string {
  return value.replace(/^\s*["']|["']\s*$/g, "").trim();
}

export { splitOnDashOutsideParens };

/** Línea tipo «2024 Cuerpo - Centro Cultural … (Buenos Aires - AR)». */
export function parseNaturalCurriculoLine(line: string): CurriculoBulkRow | null {
  const trimmed = line.trim();
  const match = trimmed.match(YEAR_LINE_RE);
  if (!match) return null;

  const anio = match[1];
  const linea = match[2].trim();
  if (!linea) return null;

  const dashParts = splitOnDashOutsideParens(linea);
  const nombre = dashParts[0] ?? linea;

  return {
    anio,
    linea,
    nombre,
    descripcion: "",
    lugar: "",
    enlace: "",
  };
}

function buildLineaFromParts(nombre: string, descripcion: string, lugar: string): string {
  return repairCurriculoLineaFromParts({ nombre, descripcion, lugar });
}

function isStructuredColumns(line: string): boolean {
  const t = line.trim();
  return t.includes("\t") || t.includes("|") || t.includes(";") || /[—–]/.test(t);
}

function isSectionHeaderLine(line: string): boolean {
  const t = line.trim();
  if (!t || YEAR_LINE_RE.test(t) || isStructuredColumns(t)) return false;
  if (/^\d{4}/.test(t)) return false;
  return true;
}

function splitStructuredLine(line: string): string[] {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return [];

  if (trimmed.includes("\t")) return trimmed.split("\t").map(cleanCell);
  if (trimmed.includes("|")) return trimmed.split("|").map(cleanCell);
  if (trimmed.includes(";")) return trimmed.split(";").map(cleanCell);
  if (/[—–]/.test(trimmed)) return trimmed.split(/\s*[—–]\s*/).map(cleanCell);

  return [];
}

/**
 * Documento completo: títulos de bloque (EXPOSICIONES, PREMIOS…) + líneas que empiezan con año.
 */
export function parseCurriculoDocument(text: string): ParsedCurriculoSeccion[] {
  const secciones: ParsedCurriculoSeccion[] = [];
  let current: ParsedCurriculoSeccion | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    const natural = parseNaturalCurriculoLine(trimmed);
    if (natural) {
      if (!current) {
        current = { titulo: "General", entradas: [] };
        secciones.push(current);
      }
      current.entradas.push(natural);
      continue;
    }

    const parts = splitStructuredLine(trimmed);
    if (parts.length) {
      const [anio = "", nombre = "", descripcion = "", lugar = "", enlace = ""] = parts;
      if (!anio && !nombre && !descripcion && !lugar && !enlace) continue;
      if (!current) {
        current = { titulo: "General", entradas: [] };
        secciones.push(current);
      }
      const n = cleanCell(nombre);
      const d = cleanCell(descripcion);
      const l = cleanCell(lugar);
      current.entradas.push({
        anio: cleanCell(anio),
        linea: buildLineaFromParts(n, d, l),
        nombre: n,
        descripcion: d,
        lugar: l,
        enlace: cleanCell(enlace),
      });
      continue;
    }

    if (isSectionHeaderLine(trimmed)) {
      current = { titulo: trimmed, entradas: [] };
      secciones.push(current);
    }
  }

  return secciones.filter((sec) => sec.titulo.trim() || sec.entradas.length > 0);
}

/** Filas sueltas para agregar a un solo bloque (ignora títulos de sección). */
export function parseBulkCurriculoText(text: string): CurriculoBulkRow[] {
  const doc = parseCurriculoDocument(text);
  if (doc.length) {
    return doc.flatMap((sec) => sec.entradas);
  }
  return [];
}

export function countCurriculoDocument(text: string): {
  secciones: number;
  entradas: number;
} {
  const doc = parseCurriculoDocument(text);
  return {
    secciones: doc.length,
    entradas: doc.reduce((n, sec) => n + sec.entradas.length, 0),
  };
}

export function bulkRowsToEntradas(rows: CurriculoBulkRow[]): SobreMiCurriculoEntrada[] {
  return rows.map((row) => ({
    id: newManagedItemId("cv"),
    anio: row.anio,
    linea: row.linea?.trim() || buildLineaFromParts(row.nombre, row.descripcion, row.lugar),
    nombre: row.nombre,
    descripcion: row.descripcion,
    lugar: row.lugar,
    ...(row.enlace?.trim() ? { enlace: row.enlace.trim() } : {}),
  }));
}

export function parsedSeccionesToFirestore(
  secciones: ParsedCurriculoSeccion[]
): { id: string; titulo: string; entradas: SobreMiCurriculoEntrada[] }[] {
  return secciones.map((sec) => ({
    id: newManagedItemId("cv-sec"),
    titulo: sec.titulo,
    entradas: bulkRowsToEntradas(sec.entradas),
  }));
}
