"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import {
  newManagedItemId,
  type SobreMiContent,
  type SobreMiCurriculoEntrada,
  type SobreMiCurriculoSeccion,
} from "@/lib/site-content";
import { CurriculoBulkImport } from "@/components/admin/CurriculoBulkImport";
import { CurriculoFullDocumentImport } from "@/components/admin/CurriculoFullDocumentImport";
import { formatCurriculoFullLine } from "@/lib/curriculo-display";
import { AdminInput, HelpText, SectionHeading } from "@/components/admin/admin-fields";
import { cn } from "@/lib/utils";

function sobreMiChangeStub(_next: SobreMiContent): void {
  void _next;
}

type Props = {
  sobreMi: SobreMiContent;
  onChange: typeof sobreMiChangeStub;
};

function patchCurriculo(
  sobreMi: SobreMiContent,
  onChange: typeof sobreMiChangeStub,
  patch: Partial<SobreMiContent["curriculo"]>
) {
  onChange({
    ...sobreMi,
    curriculo: { ...sobreMi.curriculo, ...patch },
  });
}

function patchSeccion(
  sobreMi: SobreMiContent,
  onChange: typeof sobreMiChangeStub,
  seccionId: string,
  patch: Partial<SobreMiCurriculoSeccion>
) {
  patchCurriculo(sobreMi, onChange, {
    secciones: sobreMi.curriculo.secciones.map((sec) =>
      sec.id === seccionId ? { ...sec, ...patch } : sec
    ),
  });
}

function patchEntrada(
  sobreMi: SobreMiContent,
  onChange: typeof sobreMiChangeStub,
  seccionId: string,
  entradaId: string,
  patch: Partial<SobreMiCurriculoEntrada>
) {
  const sec = sobreMi.curriculo.secciones.find((s) => s.id === seccionId);
  if (!sec) return;
  patchSeccion(sobreMi, onChange, seccionId, {
    entradas: sec.entradas.map((e) => (e.id === entradaId ? { ...e, ...patch } : e)),
  });
}

function moveEntrada(
  sobreMi: SobreMiContent,
  onChange: typeof sobreMiChangeStub,
  seccionId: string,
  entradaId: string,
  direction: -1 | 1
) {
  const sec = sobreMi.curriculo.secciones.find((s) => s.id === seccionId);
  if (!sec) return;
  const list = [...sec.entradas];
  const idx = list.findIndex((e) => e.id === entradaId);
  if (idx === -1) return;
  const target = idx + direction;
  if (target < 0 || target >= list.length) return;
  const [row] = list.splice(idx, 1);
  list.splice(target, 0, row);
  patchSeccion(sobreMi, onChange, seccionId, { entradas: list });
}

