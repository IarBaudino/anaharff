export interface StoreItem {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  imagenUrl: string;
  /** Si está activo, puede aparecer en "Trabajos recientes" del inicio. */
  destacarEnInicio?: boolean;
  /** Orden manual entre destacados (1 = primero). */
  destacadoOrden?: number;
}

export interface PortfolioCategory {
  id: string;
  slug: string;
  label: string;
  description: string;
}

export interface SeriesProject {
  id: string;
  slug: string;
  label: string;
  statement: string;
  description: string;
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
  portfolio: {
    categories: PortfolioCategory[];
  };
  series: {
    projects: SeriesProject[];
  };
  tienda: {
    titulo: string;
    descripcion: string;
    /** Cantidad de cards visibles en "Trabajos recientes" (inicio). */
    destacadosCantidad: 3 | 4 | 6;
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
  portfolio: {
    categories: [
      {
        id: "cat-desnudos",
        slug: "desnudos",
        label: "Desnudos (nude)",
        description:
          "Galería de desnudo artístico y editorial en fotografía analógica. Ana Harff, Buenos Aires.",
      },
      {
        id: "cat-retratos",
        slug: "retratos",
        label: "Retratos (portrait)",
        description:
          "Retratos en fotografía analógica: mirada, identidad y presencia. Ana Harff, Buenos Aires.",
      },
      {
        id: "cat-artistico",
        slug: "artistico",
        label: "Artístico (art & shows)",
        description:
          "Obra artística, muestras y proyectos editoriales en analógico. Ana Harff, Buenos Aires.",
      },
      {
        id: "cat-experimental",
        slug: "experimental",
        label: "Experimental",
        description:
          "Procesos experimentales y lecturas libres del cuerpo y el espacio en analógico. Ana Harff.",
      },
      {
        id: "cat-familia",
        slug: "familia",
        label: "Familia",
        description:
          "Books de embarazo, pareja y familia en fotografía analógica. Ana Harff, Buenos Aires.",
      },
    ],
  },
  series: {
    projects: [
      {
        id: "series-unica",
        slug: "unica",
        label: "Unica",
        statement: "Un relato íntimo sobre identidad, presencia y gesto en fotografía analógica.",
        description:
          'Serie fotográfica "Unica" — narrativa en analógico. Ana Harff, Buenos Aires.',
      },
      {
        id: "series-ser-gorda",
        slug: "ser-gorda",
        label: "Ser Gorda",
        statement: "Una mirada sobre cuerpo, representación y autonomía fuera de los estereotipos.",
        description:
          'Proyecto "Ser Gorda" — cuerpo, identidad y fotografía analógica. Ana Harff, Buenos Aires.',
      },
      {
        id: "series-venus-as-a-boy",
        slug: "venus-as-a-boy",
        label: "Venus as a Boy",
        statement: "Cruces entre ternura, ambigüedad y deseo desde una estética sensible.",
        description:
          'Serie "Venus as a Boy" — fotografía analógica y exploración visual. Ana Harff, Buenos Aires.',
      },
      {
        id: "series-desde-la-distancia",
        slug: "desde-la-distancia",
        label: "Desde la Distancia",
        statement: "Imágenes sobre memoria, ausencia y vínculo cuando el cuerpo no está cerca.",
        description:
          'Serie "Desde la Distancia" — distancia, memoria y analógico. Ana Harff, Buenos Aires.',
      },
    ],
  },
  tienda: {
    titulo: "Tienda",
    descripcion:
      "Imágenes en edición limitada. Fotografía analógica impresa o en formato digital de alta resolución.",
    destacadosCantidad: 3,
    items: [
      {
        id: "1",
        titulo: "Serie Unica - #1",
        descripcion: "Fotografía analógica 35mm",
        precio: 15000,
        imagenUrl: "https://placehold.co/600x800/f7f5f0/1a1a1a?text=1",
        destacarEnInicio: true,
        destacadoOrden: 1,
      },
      {
        id: "2",
        titulo: "Serie Unica - #2",
        descripcion: "Fotografía analógica 35mm",
        precio: 15000,
        imagenUrl: "https://placehold.co/600x800/f7f5f0/1a1a1a?text=2",
        destacarEnInicio: true,
        destacadoOrden: 2,
      },
      {
        id: "3",
        titulo: "Retrato - #1",
        descripcion: "Impresión fine art",
        precio: 25000,
        imagenUrl: "https://placehold.co/600x800/f7f5f0/1a1a1a?text=3",
        destacarEnInicio: true,
        destacadoOrden: 3,
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

export function slugifyLabel(input: string): string {
  return (input || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function newManagedItemId(prefix = "item"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function normalizePortfolioCategories(partial: unknown): PortfolioCategory[] {
  const rows = Array.isArray(partial) ? partial : defaultSiteContent.portfolio.categories;
  const out: PortfolioCategory[] = rows.map((row, i) => {
    const r = (row ?? {}) as Partial<PortfolioCategory>;
    const label = typeof r.label === "string" && r.label.trim() ? r.label.trim() : `Categoría ${i + 1}`;
    const slugRaw = typeof r.slug === "string" ? r.slug : "";
    const slug = slugifyLabel(slugRaw) || slugifyLabel(label) || `categoria-${i + 1}`;
    return {
      id: typeof r.id === "string" && r.id ? r.id : newManagedItemId("cat"),
      slug,
      label,
      description: typeof r.description === "string" ? r.description : "",
    };
  });

  const used = new Set<string>();
  return out.map((row) => {
    let candidate = row.slug;
    let n = 2;
    while (used.has(candidate)) {
      candidate = `${row.slug}-${n}`;
      n += 1;
    }
    used.add(candidate);
    return { ...row, slug: candidate };
  });
}

export function normalizeSeriesProjects(partial: unknown): SeriesProject[] {
  const rows = Array.isArray(partial) ? partial : defaultSiteContent.series.projects;
  const out: SeriesProject[] = rows.map((row, i) => {
    const r = (row ?? {}) as Partial<SeriesProject>;
    const label = typeof r.label === "string" && r.label.trim() ? r.label.trim() : `Serie ${i + 1}`;
    const slugRaw = typeof r.slug === "string" ? r.slug : "";
    const slug = slugifyLabel(slugRaw) || slugifyLabel(label) || `serie-${i + 1}`;
    return {
      id: typeof r.id === "string" && r.id ? r.id : newManagedItemId("series"),
      slug,
      label,
      statement: typeof r.statement === "string" ? r.statement : "",
      description: typeof r.description === "string" ? r.description : "",
    };
  });

  const used = new Set<string>();
  return out.map((row) => {
    let candidate = row.slug;
    let n = 2;
    while (used.has(candidate)) {
      candidate = `${row.slug}-${n}`;
      n += 1;
    }
    used.add(candidate);
    return { ...row, slug: candidate };
  });
}

export function normalizeStoreItems(items: unknown): StoreItem[] {
  const fallback = defaultSiteContent.tienda.items;
  const source = Array.isArray(items) ? items : fallback;

  return source.map((row, i) => {
    const it = (row ?? {}) as Partial<StoreItem>;
    return {
      id: typeof it.id === "string" && it.id ? it.id : `item-${i + 1}`,
      titulo: typeof it.titulo === "string" ? it.titulo : `Obra ${i + 1}`,
      descripcion: typeof it.descripcion === "string" ? it.descripcion : "",
      precio: typeof it.precio === "number" ? it.precio : 0,
      imagenUrl: typeof it.imagenUrl === "string" ? it.imagenUrl : "",
      destacarEnInicio: Boolean(it.destacarEnInicio),
      destacadoOrden:
        typeof it.destacadoOrden === "number" && Number.isFinite(it.destacadoOrden)
          ? Math.max(1, Math.round(it.destacadoOrden))
          : undefined,
    };
  });
}

export function normalizeFeaturedOrder(items: StoreItem[]): StoreItem[] {
  const marked = items
    .filter((it) => it.destacarEnInicio)
    .sort((a, b) => (a.destacadoOrden ?? Number.MAX_SAFE_INTEGER) - (b.destacadoOrden ?? Number.MAX_SAFE_INTEGER));

  const orderMap = new Map(marked.map((it, i) => [it.id, i + 1]));
  return items.map((it) => {
    if (!it.destacarEnInicio) return { ...it, destacadoOrden: undefined };
    return { ...it, destacadoOrden: orderMap.get(it.id) ?? 1 };
  });
}

/** Para validar guardado desde el panel: imagen real obligatoria (no solo placeholder por defecto). */
export function isPlaceholderHeroUrl(url: string): boolean {
  const u = (url ?? "").trim().toLowerCase();
  return u.includes("placehold.co") || u === "";
}
