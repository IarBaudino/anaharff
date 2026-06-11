"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { collectGalleryImageOptions } from "@/lib/gallery-image-options";
import {
  newHomeDestacadoId,
  type HomeDestacado,
  type SiteContent,
} from "@/lib/site-content";
import { HelpText, inputClass } from "@/components/admin/admin-fields";

function siteContentStub(_next: SiteContent): void {
  void _next;
}

type Props = {
  content: SiteContent;
  setContent: typeof siteContentStub;
};

function updateDestacados(
  content: SiteContent,
  setContent: typeof siteContentStub,
  destacados: HomeDestacado[]
) {
  setContent({
    ...content,
    home: { ...content.home, destacados },
  });
}

export function HomeDestacadosEditor({ content, setContent }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const galleryOptions = useMemo(
    () => collectGalleryImageOptions(content),
    [content]
  );
  const selectedUrls = useMemo(
    () => new Set(content.home.destacados.map((d) => d.imagenUrl)),
    [content.home.destacados]
  );
  const limit = content.home.destacadosCantidad ?? 3;
  const canAddMore = content.home.destacados.length < limit;

  function addFromGallery(option: (typeof galleryOptions)[number]) {
    if (!canAddMore || selectedUrls.has(option.url)) return;
    const next: HomeDestacado = {
      id: newHomeDestacadoId(),
      imagenUrl: option.url,
      titulo: option.defaultTitulo,
      etiqueta: option.sourceLabel,
      href: option.defaultHref,
    };
    updateDestacados(content, setContent, [...content.home.destacados, next]);
    if (content.home.destacados.length + 1 >= limit) {
      setPickerOpen(false);
    }
  }

  function patchDestacado(id: string, patch: Partial<HomeDestacado>) {
    updateDestacados(
      content,
      setContent,
      content.home.destacados.map((d) => (d.id === id ? { ...d, ...patch } : d))
    );
  }

  function removeDestacado(id: string) {
    updateDestacados(
      content,
      setContent,
      content.home.destacados.filter((d) => d.id !== id)
    );
  }

  function moveDestacado(id: string, direction: -1 | 1) {
    const list = [...content.home.destacados];
    const idx = list.findIndex((d) => d.id === id);
    if (idx === -1) return;
    const target = idx + direction;
    if (target < 0 || target >= list.length) return;
    const [row] = list.splice(idx, 1);
    list.splice(target, 0, row);
    updateDestacados(content, setContent, list);
  }

  return (
    <div className="space-y-4 rounded-lg border border-charcoal/10 bg-cream/60 p-4">
      <div>
        <p className="text-sm font-medium text-charcoal">Imágenes de «Trabajos recientes»</p>
        <HelpText className="mt-1">
          Elegí fotos que ya subiste en <strong>Portfolio</strong> (galería o series). No usan las
          imágenes de la tienda.
        </HelpText>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="destacados-cantidad" className="text-sm font-medium text-charcoal">
          Cantidad visible en el inicio
        </label>
        <select
          id="destacados-cantidad"
          className={cn(inputClass(), "max-w-[8rem]")}
          value={content.home.destacadosCantidad ?? 3}
          onChange={(e) =>
            setContent({
              ...content,
              home: {
                ...content.home,
                destacadosCantidad: Number(e.target.value) as 3 | 4 | 6,
              },
            })
          }
        >
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={6}>6</option>
        </select>
        <span className="text-xs text-stone">
          Seleccionadas: {content.home.destacados.length} / {limit}
        </span>
      </div>

      {content.home.destacados.length === 0 ? (
        <p className="text-sm text-stone">
          Todavía no hay imágenes elegidas. Subí fotos en Portfolio y agregalas acá.
        </p>
      ) : (
        <div className="space-y-4">
          {content.home.destacados.map((item, idx) => (
            <div
              key={item.id}
              className="grid gap-4 rounded-lg border border-charcoal/10 bg-cream p-3 md:grid-cols-[7rem_1fr_auto]"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-charcoal/[0.04]">
                <Image src={item.imagenUrl} alt="" fill className="object-cover" sizes="112px" />
              </div>
              <div className="space-y-2">
                <input
                  className={inputClass()}
                  value={item.titulo}
                  placeholder="Título"
                  onChange={(e) => patchDestacado(item.id, { titulo: e.target.value })}
                />
                <input
                  className={inputClass()}
                  value={item.etiqueta}
                  placeholder="Subtítulo (ej. Retratos)"
                  onChange={(e) => patchDestacado(item.id, { etiqueta: e.target.value })}
                />
                <input
                  className={inputClass()}
                  value={item.href}
                  placeholder="Enlace (ej. /portfolio/retratos)"
                  onChange={(e) => patchDestacado(item.id, { href: e.target.value })}
                />
              </div>
              <div className="flex flex-row items-start gap-1 md:flex-col">
                <button
                  type="button"
                  className="inline-flex size-8 items-center justify-center rounded border border-charcoal/15 text-charcoal/80 hover:bg-charcoal/5 disabled:opacity-40"
                  onClick={() => moveDestacado(item.id, -1)}
                  disabled={idx === 0}
                  aria-label="Subir"
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  className="inline-flex size-8 items-center justify-center rounded border border-charcoal/15 text-charcoal/80 hover:bg-charcoal/5 disabled:opacity-40"
                  onClick={() => moveDestacado(item.id, 1)}
                  disabled={idx === content.home.destacados.length - 1}
                  aria-label="Bajar"
                >
                  <ArrowDown className="size-3.5" />
                </button>
                <button
                  type="button"
                  className="inline-flex size-8 items-center justify-center rounded border border-red-200 text-red-800 hover:bg-red-50"
                  onClick={() => removeDestacado(item.id)}
                  aria-label="Quitar"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!canAddMore || galleryOptions.length === 0}
          onClick={() => setPickerOpen((o) => !o)}
          className="inline-flex items-center gap-2 rounded border border-charcoal/25 px-4 py-2 text-sm hover:bg-charcoal/5 disabled:opacity-50"
        >
          <Plus className="size-4" />
          {pickerOpen ? "Ocultar galería" : "Elegir de la galería"}
        </button>
        {galleryOptions.length === 0 ? (
          <span className="text-xs text-amber-900">
            No hay fotos en Portfolio todavía. Subí imágenes en la pestaña Portfolio.
          </span>
        ) : null}
      </div>

      {pickerOpen && galleryOptions.length > 0 ? (
        <div className="max-h-[28rem] overflow-y-auto rounded-lg border border-charcoal/10 bg-cream p-3">
          <p className="mb-3 text-xs uppercase tracking-widest text-stone">
            Tocá una imagen para sumarla
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {galleryOptions.map((option) => {
              const taken = selectedUrls.has(option.url);
              const disabled = taken || !canAddMore;
              return (
                <button
                  key={option.url}
                  type="button"
                  disabled={disabled}
                  onClick={() => addFromGallery(option)}
                  className={cn(
                    "group overflow-hidden rounded-md border text-left transition-colors",
                    disabled
                      ? "cursor-not-allowed border-charcoal/10 opacity-50"
                      : "border-charcoal/15 hover:border-charcoal/35"
                  )}
                >
                  <div className="relative aspect-[4/3] bg-charcoal/[0.04]">
                    <Image
                      src={option.url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    {taken ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-cream/70 text-xs font-medium text-charcoal">
                        Ya elegida
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate px-2 py-1.5 text-[0.65rem] text-stone group-hover:text-charcoal">
                    {option.sourceLabel}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
