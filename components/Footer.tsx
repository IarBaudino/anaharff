import Link from "next/link";
import { Instagram } from "lucide-react";
import { cn } from "@/lib/utils";

export function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "mt-auto border-t border-cream/20 bg-charcoal text-cream",
        className
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 py-3 text-[0.7rem] sm:justify-between sm:px-5 sm:py-2.5">
        <div className="flex items-center gap-3">
          <span className="font-display text-sm tracking-tight text-cream md:text-base">
            ANA HARFF
          </span>
          <span className="hidden text-cream/55 sm:inline">·</span>
          <span className="hidden text-cream/60 sm:inline">Buenos Aires</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-cream/70">
          <Link href="/sobre-mi" className="transition-colors hover:text-cream">
            Sobre mí
          </Link>
          <Link href="/contacto" className="transition-colors hover:text-cream">
            Contacto
          </Link>
          <Link href="/tienda" className="transition-colors hover:text-cream">
            Tienda
          </Link>
          <Link
            href="https://instagram.com/anaharff"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cream/65 transition-colors hover:text-cream"
            aria-label="Instagram"
          >
            <Instagram size={16} strokeWidth={1.5} />
          </Link>
        </div>
        <div className="flex w-full items-center justify-center gap-3 sm:w-auto sm:justify-end">
          <span className="text-cream/50">© {new Date().getFullYear()}</span>
          <Link
            href="/admin"
            className="rounded-full border border-cream/20 px-2.5 py-0.5 text-[0.6rem] tracking-wide text-cream/55 transition-colors hover:border-cream/35 hover:text-cream"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
