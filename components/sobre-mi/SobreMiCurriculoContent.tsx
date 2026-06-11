"use client";

import type { SobreMiCurriculo } from "@/lib/site-content";

type Props = {
  curriculo: SobreMiCurriculo;
};

export function getCurriculoSeccionesVisibles(curriculo: SobreMiCurriculo) {
  return curriculo.secciones.filter(
    (sec) =>
      sec.titulo.trim() ||
      sec.entradas.some((e) => e.anio || e.nombre || e.descripcion || e.lugar)
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
    <div className="space-y-14">
      {secciones.map((sec) => (
        <div key={sec.id}>
          <h2 className="text-xs font-medium uppercase tracking-[0.22em] text-charcoal/80">
            {sec.titulo}
          </h2>
          <ul className="mt-6 space-y-8">
            {sec.entradas.map((entry) => (
              <li
                key={entry.id}
                className="grid gap-2 border-b border-charcoal/10 pb-8 last:border-b-0 last:pb-0 sm:grid-cols-[4.5rem_1fr] sm:gap-x-6 lg:grid-cols-[5.5rem_minmax(0,1.1fr)_minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-x-8"
              >
                <p className="font-display text-lg font-light tabular-nums text-charcoal">
                  {entry.anio || "—"}
                </p>
                <div className="space-y-2 sm:contents">
                  <p className="text-base font-medium leading-snug text-charcoal md:text-lg">
                    {entry.nombre}
                  </p>
                  {entry.descripcion ? (
                    <p className="text-base leading-relaxed text-charcoal/80">{entry.descripcion}</p>
                  ) : null}
                  {entry.lugar ? (
                    <p className="text-sm uppercase tracking-[0.12em] text-stone">{entry.lugar}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
