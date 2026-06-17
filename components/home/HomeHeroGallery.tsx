"use client";

import { useEffect, useRef } from "react";

type Props = {
  images: string[];
};

const STRIP_HEIGHT = "h-[calc(100dvh-3.5rem)] lg:h-dvh";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Portada del inicio: retratos a tamaño real (altura viewport, ancho proporcional)
 * y fila con scroll horizontal + snap suave, estilo portfolio editorial.
 */
export function HomeHeroGallery({ images }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || images.length < 2) return;

    let targetScroll = el.scrollLeft;
    let rafId = 0;

    const maxScrollLeft = () => Math.max(0, el.scrollWidth - el.clientWidth);

    const tick = () => {
      const max = maxScrollLeft();
      targetScroll = clamp(targetScroll, 0, max);
      const current = el.scrollLeft;
      const delta = targetScroll - current;

      if (Math.abs(delta) < 0.5) {
        el.scrollLeft = targetScroll;
        rafId = 0;
        return;
      }

      el.scrollLeft = current + delta * 0.18;
      rafId = requestAnimationFrame(tick);
    };

    const schedule = () => {
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    const wheelDelta = (e: WheelEvent) => {
      let delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) delta *= 18;
      if (e.deltaMode === WheelEvent.DOM_DELTA_PAGE) delta *= el.clientWidth * 0.85;
      return delta;
    };

    const onWheel = (e: WheelEvent) => {
      const max = maxScrollLeft();
      if (max <= 0) return;

      const rawDelta = wheelDelta(e);
      if (rawDelta === 0) return;

      const current = rafId ? targetScroll : el.scrollLeft;
      const next = current + rawDelta;

      if (rawDelta < 0 && current <= 0) return;
      if (rawDelta > 0 && current >= max - 0.5) return;

      e.preventDefault();
      targetScroll = clamp(next, 0, max);
      schedule();
    };

    const onScroll = () => {
      if (!rafId) targetScroll = el.scrollLeft;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
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
        className={`flex w-full snap-x snap-proximity overflow-x-auto overflow-y-hidden overscroll-x-contain touch-pan-x ${STRIP_HEIGHT} [scrollbar-width:thin]`}
      >
        {images.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="flex h-full shrink-0 snap-center items-center"
          >
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
