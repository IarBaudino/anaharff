"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CardImageProps {
  src?: string;
  alt: string;
  aspectRatio?: "3/4" | "4/5" | "1/1";
}

interface CardProps {
  children: ReactNode;
  as?: "div" | "article" | "a";
  href?: string;
  className?: string;
}

export function Card({ children, as: Component = "div", href, className }: CardProps) {
  const base =
    "group mx-auto block w-full max-w-[17rem] overflow-hidden rounded-xl border border-charcoal/10 bg-cream p-0 shadow-sm transition-all duration-500 hover:border-charcoal/[0.18] hover:shadow-[0_12px_40px_-12px_rgba(26,26,26,0.12)] sm:max-w-[17.5rem]";

  if (href && Component === "a") {
    return (
      <Link href={href} className={cn(base, className)}>
        {children}
      </Link>
    );
  }

  return (
    <Component className={cn(base, href && "cursor-pointer", className)}>
      {children}
    </Component>
  );
}

export function CardImage({ src, alt, aspectRatio = "3/4" }: CardImageProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-charcoal/5",
        aspectRatio === "3/4" && "aspect-[3/4]",
        aspectRatio === "4/5" && "aspect-[4/5]",
        aspectRatio === "1/1" && "aspect-square"
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
        />
      ) : (
        <div className="absolute inset-0 bg-charcoal/[0.04] flex items-center justify-center">
          <span className="text-stone/40 text-xs tracking-widest uppercase">Imagen</span>
        </div>
      )}
      {/* Overlay sutil al hover */}
      <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/[0.03] transition-colors duration-300" />
    </div>
  );
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("p-5", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn("font-display text-lg md:text-xl font-light text-charcoal tracking-tight", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-sm text-stone mt-0.5", className)}>
      {children}
    </p>
  );
}

export function CardPrice({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-base font-medium text-charcoal mt-2", className)}>
      {children}
    </p>
  );
}
