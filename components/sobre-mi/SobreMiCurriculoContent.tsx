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
      <p className="max-w-2xl text-lg leading-relaxed text-charcoal/70">
        Próximamente.
      </p>
    );
  }

  return (
    <div className="space-y-12">
      {secciones.map((sec) => (
        <div key={sec.id}>
          <h2 className="text-xs font-medium uppercase tracking-[0.22em] text-charcoal/80">
            {sec.titulo}
          </h2>
          <ul className="mt-5 space-y-3">
            {sec.entradas.map((entry) => (
              <li
                key={entry.id}
                className="max-w-3xl text-base leading-relaxed text-charcoal/90 md:text-lg"
              >
                {entry.anio ? (
                  <span className="font-display font-light tabular-nums text-charcoal">
                    {entry.anio}{" "}
                  </span>
                ) : null}
                <CurriculoEntryLine entry={entry} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
