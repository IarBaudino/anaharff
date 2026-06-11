"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import {
  countCurriculoDocument,
  parseCurriculoDocument,
  parsedSeccionesToFirestore,
} from "@/lib/curriculo-bulk-parse";
import type { SobreMiCurriculoSeccion } from "@/lib/site-content";
import { HelpText, inputClass } from "@/components/admin/admin-fields";

function importStub(_secciones: SobreMiCurriculoSeccion[]): void {
  void _secciones;
}

type Props = {
  onImport: typeof importStub;
};

const PLACEHOLDER = `EXPOSICIONES
2024 Cuerpo - Centro Cultural Laura Bonaparte (Buenos Aires - AR)
2023 Rituals - SPEDWELL Contemporary (Portland-US)

PREMIOS
2023 Glasgow Gallery: Monochrome

PUBLICACIONES
2025 FotoLibro UNICA`;

export function CurriculoFullDocumentImport({ onImport }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function handleImport() {
    const parsed = parseCurriculoDocument(text);
    if (!parsed.length) {
      setMessage("No se detectaron bloques ni entradas. Revisá el texto.");
      return;
    }
    const entradas = parsed.reduce((n, s) => n + s.entradas.length, 0);
    if (entradas === 0) {
      setMessage("Hay títulos de bloque pero ninguna línea que empiece con año (ej. 2024 …).");
      return;
    }
    onImport(parsedSeccionesToFirestore(parsed));
    setMessage(
      `Listo: ${parsed.length} bloque${parsed.length === 1 ? "" : "s"} y ${entradas} entrada${entradas === 1 ? "" : "s"} agregados. Revisá y guardá.`
    );
    setText("");
  }

  const preview = text.trim() ? countCurriculoDocument(text) : null;

  return (
    <div className="rounded-lg border border-charcoal/20 bg-cream/80 p-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 text-left text-sm font-medium text-charcoal hover:text-accent"
      >
        <FileText className="size-4 shrink-0" />
        {open
          ? "Ocultar pegado completo del currículo"
          : "Pegar currículo completo (EXPOSICIONES, PREMIOS, etc.)"}
      </button>

      {open ? (
        <div className="mt-3 space-y-3">
          <HelpText>
            Pegá el texto tal como lo tenés: cada <strong>título en una línea</strong> (EXPOSICIONES,
            PREMIOS…) y debajo las filas que empiezan con <strong>año</strong>, por ejemplo{" "}
            <strong>2024 Cuerpo - Centro Cultural … (Buenos Aires - AR)</strong>. Se crean los bloques
            automáticamente.
          </HelpText>
          <textarea
            className={`${inputClass()} font-mono text-xs leading-relaxed`}
            rows={14}
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
              Crear bloques desde el texto
            </button>
            {preview && preview.entradas > 0 ? (
              <span className="text-xs text-stone">
                Vista previa: {preview.secciones} bloque(s), {preview.entradas} entrada(s)
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
