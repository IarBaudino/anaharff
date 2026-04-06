export interface StoreItem {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  imagenUrl: string;
}

/** Bloque de texto de introducción en un idioma (etiqueta solo para el panel; en el sitio se muestran en orden). */
export interface IntroduccionIdioma {
  id: string;
  etiqueta: string;
  texto: string;
}

export interface HomeContent {
  /** Título muy visible que se muestra al público (encima de las líneas decorativas y en el hero). */
  titulo: string;
  /**
   * Imagen vertical del hero (columna izquierda en escritorio). Obligatoria al publicar;
   * URL HTTPS asignada al subir desde el panel.
   */
  heroImagenUrl: string;
  /** Línea pequeña de contexto encima de la foto del hero. */
  heroKicker: string;
  introduccionIdiomas: IntroduccionIdioma[];
  destacadosKicker: string;
  destacadosTitulo: string;
  destacadosLinkTexto: string;
  cierreKicker: string;
  cierreTexto: string;
}

/** Un idioma completo en /sobre-mi: biografía (2 párrafos) + bloque sesión. */
export interface SobreMiIdioma {
  id: string;
  etiqueta: string;
  bio1: string;
  bio2: string;
  tituloSesion: string;
  sesionTexto: string;
}

export interface SobreMiContent {
  kickerColumna: string;
  tituloPagina: string;
  idiomas: SobreMiIdioma[];
}

export interface BlogEntrada {
  id: string;
  titulo: string;
  /** Fecha opcional para mostrar (ej. 2025-03-15). */
  fecha: string;
  cuerpo: string;
  /** Imagen de la entrada (URL tras subir desde el panel). */
  imagenUrl: string;
}

export interface BlogContent {
  kicker: string;
  /** Título grande de la página /blog. */
  tituloPagina: string;
  /** Texto opcional debajo del título y antes de la lista de entradas. */
  introduccion: string;
  entradas: BlogEntrada[];
}

export interface SiteContent {
  home: HomeContent;
  sobreMi: SobreMiContent;
  blog: BlogContent;
  tienda: {
    titulo: string;
    descripcion: string;
    items: StoreItem[];
  };
}

const HOME_HERO_DEFAULT =
  "https://placehold.co/900x1200/f7f5f0/8c8c8c?text=Ana+Harff";

export const defaultSiteContent: SiteContent = {
  home: {
    titulo: "ANA HARFF",
    heroImagenUrl: HOME_HERO_DEFAULT,
    heroKicker: "Fotografía analógica · Buenos Aires",
    introduccionIdiomas: [
      {
        id: "es",
        etiqueta: "Español",
        texto:
          "Abrazar la diversidad y la autenticidad es crucial para liberarnos de los estereotipos. Te invito a reflexionar sobre la importancia de la representación del cuerpo y a ser parte de una necesaria reflexión sobre la igualdad, la emancipación y la lucha por la autenticidad corporal.",
      },
      {
        id: "en",
        etiqueta: "Inglés",
        texto:
          "Embracing diversity and authenticity is crucial to liberate ourselves from stereotypes. I invite you to reflect on the importance of body representation and to be part of a necessary reflection about equality, emancipation and the struggle for body authenticity.",
      },
    ],
    destacadosKicker: "Destacados",
    destacadosTitulo: "Trabajos recientes",
    destacadosLinkTexto: "Ver tienda completa",
    cierreKicker: "Contacto",
    cierreTexto: "Sesiones, colaboraciones o consultas por obra.",
  },
  sobreMi: {
    kickerColumna: "Estudio",
    tituloPagina: "Sobre mí",
    idiomas: [
      {
        id: "es",
        etiqueta: "Español",
        bio1:
          "Fotógrafa analógica radicada en Buenos Aires. Mi trabajo explora la representación del cuerpo, la diversidad y la autenticidad. A través de la fotografía analógica busco capturar momentos de vulnerabilidad y verdad.",
        bio2:
          "Mi práctica fotográfica se centra en desnudos artísticos, retratos íntimos y series que cuestionan los estereotipos corporales. Creo en la importancia de la representación diversa y en la lucha por la emancipación del cuerpo.",
        tituloSesion: "Sesión de fotos",
        sesionTexto:
          "Ofrezco sesiones de fotografía analógica personalizadas. Si te interesa reservar una sesión, no dudes en contactarme.",
      },
    ],
  },
  blog: {
    kicker: "Textos",
    tituloPagina: "Blog",
    introduccion:
      "Próximamente: reflexiones, detrás de escena y textos sobre el proceso creativo.",
    entradas: [],
  },
  tienda: {
    titulo: "Tienda",
    descripcion:
      "Imágenes en edición limitada. Fotografía analógica impresa o en formato digital de alta resolución.",
    items: [
      {
        id: "1",
        titulo: "Serie Unica - #1",
        descripcion: "Fotografía analógica 35mm",
        precio: 15000,
        imagenUrl: "https://placehold.co/600x800/f7f5f0/1a1a1a?text=1",
      },
      {
        id: "2",
        titulo: "Serie Unica - #2",
        descripcion: "Fotografía analógica 35mm",
        precio: 15000,
        imagenUrl: "https://placehold.co/600x800/f7f5f0/1a1a1a?text=2",
      },
      {
        id: "3",
        titulo: "Retrato - #1",
        descripcion: "Impresión fine art",
        precio: 25000,
        imagenUrl: "https://placehold.co/600x800/f7f5f0/1a1a1a?text=3",
      },
      {
        id: "4",
        titulo: "Retrato - #2",
        descripcion: "Impresión fine art",
        precio: 25000,
        imagenUrl: "https://placehold.co/600x800/f7f5f0/1a1a1a?text=4",
      },
      {
        id: "5",
        titulo: "Experimental - #1",
        descripcion: "Edición limitada",
        precio: 18000,
        imagenUrl: "https://placehold.co/600x800/f7f5f0/1a1a1a?text=5",
      },
      {
        id: "6",
        titulo: "Experimental - #2",
        descripcion: "Edición limitada",
        precio: 18000,
        imagenUrl: "https://placehold.co/600x800/f7f5f0/1a1a1a?text=6",
      },
    ],
  },
};

