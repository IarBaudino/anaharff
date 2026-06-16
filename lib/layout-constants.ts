/**
 * Menú lateral público (desktop). Debe coincidir con el `aside` del Header (`w-56`).
 * En móvil hay barra superior (`h-14`); el main usa `pt-14` vía SIDEBAR_PAD.
 */
export const SITE_NAV_MOBILE_TOP = "pt-14";
export const SITE_NAV_SIDEBAR_WIDTH_CLASS = "w-56";

/** Padding del área de contenido (main + footer) para no quedar bajo el rail. */
export const SIDEBAR_PAD = `${SITE_NAV_MOBILE_TOP} lg:pt-0 lg:pl-56`;

/**
 * Respiro superior del contenido (debajo del rail / barra móvil).
 * Aplicado en PageBody; el inicio (hero a sangre) queda excluido.
 */
export const SITE_PAGE_TOP = "pt-8 lg:pt-12";

/** Solo padding inferior; el superior lo aplica PageBody. */
export const SITE_PAGE_SHELL = "pb-24";

export const SITE_PAGE_SHELL_COMPACT = "pb-20";
