"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import {
  newManagedItemId,
  type SobreMiContent,
  type SobreMiCurriculoEntrada,
  type SobreMiCurriculoSeccion,
} from "@/lib/site-content";
import { FieldLabel, HelpText, SectionHeading, inputClass } from "@/components/admin/admin-fields";

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

  function addSeccion() {
    patchCurriculo(sobreMi, onChange, {
      secciones: [
        ...cv.secciones,
        {
          id: newManagedItemId("cv-sec"),
          titulo: "Nueva sección",
          entradas: [],
        },
      ],
    });
  }

  function removeSeccion(seccionId: string) {
    patchCurriculo(sobreMi, onChange, {
      secciones: cv.secciones.filter((s) => s.id !== seccionId),
    });
  }

  function addEntrada(seccionId: string) {
    const sec = cv.secciones.find((s) => s.id === seccionId);
    if (!sec) return;
    patchSeccion(sobreMi, onChange, seccionId, {
      entradas: [
        ...sec.entradas,
        {
          id: newManagedItemId("cv"),
          anio: "",
          nombre: "",
          descripcion: "",
          lugar: "",
        },
      ],
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
        Se muestra en <strong>/sobre-mi/curriculo</strong>. Creá bloques como «EXPOSICIONES» o
        «PREMIOS» y cargá cada línea con año, nombre, descripción y lugar.
      </HelpText>

      <div>
        <FieldLabel htmlFor="cv-titulo">Título de la sección en el sitio</FieldLabel>
        <input
          id="cv-titulo"
          className={inputClass()}
          value={cv.titulo}
          onChange={(e) => patchCurriculo(sobreMi, onChange, { titulo: e.target.value })}
          placeholder="Currículo"
        />
      </div>

      <div className="space-y-6">
        {cv.secciones.map((sec, secIdx) => (
          <div
            key={sec.id}
            className="space-y-4 rounded-lg border border-charcoal/15 bg-cream/80 p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-widest text-stone">
                Bloque {secIdx + 1}
              </span>
              <button
                type="button"
                onClick={() => removeSeccion(sec.id)}
                className="inline-flex items-center gap-1 text-xs text-stone hover:text-red-700"
              >
                <Trash2 className="size-3.5" />
                Quitar bloque
              </button>
            </div>
            <input
              className={inputClass()}
              value={sec.titulo}
              onChange={(e) => patchSeccion(sobreMi, onChange, sec.id, { titulo: e.target.value })}
              placeholder="EXPOSICIONES"
              aria-label="Título del bloque"
            />

            <div className="space-y-4">
              {sec.entradas.map((entry, entryIdx) => (
                <div
                  key={entry.id}
                  className="space-y-3 rounded-md border border-charcoal/10 bg-cream/70 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-stone">Entrada {entryIdx + 1}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="inline-flex size-8 items-center justify-center rounded border border-charcoal/15 text-charcoal/80 hover:bg-charcoal/5 disabled:opacity-40"
                        onClick={() => moveEntrada(sobreMi, onChange, sec.id, entry.id, -1)}
                        disabled={entryIdx === 0}
                        aria-label="Subir entrada"
                      >
                        <ArrowUp className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex size-8 items-center justify-center rounded border border-charcoal/15 text-charcoal/80 hover:bg-charcoal/5 disabled:opacity-40"
                        onClick={() => moveEntrada(sobreMi, onChange, sec.id, entry.id, 1)}
                        disabled={entryIdx === sec.entradas.length - 1}
                        aria-label="Bajar entrada"
                      >
                        <ArrowDown className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeEntrada(sec.id, entry.id)}
                        className="inline-flex size-8 items-center justify-center rounded border border-red-200 text-red-800 hover:bg-red-50"
                        aria-label="Quitar entrada"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <FieldLabel htmlFor={`cv-anio-${entry.id}`}>Año</FieldLabel>
                      <input
                        id={`cv-anio-${entry.id}`}
                        className={inputClass()}
                        value={entry.anio}
                        onChange={(e) =>
                          patchEntrada(sobreMi, onChange, sec.id, entry.id, { anio: e.target.value })
                        }
                        placeholder="2024"
                      />
                    </div>
                    <div>
                      <FieldLabel htmlFor={`cv-lugar-${entry.id}`}>Lugar</FieldLabel>
                      <input
                        id={`cv-lugar-${entry.id}`}
                        className={inputClass()}
                        value={entry.lugar}
                        onChange={(e) =>
                          patchEntrada(sobreMi, onChange, sec.id, entry.id, { lugar: e.target.value })
                        }
                        placeholder="Buenos Aires, Argentina"
                      />
                    </div>
                  </div>
                  <div>
                    <FieldLabel htmlFor={`cv-nombre-${entry.id}`}>Nombre del trabajo</FieldLabel>
                    <input
                      id={`cv-nombre-${entry.id}`}
                      className={inputClass()}
                      value={entry.nombre}
                      onChange={(e) =>
                        patchEntrada(sobreMi, onChange, sec.id, entry.id, { nombre: e.target.value })
                      }
                      placeholder="Título de la exposición o proyecto"
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor={`cv-desc-${entry.id}`}>Descripción</FieldLabel>
                    <textarea
                      id={`cv-desc-${entry.id}`}
                      className={inputClass()}
                      rows={2}
                      value={entry.descripcion}
                      onChange={(e) =>
                        patchEntrada(sobreMi, onChange, sec.id, entry.id, {
                          descripcion: e.target.value,
                        })
                      }
                      placeholder="Detalle opcional"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addEntrada(sec.id)}
              className="inline-flex items-center gap-2 border border-charcoal/20 px-3 py-2 text-sm text-charcoal hover:border-charcoal/40"
            >
              <Plus className="size-4" />
              Añadir entrada
            </button>
          </div>
        ))}
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
