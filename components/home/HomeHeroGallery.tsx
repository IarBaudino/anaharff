"use client";

import { useEffect, useRef } from "react";

type Props = {
  images: string[];
};

const STRIP_HEIGHT = "h-[calc(100dvh-3.5rem)] lg:h-dvh";

/**
 * Portada del inicio: retratos a tamaño real (altura viewport, ancho proporcional)
 * y fila con scroll horizontal fluido en desktop.
 */
export function HomeHeroGallery({ images }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || images.length < 2) return;

    const finePointer = window.matchMedia("(pointer: fine)");
    if (!finePointer.matches) return;

    const maxScrollLeft = () => Math.max(0, el.scrollWidth - el.clientWidth);

    const atHorizontalStart = () => el.scrollLeft <= 1;
    const atHorizontalEnd = () => {
      const max = maxScrollLeft();
      return el.scrollLeft >= max - 1;
    };

    const wheelDelta = (e: WheelEvent) => {
      let delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) delta *= 16;
      if (e.deltaMode === WheelEvent.DOM_DELTA_PAGE) delta *= el.clientWidth;
      return delta;
    };

    const onWheel = (e: WheelEvent) => {
      const max = maxScrollLeft();
      if (max <= 0) return;

      const delta = wheelDelta(e);
      if (delta === 0) return;

      if (delta < 0 && atHorizontalStart()) return;
      if (delta > 0 && atHorizontalEnd()) return;

      e.preventDefault();
      el.scrollLeft = Math.max(0, Math.min(max, el.scrollLeft + delta));
    };

    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, [images.length]);

  if (images.length === 0) {
    return (
      <section
        aria-label="Imagen principal"
        className={`relative w-full bg-charcoal/[0.04] ${STRIP_HEIGHT}`}
      >
        <div
          className="absolute inset-0 bg-gradient-to-b from-charcoal/[0.06] via-transparent to-charcoal/[0.04]"
          aria-hidden
        />
      </section>
    );
  }

  return (
    <section aria-label="Imagen principal" className="relative w-full bg-[var(--color-cream)]">
      <div
        ref={scrollerRef}
        className={`flex w-full overflow-x-auto overflow-y-hidden ${STRIP_HEIGHT} [scrollbar-width:thin] [-webkit-overflow-scrolling:touch] [overscroll-behavior-x:auto] [overscroll-behavior-y:auto]`}
      >
        {images.map((url, index) => (
          <div key={`${url}-${index}`} className="flex h-full shrink-0 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              decoding="async"
              loading={index < 2 ? "eager" : "lazy"}
              draggable={false}
              className="h-full w-auto max-w-none select-none"
            />
          </div>
        ))}
      </div>
      {images.length > 1 ? (
        <p className="sr-only">
          Deslizá horizontalmente para ver todas las fotos de la portada; deslizá verticalmente para
          bajar al resto de la página.
        </p>
      ) : null}
    </section>
  );
}
