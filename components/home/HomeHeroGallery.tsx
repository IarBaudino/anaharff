"use client";

import { useEffect, useRef } from "react";

type Props = {
  images: string[];
};

const STRIP_HEIGHT = "h-[calc(100dvh-3.5rem)] lg:h-dvh";

/**
 * Portada del inicio: retratos a tamaño real (altura viewport, ancho proporcional)
 * y fila con scroll horizontal + snap, estilo portfolio editorial.
 */
export function HomeHeroGallery({ images }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || images.length < 2) return;

    const onWheel = (e: WheelEvent) => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;

      const goingForward = e.deltaY > 0;
      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft >= maxScroll - 1;

      if ((goingForward && !atEnd) || (!goingForward && !atStart)) {
        if (Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
        }
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
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
        className={`flex w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain ${STRIP_HEIGHT} [scrollbar-width:thin]`}
      >
        {images.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="flex h-full shrink-0 snap-center snap-always items-center"
          >
            {/* Altura fija al viewport; ancho según proporción real de cada foto */}
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
          Deslizá horizontalmente o usá la rueda del mouse sobre las imágenes para ver todas las
          fotos de la portada.
        </p>
      ) : null}
    </section>
  );
}
