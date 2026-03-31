import Link from "next/link";
import { Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-charcoal/10 bg-charcoal text-cream mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="font-display text-lg mb-1">ANA HARFF</p>
            <p className="text-sm text-cream/80">Fotografía Analógica | Buenos Aires</p>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="https://instagram.com/anaharff"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream/80 hover:text-cream transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={22} />
            </Link>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-cream/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-cream/70">
          <nav className="flex flex-wrap justify-center gap-6">
            <Link href="/sobre-mi" className="hover:text-cream transition-colors">
              Sobre mí
            </Link>
            <Link href="/contacto" className="hover:text-cream transition-colors">
              Contacto
            </Link>
            <Link href="/tienda" className="hover:text-cream transition-colors">
              Tienda
            </Link>
          </nav>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <p>© {new Date().getFullYear()} Ana Harff. Todos los derechos reservados.</p>
            <Link
              href="/admin"
              className="inline-flex items-center rounded border border-cream/25 px-3 py-1.5 text-xs tracking-widest uppercase text-cream/70 hover:border-cream/50 hover:text-cream transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
