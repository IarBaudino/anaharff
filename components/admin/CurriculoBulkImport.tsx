"use client";

import { useState } from "react";
import { ClipboardPaste } from "lucide-react";
import {
  bulkRowsToEntradas,
  countCurriculoDocument,
  parseBulkCurriculoText,
} from "@/lib/curriculo-bulk-parse";
import type { SobreMiCurriculoEntrada } from "@/lib/site-content";
import { HelpText, inputClass } from "@/components/admin/admin-fields";

const PLACEHOLDER = `2024 Cuerpo - Centro Cultural Laura Bonaparte (Buenos Aires - AR)
2023 Rituals - SPEDWELL Contemporary (Portland-US)

O desde Excel (columnas con tab):
2022\tTítulo\tDetalle\tLugar`;

function importStub(_entradas: SobreMiCurriculoEntrada[]): void {
  void _entradas;
}

type Props = {
  onImport: typeof importStub;
};

export function CurriculoBulkImport({ onImport }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function handleImport() {
    const rows = parseBulkCurriculoText(text);
    if (!rows.length) {
      setMessage("No se detectaron filas. Revisá el formato (una entrada por línea).");
      return;
    }
    onImport(bulkRowsToEntradas(rows));
    setMessage(`${rows.length} entrada${rows.length === 1 ? "" : "s"} agregada${rows.length === 1 ? "" : "s"}.`);
    setText("");
  }

  return (
    <div className="rounded-md border border-dashed border-charcoal/20 bg-cream/50 p-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 text-left text-sm font-medium text-charcoal hover:text-accent"
      >
        <ClipboardPaste className="size-4 shrink-0" />
        {open ? "Ocultar importación rápida" : "Importar muchas entradas (pegar desde Excel o texto)"}
      </button>

      {open ? (
        <div className="mt-3 space-y-3">
          <HelpText>
            Pegá líneas que empiecen con <strong>año</strong> (ej.{" "}
            <strong>2024 Título - lugar (ciudad)</strong>). También sirve Excel con columnas separadas
            por tab.
          </HelpText>
          <textarea
            className={`${inputClass()} font-mono text-xs leading-relaxed`}
            rows={8}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setMessage(null);
            }}
            placeholder={PLACEHOLDER}
            spellCheck={false}
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleImport}
              disabled={!text.trim()}
              className="rounded border border-charcoal/25 bg-charcoal px-4 py-2 text-sm text-cream transition-colors hover:bg-ink disabled:opacity-50"
            >
              Agregar al bloque
            </button>
            {text.trim() ? (
              <span className="text-xs text-stone">
                Vista previa: {countCurriculoDocument(text).entradas} fila(s)
              </span>
            ) : null}
          </div>
          {message ? (
            <p className="text-xs text-charcoal/80" role="status">
              {message}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
