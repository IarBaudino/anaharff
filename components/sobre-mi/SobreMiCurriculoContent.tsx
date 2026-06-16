"use client";

import { CurriculoEntryLine } from "@/components/sobre-mi/CurriculoEntryLine";
import type { SobreMiCurriculo } from "@/lib/site-content";

type Props = {
  curriculo: SobreMiCurriculo;
};

export function getCurriculoSeccionesVisibles(curriculo: SobreMiCurriculo) {
  return curriculo.secciones.filter(
    (sec) =>
      sec.titulo.trim() ||
      sec.entradas.some((e) => e.anio || e.linea || e.nombre || e.descripcion || e.lugar)
  );
}

export function SobreMiCurriculoContent({ curriculo }: Props) {
  const secciones = getCurriculoSeccionesVisibles(curriculo);

  if (secciones.length === 0) {
    return (
      <p className="max-w-2xl text-base font-normal leading-[1.65] text-charcoal/70">
        Próximamente.
      </p>
    );
  }

  return (
    <div className="space-y-14">
      {secciones.map((sec) => (
        <div key={sec.id}>
          <h2 className="mb-7 font-display text-2xl font-light tracking-tight text-charcoal md:text-3xl">
            {sec.titulo}
          </h2>
          <ul className="divide-y divide-charcoal/[0.07]">
            {sec.entradas.map((entry) => (
              <li
                key={entry.id}
                className="grid max-w-3xl grid-cols-[2.75rem_minmax(0,1fr)] gap-x-5 py-3.5 sm:grid-cols-[3.25rem_minmax(0,1fr)] sm:gap-x-6 sm:py-4"
              >
                {entry.anio ? (
                  <span className="pt-px text-[0.8125rem] font-normal tabular-nums leading-[1.65] text-charcoal/50">
                    {entry.anio}
                  </span>
                ) : (
                  <span aria-hidden="true" />
                )}
                <p className="text-[0.9375rem] font-normal leading-[1.65] tracking-normal text-charcoal/88 sm:text-base">
                  <CurriculoEntryLine entry={entry} />
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
