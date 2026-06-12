import Link from "next/link";
import { getCurriculoLinea } from "@/lib/curriculo-display";
import type { SobreMiCurriculoEntrada } from "@/lib/site-content";

type Props = {
  entry: SobreMiCurriculoEntrada;
};

const linkClass =
  "font-normal underline decoration-charcoal/20 underline-offset-[3px] transition-colors hover:text-accent hover:decoration-accent/40";

function LinkedSpan({ href, children }: { href: string; children: string }) {
  const external = /^https?:\/\//i.test(href);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={linkClass}>
      {children}
    </Link>
  );
}

export function CurriculoEntryLine({ entry }: Props) {
  const linea = getCurriculoLinea(entry);
  if (!linea) return null;

  const href = entry.enlace?.trim();
  const nombre = entry.nombre.trim();

  if (href && nombre && linea.startsWith(nombre)) {
    const suffix = linea.slice(nombre.length);
    return (
      <span>
        <LinkedSpan href={href}>{nombre}</LinkedSpan>
        {suffix}
      </span>
    );
  }

  if (href) {
    return <LinkedSpan href={href}>{linea}</LinkedSpan>;
  }

  return <span>{linea}</span>;
}
