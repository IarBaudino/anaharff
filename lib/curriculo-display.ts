import type { SobreMiCurriculoEntrada } from "@/lib/site-content";

type LineaParts = Pick<SobreMiCurriculoEntrada, "linea" | "nombre" | "descripcion" | "lugar">;

/** Parte en « - » solo fuera de paréntesis (no corta «Buenos Aires - AR»). */
export function splitOnDashOutsideParens(text: string): string[] {
  const parts: string[] = [];
  let current = "";
  let depth = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "(") depth += 1;
    else if (ch === ")" && depth > 0) depth -= 1;

    if (depth === 0 && text.slice(i, i + 3) === " - ") {
      parts.push(current.trim());
      current = "";
      i += 2;
      continue;
    }

    current += ch;
  }

  parts.push(current.trim());
  return parts.filter(Boolean);
}

function openParensCount(text: string): number {
  return (text.match(/\(/g) || []).length;
}

function closeParensCount(text: string): number {
  return (text.match(/\)/g) || []).length;
}

/** true si la línea quedó cortada (ej. termina en «(Buenos Aires»). */
export function isBrokenCurriculoLinea(linea: string): boolean {
  const t = linea.trim();
  if (!t) return true;
  return openParensCount(t) > closeParensCount(t);
}

/**
 * Recompone la línea cuando los campos viejos se partieron mal en « - »
 * dentro de paréntesis como «(Buenos Aires - AR)».
 */
export function repairCurriculoLineaFromParts(
  entry: Pick<SobreMiCurriculoEntrada, "nombre" | "descripcion" | "lugar">
): string {
  const nombre = entry.nombre.trim();
  const descripcion = entry.descripcion.trim();
  const lugar = entry.lugar.trim();

  if (!nombre && !descripcion && !lugar) return "";

  // «(Pinamar» + «AR)» → «(Pinamar - AR)»
  if (descripcion.startsWith("(") && !descripcion.endsWith(")") && lugar.endsWith(")")) {
    const inner = [descripcion.slice(1).trim(), lugar.slice(0, -1).trim()].filter(Boolean).join(" - ");
    const tail = `(${inner})`;
    return nombre ? `${nombre} - ${tail}` : tail;
  }

  // «…Bonaparte (Buenos Aires» + «AR)»
  if (descripcion.includes("(") && !descripcion.endsWith(")") && lugar.endsWith(")")) {
    const openIdx = descripcion.lastIndexOf("(");
    const before = descripcion.slice(0, openIdx).trim();
    const parenStart = descripcion.slice(openIdx + 1).trim();
    const parenEnd = lugar.slice(0, -1).trim();
    const inner = [parenStart, parenEnd].filter(Boolean).join(" - ");
    const mid = before ? `${before} (${inner})` : `(${inner})`;
    return nombre ? `${nombre} - ${mid}` : mid;
  }

  if (nombre && descripcion && lugar) {
    if (descripcion.includes("(") && !isBrokenCurriculoLinea(descripcion)) {
      return `${nombre} - ${descripcion}`;
    }
    return `${nombre} - ${descripcion} (${lugar})`;
  }

  if (nombre && descripcion && !isBrokenCurriculoLinea(descripcion)) {
    return `${nombre} - ${descripcion}`;
  }
  if (nombre && lugar) return `${nombre} - (${lugar})`;
  if (nombre) return nombre;
  return descripcion || lugar;
}

function derivePartsForRepair(entry: LineaParts): Pick<SobreMiCurriculoEntrada, "nombre" | "descripcion" | "lugar"> {
  const stored = entry.linea?.trim() ?? "";
  let nombre = entry.nombre.trim();
  let descripcion = entry.descripcion.trim();
  let lugar = entry.lugar.trim();

  if (stored && isBrokenCurriculoLinea(stored)) {
    const dashParts = splitOnDashOutsideParens(stored);
    if (!nombre && dashParts[0]) nombre = dashParts[0];
    if (!descripcion && dashParts.length > 1) {
      descripcion = dashParts.slice(1).join(" - ");
    }
  }

  return { nombre, descripcion, lugar };
}

/** Garantiza una línea completa para mostrar y guardar. */
export function ensureCurriculoLinea(entry: LineaParts): string {
  const stored = entry.linea?.trim() ?? "";
  if (stored && !isBrokenCurriculoLinea(stored)) return stored;

  const parts = derivePartsForRepair(entry);
  const repaired = repairCurriculoLineaFromParts(parts);
  if (repaired && !isBrokenCurriculoLinea(repaired)) return repaired;

  return stored || repaired;
}

/** Texto después del año tal como debe verse en el sitio. */
export function getCurriculoLinea(entry: LineaParts): string {
  return ensureCurriculoLinea(entry);
}

export function formatCurriculoFullLine(
  entry: Pick<SobreMiCurriculoEntrada, "anio" | "linea" | "nombre" | "descripcion" | "lugar">
): string {
  const anio = entry.anio.trim();
  const linea = getCurriculoLinea(entry);
  if (!anio) return linea;
  if (!linea) return anio;
  return `${anio} ${linea}`;
}