export function AdminCurriculoEditor({ sobreMi, onChange }: Props) {
  const cv = sobreMi.curriculo;
  const [seccionOpen, setSeccionOpen] = useState<Record<string, boolean>>({});
  const [entradaOpen, setEntradaOpen] = useState<Record<string, boolean>>({});

  function isSeccionExpanded(secId: string): boolean {
    return seccionOpen[secId] ?? false;
  }

  function isEntradaExpanded(entradaId: string): boolean {
    return entradaOpen[entradaId] ?? false;
  }

  function addSeccion() {
    const id = newManagedItemId("cv-sec");
    patchCurriculo(sobreMi, onChange, {
      secciones: [
        ...cv.secciones,
        {
          id,
          titulo: "Nueva sección",
          entradas: [],
        },
      ],
    });
    setSeccionOpen((o) => ({ ...o, [id]: true }));
  }

  function removeSeccion(seccionId: string) {
    patchCurriculo(sobreMi, onChange, {
      secciones: cv.secciones.filter((s) => s.id !== seccionId),
    });
  }

  function addEntrada(seccionId: string) {
    const sec = cv.secciones.find((s) => s.id === seccionId);
    if (!sec) return;
    const id = newManagedItemId("cv");
    patchSeccion(sobreMi, onChange, seccionId, {
      entradas: [
        ...sec.entradas,
        {
          id,
          anio: "",
          linea: "",
          nombre: "",
          descripcion: "",
          lugar: "",
          enlace: "",
        },
      ],
    });
    setSeccionOpen((o) => ({ ...o, [seccionId]: true }));
    setEntradaOpen((o) => ({ ...o, [id]: true }));
  }

  function addEmptyEntradas(seccionId: string, count: number) {
    const sec = cv.secciones.find((s) => s.id === seccionId);
    if (!sec) return;
    const blank = Array.from({ length: count }, () => ({
      id: newManagedItemId("cv"),
      anio: "",
      linea: "",
      nombre: "",
      descripcion: "",
      lugar: "",
      enlace: "",
    }));
    patchSeccion(sobreMi, onChange, seccionId, {
      entradas: [...sec.entradas, ...blank],
    });
  }

  function importEntradas(seccionId: string, entradas: SobreMiCurriculoEntrada[]) {
    const sec = cv.secciones.find((s) => s.id === seccionId);
    if (!sec || !entradas.length) return;
    patchSeccion(sobreMi, onChange, seccionId, {
      entradas: [...sec.entradas, ...entradas],
    });
    setSeccionOpen((o) => ({ ...o, [seccionId]: true }));
  }

  function importFullDocument(secciones: SobreMiCurriculoSeccion[]) {
    if (!secciones.length) return;
    patchCurriculo(sobreMi, onChange, {
      secciones: [...cv.secciones, ...secciones],
    });
    setSeccionOpen((o) => {
      const next = { ...o };
      for (const sec of secciones) next[sec.id] = true;
      return next;
    });
  }

  function removeEntrada(seccionId: string, entradaId: string) {
    const sec = cv.secciones.find((s) => s.id === seccionId);
    if (!sec) return;
    patchSeccion(sobreMi, onChange, seccionId, {
      entradas: sec.entradas.filter((e) => e.id !== entradaId),
    });
  }

  return (
    <section className="space-y-4">
      <SectionHeading>Currículo</SectionHeading>
      <HelpText>
        Se muestra en <strong>/sobre-mi/curriculo</strong>. Podés pegar el texto completo (títulos +
        filas con año) o editar bloque por bloque. Cada bloque y cada entrada son desplegables: tocá
        la fila para abrir o cerrar. El nombre puede tener un enlace opcional.
      </HelpText>

      <CurriculoFullDocumentImport onImport={importFullDocument} />

      <AdminInput
        id="cv-titulo"
        label="Título de la sección en el sitio"
        hint="Encabezado de la página /sobre-mi/curriculo."
        example="Currículo"
        value={cv.titulo}
        onChange={(e) => patchCurriculo(sobreMi, onChange, { titulo: e.target.value })}
      />

      <div className="space-y-3">
        {cv.secciones.map((sec, secIdx) => {
          const secExpanded = isSeccionExpanded(sec.id);
          const secLabel = sec.titulo.trim() || `Bloque ${secIdx + 1}`;
          return (
            <div
              key={sec.id}
              className="overflow-hidden rounded-lg border border-charcoal/10 bg-cream/60"
            >
              <div className="flex w-full items-stretch gap-0">
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-2 px-3 py-3 text-left transition-colors hover:bg-charcoal/[0.04]"
                  aria-expanded={secExpanded}
                  onClick={() =>
                    setSeccionOpen((o) => ({ ...o, [sec.id]: !isSeccionExpanded(sec.id) }))
                  }
                >
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-charcoal/70 transition-transform duration-200",
                      secExpanded && "rotate-180"
                    )}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate font-medium text-charcoal">
                    {secLabel}
                  </span>
                  <span className="shrink-0 text-[11px] uppercase tracking-wide text-stone">
                    {sec.entradas.length} {sec.entradas.length === 1 ? "entrada" : "entradas"}
                  </span>
                </button>
                <div
                  className="flex shrink-0 items-center border-l border-charcoal/10 px-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => removeSeccion(sec.id)}
                    className="inline-flex size-8 items-center justify-center rounded text-stone hover:bg-red-50 hover:text-red-800"
                    aria-label={`Quitar bloque ${secLabel}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>

              {secExpanded ? (
                <div className="space-y-4 border-t border-charcoal/10 px-4 py-4">
                  <AdminInput
                    id={`cv-sec-titulo-${sec.id}`}
                    label="Título del bloque"
                    hint="Nombre de la sección en mayúsculas o como prefieras (exposiciones, premios…)."
                    example="EXPOSICIONES"
                    value={sec.titulo}
                    onChange={(e) =>
                      patchSeccion(sobreMi, onChange, sec.id, { titulo: e.target.value })
                    }
                  />

                  <CurriculoBulkImport onImport={(entradas) => importEntradas(sec.id, entradas)} />

                  <div className="space-y-2">
                    {sec.entradas.map((entry, entryIdx) => {
                      const entryExpanded = isEntradaExpanded(entry.id);
                      const preview = formatCurriculoFullLine(entry) || "Entrada vacía";
                      return (
                        <div
                          key={entry.id}
                          className="overflow-hidden rounded-md border border-charcoal/10 bg-cream/70"
                        >
                          <div className="flex w-full items-stretch gap-0">
                            <button
                              type="button"
                              className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-charcoal/[0.04]"
                              aria-expanded={entryExpanded}
                              onClick={() =>
                                setEntradaOpen((o) => ({
                                  ...o,
                                  [entry.id]: !isEntradaExpanded(entry.id),
                                }))
                              }
                            >
                              <ChevronDown
                                className={cn(
                                  "size-3.5 shrink-0 text-charcoal/60 transition-transform duration-200",
                                  entryExpanded && "rotate-180"
                                )}
                                aria-hidden
                              />
                              <span className="min-w-0 flex-1 truncate text-sm text-charcoal/90">
                                {preview}
                              </span>
                            </button>
                            <div
                              className="flex shrink-0 items-center gap-0.5 border-l border-charcoal/10 px-1.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                className="inline-flex size-7 items-center justify-center rounded text-charcoal/80 hover:bg-charcoal/5 disabled:opacity-40"
                                onClick={() => moveEntrada(sobreMi, onChange, sec.id, entry.id, -1)}
                                disabled={entryIdx === 0}
                                aria-label="Subir entrada"
                              >
                                <ArrowUp className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                className="inline-flex size-7 items-center justify-center rounded text-charcoal/80 hover:bg-charcoal/5 disabled:opacity-40"
                                onClick={() => moveEntrada(sobreMi, onChange, sec.id, entry.id, 1)}
                                disabled={entryIdx === sec.entradas.length - 1}
                                aria-label="Bajar entrada"
                              >
                                <ArrowDown className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeEntrada(sec.id, entry.id)}
                                className="inline-flex size-7 items-center justify-center rounded text-red-800 hover:bg-red-50"
                                aria-label="Quitar entrada"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>

                          {entryExpanded ? (
                            <div className="space-y-3 border-t border-charcoal/10 px-3 py-3">
                              <div className="grid gap-3 md:grid-cols-[6rem_1fr]">
                                <AdminInput
                                  id={`cv-anio-${entry.id}`}
                                  label="Año"
                                  hint="Cuatro dígitos o rango corto."
                                  example="2024"
                                  value={entry.anio}
                                  onChange={(e) =>
                                    patchEntrada(sobreMi, onChange, sec.id, entry.id, {
                                      anio: e.target.value,
                                    })
                                  }
                                />
                                <AdminInput
                                  id={`cv-linea-${entry.id}`}
                                  label="Texto en el sitio (después del año)"
                                  hint="Título, lugar y ciudad tal como quieras que se lea en la línea."
                                  example="Cuerpo - Centro Cultural Laura Bonaparte (Buenos Aires - AR)"
                                  value={entry.linea ?? ""}
                                  onChange={(e) =>
                                    patchEntrada(sobreMi, onChange, sec.id, entry.id, {
                                      linea: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="grid gap-3 md:grid-cols-2">
                                <AdminInput
                                  id={`cv-nombre-${entry.id}`}
                                  label="Texto del enlace (opcional)"
                                  hint="Parte del texto que será clickeable. Dejá vacío si no hay enlace."
                                  example="Centro Cultural Laura Bonaparte"
                                  value={entry.nombre}
                                  onChange={(e) =>
                                    patchEntrada(sobreMi, onChange, sec.id, entry.id, {
                                      nombre: e.target.value,
                                    })
                                  }
                                />
                                <AdminInput
                                  id={`cv-link-${entry.id}`}
                                  label="URL del enlace"
                                  hint="Dirección web completa o ruta interna del sitio."
                                  example="https://ejemplo.org o /portfolio"
                                  value={entry.enlace ?? ""}
                                  onChange={(e) =>
                                    patchEntrada(sobreMi, onChange, sec.id, entry.id, {
                                      enlace: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => addEntrada(sec.id)}
                      className="inline-flex items-center gap-2 border border-charcoal/20 px-3 py-2 text-sm text-charcoal hover:border-charcoal/40"
                    >
                      <Plus className="size-4" />
                      Añadir entrada
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSeccionOpen((o) => ({ ...o, [sec.id]: true }));
                        addEmptyEntradas(sec.id, 5);
                      }}
                      className="inline-flex items-center gap-2 border border-charcoal/20 px-3 py-2 text-sm text-charcoal hover:border-charcoal/40"
                    >
                      <Plus className="size-4" />
                      Añadir 5 vacías
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addSeccion}
        className="inline-flex items-center gap-2 border border-charcoal/20 px-4 py-2 text-sm text-charcoal transition-colors hover:border-charcoal/40"
      >
        <Plus className="size-4" />
        Añadir bloque (ej. EXPOSICIONES)
      </button>
    </section>
  );
}
