/** Botones sitio público: píldora, tracking suave, sin bloques cuadrados tipo plantilla. */

export const siteButtonBase =
  "inline-flex items-center justify-center rounded-full text-sm font-medium tracking-[0.06em] transition-colors";

export const siteButtonOutline =
  `${siteButtonBase} border border-charcoal/70 bg-transparent px-7 py-2.5 text-charcoal hover:border-charcoal hover:bg-charcoal hover:text-cream`;

export const siteButtonSolid =
  `${siteButtonBase} bg-charcoal px-7 py-2.5 text-cream shadow-sm hover:bg-ink disabled:opacity-50`;

export const siteButtonGhost =
  `${siteButtonBase} border border-charcoal/20 bg-transparent px-7 py-2.5 text-charcoal hover:border-charcoal/35 hover:bg-charcoal/[0.04]`;