/** Migra Firestore antiguo (parrafoEs / parrafoEn) al modelo por idiomas. */
type LegacyHome = Partial<HomeContent> & {
  parrafoEs?: string;
  parrafoEn?: string;
};

export function newIntroduccionLangId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `lang-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function normalizeHome(partial: unknown): HomeContent {
  const p = (partial ?? {}) as LegacyHome;

  const titulo = typeof p.titulo === "string" ? p.titulo : "ANA HARFF";

  let heroImagenUrl = typeof p.heroImagenUrl === "string" ? p.heroImagenUrl.trim() : "";
  if (!heroImagenUrl) heroImagenUrl = HOME_HERO_DEFAULT;

  let introduccionIdiomas: IntroduccionIdioma[];
  if (Array.isArray(p.introduccionIdiomas) && p.introduccionIdiomas.length > 0) {
    introduccionIdiomas = p.introduccionIdiomas.map((row, i) => ({
      id: typeof row.id === "string" && row.id ? row.id : newIntroduccionLangId(),
      etiqueta:
        typeof row.etiqueta === "string" && row.etiqueta.trim()
          ? row.etiqueta.trim()
          : `Idioma ${i + 1}`,
      texto: typeof row.texto === "string" ? row.texto : "",
    }));
  } else {
    const es =
      typeof p.parrafoEs === "string"
        ? p.parrafoEs
        : "Abrazar la diversidad y la autenticidad es crucial para liberarnos de los estereotipos. Te invito a reflexionar sobre la importancia de la representación del cuerpo y a ser parte de una necesaria reflexión sobre la igualdad, la emancipación y la lucha por la autenticidad corporal.";
    const en =
      typeof p.parrafoEn === "string"
        ? p.parrafoEn
        : "Embracing diversity and authenticity is crucial to liberate ourselves from stereotypes. I invite you to reflect on the importance of body representation and to be part of a necessary reflection about equality, emancipation and the struggle for body authenticity.";
    introduccionIdiomas = [
      { id: "es", etiqueta: "Español", texto: es },
      { id: "en", etiqueta: "Inglés", texto: en },
    ];
  }

  const def = defaultSiteContent.home;

  return {
    titulo,
    heroImagenUrl,
    heroKicker:
      typeof p.heroKicker === "string" ? p.heroKicker : def.heroKicker,
    introduccionIdiomas,
    destacadosKicker:
      typeof p.destacadosKicker === "string" ? p.destacadosKicker : def.destacadosKicker,
    destacadosTitulo:
      typeof p.destacadosTitulo === "string" ? p.destacadosTitulo : def.destacadosTitulo,
    destacadosLinkTexto:
      typeof p.destacadosLinkTexto === "string"
        ? p.destacadosLinkTexto
        : def.destacadosLinkTexto,
    cierreKicker:
      typeof p.cierreKicker === "string" ? p.cierreKicker : def.cierreKicker,
    cierreTexto:
      typeof p.cierreTexto === "string" ? p.cierreTexto : def.cierreTexto,
  };
}

type LegacySobreMi = Partial<SobreMiContent> & {
  bio1?: string;
  bio2?: string;
  tituloSesion?: string;
  sesionTexto?: string;
};

export function normalizeSobreMi(partial: unknown): SobreMiContent {
  const p = (partial ?? {}) as LegacySobreMi;
  const def = defaultSiteContent.sobreMi;

  let idiomas: SobreMiIdioma[];
  if (Array.isArray(p.idiomas) && p.idiomas.length > 0) {
    idiomas = p.idiomas.map((row, i) => ({
      id: typeof row.id === "string" && row.id ? row.id : newIntroduccionLangId(),
      etiqueta:
        typeof row.etiqueta === "string" && row.etiqueta.trim()
          ? row.etiqueta.trim()
          : `Idioma ${i + 1}`,
      bio1: typeof row.bio1 === "string" ? row.bio1 : "",
      bio2: typeof row.bio2 === "string" ? row.bio2 : "",
      tituloSesion: typeof row.tituloSesion === "string" ? row.tituloSesion : "",
      sesionTexto: typeof row.sesionTexto === "string" ? row.sesionTexto : "",
    }));
  } else {
    idiomas = [
      {
        id: "es",
        etiqueta: "Español",
        bio1:
          typeof p.bio1 === "string" ? p.bio1 : def.idiomas[0]?.bio1 ?? "",
        bio2:
          typeof p.bio2 === "string" ? p.bio2 : def.idiomas[0]?.bio2 ?? "",
        tituloSesion:
          typeof p.tituloSesion === "string"
            ? p.tituloSesion
            : def.idiomas[0]?.tituloSesion ?? "",
        sesionTexto:
          typeof p.sesionTexto === "string"
            ? p.sesionTexto
            : def.idiomas[0]?.sesionTexto ?? "",
      },
    ];
  }

  return {
    kickerColumna:
      typeof p.kickerColumna === "string" ? p.kickerColumna : def.kickerColumna,
    tituloPagina:
      typeof p.tituloPagina === "string" ? p.tituloPagina : def.tituloPagina,
    idiomas,
  };
}

type LegacyBlog = Partial<BlogContent> & {
  /** Modelo anterior: un solo cuerpo de página. */
  titulo?: string;
  cuerpo?: string;
};

export function normalizeBlog(partial: unknown): BlogContent {
  const p = (partial ?? {}) as LegacyBlog;
  const def = defaultSiteContent.blog;

  let introduccion =
    typeof p.introduccion === "string" ? p.introduccion : "";
  if (!introduccion && typeof p.cuerpo === "string") {
    introduccion = p.cuerpo;
  }

  const tituloPagina =
    typeof p.tituloPagina === "string"
      ? p.tituloPagina
      : typeof p.titulo === "string"
        ? p.titulo
        : def.tituloPagina;

  let entradas: BlogEntrada[] = [];
  if (Array.isArray(p.entradas) && p.entradas.length > 0) {
    entradas = p.entradas.map((row, i) => ({
      id:
        typeof row.id === "string" && row.id
          ? row.id
          : newIntroduccionLangId(),
      titulo: typeof row.titulo === "string" ? row.titulo : `Entrada ${i + 1}`,
      fecha: typeof row.fecha === "string" ? row.fecha : "",
      cuerpo: typeof row.cuerpo === "string" ? row.cuerpo : "",
      imagenUrl:
        typeof row.imagenUrl === "string" ? row.imagenUrl.trim() : "",
    }));
  }

  return {
    kicker: typeof p.kicker === "string" ? p.kicker : def.kicker,
    tituloPagina,
    introduccion,
    entradas,
  };
}

/** Para validar guardado desde el panel: imagen real obligatoria (no solo placeholder por defecto). */
export function isPlaceholderHeroUrl(url: string): boolean {
  const u = (url ?? "").trim().toLowerCase();
  return u.includes("placehold.co") || u === "";
}
