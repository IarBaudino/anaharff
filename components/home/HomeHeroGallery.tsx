"use client";

import Image from "next/image";

type Props = {
  images: string[];
};

/** Portada del inicio: tiras verticales en fila (estilo portfolio editorial). */
export function HomeHeroGallery({ images }: Props) {
  if (images.length === 0) {
    return (
      <section
        aria-label="Imagen principal"
        className="relative h-[min(72dvh,920px)] w-full bg-charcoal/[0.04] lg:h-dvh"
      >
        <div
          className="absolute inset-0 bg-gradient-to-b from-charcoal/[0.06] via-transparent to-charcoal/[0.04]"
          aria-hidden
        />
      </section>
    );
  }

  return (
    <section
      aria-label="Imagen principal"
      className="relative h-[min(72dvh,920px)] w-full bg-[var(--color-cream)] lg:h-dvh"
    >
      <div className="flex h-full w-full snap-x snap-mandatory overflow-x-auto lg:snap-none lg:overflow-hidden">
        {images.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="relative h-full w-[46vw] shrink-0 snap-center sm:w-[32vw] md:w-[24vw] lg:w-auto lg:min-w-0 lg:flex-1"
          >
            <Image
              src={url}
              alt=""
              fill
              priority={index < 3}
              sizes="(max-width: 1024px) 46vw, 16vw"
              className="object-cover object-center"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
