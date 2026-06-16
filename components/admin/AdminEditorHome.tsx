"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import {
  isHomeHeroConfigured,
  newIntroduccionLangId,
  newTestimonioId,
  resolveHomeHeroImages,
  type IntroduccionIdioma,
} from "@/lib/site-content";
import {
  ADMIN_SAVE_SUCCESS,
  AdminPanelNotice,
  adminNoticeVariant,
  useAdminPanelUi,
} from "@/components/admin/admin-panel-ui";
import { HomeDestacadosEditor } from "@/components/admin/HomeDestacadosEditor";
import { StorageUploadField } from "@/components/admin/StorageUploadField";
import {
  AdminInput,
  AdminTextarea,
  HelpText,
  PanelTitle,
  SectionHeading,
} from "@/components/admin/admin-fields";

export function AdminEditorHome() {
  const { confirmDelete } = useAdminPanelUi();
  const { content, setContent, save, saving, loading, error, isFirebaseConfigured } =
    useSiteContent();
  const [message, setMessage] = useState<string | null>(null);

  function setHeroImagenes(next: string[]) {
    const trimmed = next.slice(0, 6);
    setContent({
      ...content,
      home: {
        ...content.home,
        heroImagenes: trimmed,
        heroImagenUrl: trimmed[0] ?? "",
      },
    });
  }

  async function onSave() {
    if (!isHomeHeroConfigured(content.home)) {
      setMessage(
        "Tenés que subir al menos una imagen vertical para la portada del inicio (hasta 6)."
      );
      return;
    }
    if (!content.home.introduccionIdiomas.length) {
      setMessage("Añadí al menos un bloque de introducción (idioma + texto).");
      return;
    }
    const res = await save(content);
    if (res.ok) {
      setMessage(
        res.offline ? "Cambios guardados (solo en este navegador)." : ADMIN_SAVE_SUCCESS
      );
      return;
    }
    setMessage("No se pudo guardar.");
  }

  function updateIdioma(id: string, patch: Partial<IntroduccionIdioma>) {
    setContent({
      ...content,
      home: {
        ...content.home,
        introduccionIdiomas: content.home.introduccionIdiomas.map((b) =>
          b.id === id ? { ...b, ...patch } : b
        ),
      },
    });
  }

  function addIdioma() {
    setContent({
      ...content,
      home: {
        ...content.home,
        introduccionIdiomas: [
          ...content.home.introduccionIdiomas,
          { id: newIntroduccionLangId(), etiqueta: "Nuevo idioma", texto: "" },
        ],
      },
    });
  }

  async function removeIdioma(id: string) {
    if (content.home.introduccionIdiomas.length <= 1) return;
    const bloque = content.home.introduccionIdiomas.find((b) => b.id === id);
    const name = bloque?.etiqueta?.trim() || "este bloque de idioma";
    if (
      !(await confirmDelete({
        detail: `Vas a quitar el bloque «${name}».`,
        deletesStoredImages: false,
      }))
    ) {
      return;
    }
    setContent({
      ...content,
      home: {
        ...content.home,
        introduccionIdiomas: content.home.introduccionIdiomas.filter((b) => b.id !== id),
      },
    });
  }

  const heroImages = resolveHomeHeroImages(content.home);

  if (loading) {
    return <p className="text-stone">Cargando contenido...</p>;
  }

  const noticeVariant = adminNoticeVariant(message);

  return (
    <div className="space-y-10">
      {message && noticeVariant ? (
        <AdminPanelNotice variant={noticeVariant}>{message}</AdminPanelNotice>
      ) : null}
      {!isFirebaseConfigured && (
        <div className="border border-amber-500/30 bg-amber-100/50 p-4 text-sm text-amber-900">
          Podés editar aquí, pero los cambios <strong>no se publicarán</strong> en el sitio hasta que
          esté todo conectado. Si ves este aviso en la web ya publicada, contactá a quien te dio
          acceso.
        </div>
      )}

      <div>
        <PanelTitle>Página principal</PanelTitle>
        <HelpText>
          Orden en el sitio: <strong>portada</strong> (imágenes verticales) →{" "}
          <strong>testimonios</strong> → subtítulo e <strong>introducción</strong>.
        </HelpText>
      </div>

      <section className="space-y-4">
        <SectionHeading>Nombre del sitio (solo SEO)</SectionHeading>
        <AdminInput
          id="home-titulo"
          label="Título para buscadores y pestaña del navegador"
          hint="Ya no se muestra grande en el inicio. El visitante ve el subtítulo (línea sobre la intro) y los textos de presentación."
          example="Ana Harff"
          value={content.home.titulo}
          onChange={(e) =>
            setContent({
              ...content,
              home: { ...content.home, titulo: e.target.value },
            })
          }
        />
      </section>

      <section className="space-y-4">
        <SectionHeading>Portada del inicio (imágenes verticales)</SectionHeading>
        <HelpText>
          Hasta <strong>6 fotos verticales</strong> en fila, estilo portfolio editorial. El orden
          acá es el orden en el sitio.
        </HelpText>
        <StorageUploadField
          folder="home"
          multiple
          disabled={saving || heroImages.length >= 6}
          onUploaded={(secureUrl) => {
            if (!secureUrl || heroImages.includes(secureUrl)) return;
            setHeroImagenes([...heroImages, secureUrl]);
          }}
        />
        {heroImages.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {heroImages.map((url, idx) => (
              <div key={url} className="space-y-2 rounded-lg border border-charcoal/10 p-2">
                <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-charcoal/[0.04]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] text-stone">#{idx + 1}</span>
                  <div className="flex gap-0.5">
                    <button
                      type="button"
                      className="rounded border border-charcoal/15 p-1 disabled:opacity-40"
                      disabled={idx === 0}
                      onClick={() => {
                        const next = [...heroImages];
                        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                        setHeroImagenes(next);
                      }}
                      aria-label="Mover antes"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      className="rounded border border-charcoal/15 p-1 disabled:opacity-40"
                      disabled={idx === heroImages.length - 1}
                      onClick={() => {
                        const next = [...heroImages];
                        [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                        setHeroImagenes(next);
                      }}
                      aria-label="Mover después"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      className="rounded border border-red-200 p-1 text-red-800"
                      onClick={() =>
                        void (async () => {
                          if (
                            !(await confirmDelete({
                              detail: "Vas a quitar esta imagen de la portada.",
                              deletesStoredImages: true,
                            }))
                          ) {
                            return;
                          }
                          setHeroImagenes(heroImages.filter((u) => u !== url));
                        })()
                      }
                      aria-label="Quitar imagen"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-amber-900">
            Todavía no hay imágenes de portada. Subí al menos una (idealmente 6 verticales).
          </p>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeading>Introducción</SectionHeading>
        <HelpText>
          Van <strong>debajo de la portada y de los testimonios</strong>. El primero como texto
          principal; los siguientes, más suaves (cursiva). Podés añadir otro bloque con el botón de
          abajo.
        </HelpText>

        <div className="space-y-6">
          {content.home.introduccionIdiomas.map((bloque) => (
            <div
              key={bloque.id}
              className="rounded-lg border border-charcoal/15 bg-cream/80 p-4 shadow-sm"
            >
              {content.home.introduccionIdiomas.length > 1 && (
                <div className="mb-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => void removeIdioma(bloque.id)}
                    className="inline-flex items-center gap-1 text-xs text-stone hover:text-red-700"
                  >
                    <Trash2 className="size-3.5" />
                    Quitar idioma
                  </button>
                </div>
              )}
              <AdminInput
                label="Etiqueta del bloque (solo panel)"
                hint="Nombre para encontrar este idioma en el editor. No se muestra en el sitio."
                example="Español"
                value={bloque.etiqueta}
                onChange={(e) => updateIdioma(bloque.id, { etiqueta: e.target.value })}
              />
              <AdminTextarea
                label="Texto de introducción"
                hint="Primer bloque: texto principal. Los siguientes se muestran más suaves (cursiva)."
                example="Trabajo la fotografía como un diario visual…"
                rows={5}
                className="mt-3"
                value={bloque.texto}
                onChange={(e) => updateIdioma(bloque.id, { texto: e.target.value })}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addIdioma}
          className="inline-flex items-center gap-2 border border-charcoal/20 px-4 py-2 text-sm text-charcoal transition-colors hover:border-charcoal/40"
        >
          <Plus className="size-4" />
          Añadir otro idioma
        </button>
      </section>

      <section className="space-y-4">
        <SectionHeading>Testimonios (debajo de la portada)</SectionHeading>
        <HelpText>
          Tres columnas en escritorio: arriba el <strong>trabajo realizado</strong> (pequeño), línea
          fina, <strong>nombre</strong> y el <strong>testimonio</strong>. Sin marco de “card” en el
          sitio. Añadí o quitá filas con los botones de abajo.
        </HelpText>
        <div className="space-y-3">
          <AdminInput
            id="test-kicker"
            label="Etiqueta pequeña"
            hint="Palabra o frase corta arriba del título de la sección de testimonios."
            example="Clientes"
            value={content.home.testimoniosKicker}
            onChange={(e) =>
              setContent({
                ...content,
                home: { ...content.home, testimoniosKicker: e.target.value },
              })
            }
          />
          <AdminInput
            id="test-titulo"
            label="Título de la sección"
            hint="Encabezado de los testimonios debajo de la portada."
            example="Lo que dicen"
            value={content.home.testimoniosTitulo}
            onChange={(e) =>
              setContent({
                ...content,
                home: { ...content.home, testimoniosTitulo: e.target.value },
              })
            }
          />
        </div>
        <div className="space-y-5">
          {content.home.testimonios.map((t) => (
            <div key={t.id} className="rounded-lg border border-charcoal/15 bg-cream/80 p-4 shadow-sm">
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    void (async () => {
                      const who = t.nombre?.trim() || "este testimonio";
                      if (
                        !(await confirmDelete({
                          detail: `Vas a quitar el testimonio de «${who}».`,
                          deletesStoredImages: false,
                        }))
                      ) {
                        return;
                      }
                      setContent({
                        ...content,
                        home: {
                          ...content.home,
                          testimonios: content.home.testimonios.filter((x) => x.id !== t.id),
                        },
                      });
                    })();
                  }}
                  className="inline-flex items-center gap-1 text-xs text-stone hover:text-red-700"
                >
                  <Trash2 className="size-3.5" />
                  Quitar
                </button>
              </div>
              <AdminInput
                id={`test-trabajo-${t.id}`}
                label="Trabajo realizado (opcional)"
                hint="Línea pequeña arriba del nombre en el sitio."
                example="Sesión retrato"
                value={t.trabajoRealizado ?? ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    home: {
                      ...content.home,
                      testimonios: content.home.testimonios.map((x) =>
                        x.id === t.id
                          ? { ...x, trabajoRealizado: e.target.value || undefined }
                          : x
                      ),
                    },
                  })
                }
              />
              <AdminInput
                id={`test-nombre-${t.id}`}
                label="Nombre"
                hint="Persona o cliente que da el testimonio."
                example="María G."
                className="mt-3"
                value={t.nombre}
                onChange={(e) =>
                  setContent({
                    ...content,
                    home: {
                      ...content.home,
                      testimonios: content.home.testimonios.map((x) =>
                        x.id === t.id ? { ...x, nombre: e.target.value } : x
                      ),
                    },
                  })
                }
              />
              <AdminTextarea
                id={`test-texto-${t.id}`}
                label="Testimonio"
                hint="Cita o comentario que se muestra en la columna."
                example="Una experiencia increíble, las fotos quedaron naturales y emotivas."
                rows={4}
                className="mt-3"
                value={t.testimonio}
                onChange={(e) =>
                  setContent({
                    ...content,
                    home: {
                      ...content.home,
                      testimonios: content.home.testimonios.map((x) =>
                        x.id === t.id ? { ...x, testimonio: e.target.value } : x
                      ),
                    },
                  })
                }
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setContent({
              ...content,
              home: {
                ...content.home,
                testimonios: [
                  ...content.home.testimonios,
                  { id: newTestimonioId(), testimonio: "", nombre: "", trabajoRealizado: undefined },
                ],
              },
            })
          }
          className="inline-flex items-center gap-2 border border-charcoal/20 px-4 py-2 text-sm text-charcoal transition-colors hover:border-charcoal/40"
        >
          <Plus className="size-4" />
          Añadir testimonio
        </button>
      </section>

      <section className="space-y-4">
        <SectionHeading>Subtítulo (sobre la introducción)</SectionHeading>
        <AdminInput
          id="hero-kicker"
          label="Línea visible antes del texto de presentación"
          hint="Es lo que ve el visitante encima de la introducción (ya no hay titular grande con tu nombre)."
          example="Fotografía analógica · Buenos Aires"
          value={content.home.heroKicker}
          onChange={(e) =>
            setContent({
              ...content,
              home: { ...content.home, heroKicker: e.target.value },
            })
          }
        />
      </section>

      <section className="space-y-4">
        <SectionHeading>Sección “Trabajos recientes”</SectionHeading>
        <AdminInput
          id="dest-kicker"
          label="Etiqueta pequeña (arriba del título)"
          hint="Palabra suelta sobre el título de «Trabajos recientes»."
          example="Portfolio"
          value={content.home.destacadosKicker}
          onChange={(e) =>
            setContent({
              ...content,
              home: { ...content.home, destacadosKicker: e.target.value },
            })
          }
        />
        <AdminInput
          id="dest-titulo"
          label="Título de la sección"
          hint="Encabezado de la grilla de trabajos recientes."
          example="Trabajos recientes"
          value={content.home.destacadosTitulo}
          onChange={(e) =>
            setContent({
              ...content,
              home: { ...content.home, destacadosTitulo: e.target.value },
            })
          }
        />
        <AdminInput
          id="dest-link"
          label="Texto del enlace a portfolio"
          hint="Etiqueta del enlace que lleva al portfolio completo."
          example="Ver portfolio"
          value={content.home.destacadosLinkTexto}
          onChange={(e) =>
            setContent({
              ...content,
              home: { ...content.home, destacadosLinkTexto: e.target.value },
            })
          }
        />
        <HomeDestacadosEditor content={content} setContent={setContent} />
      </section>

      <section className="space-y-4">
        <SectionHeading>Cierre de página (antes del pie)</SectionHeading>
        <AdminInput
          id="cierre-kicker"
          label="Etiqueta pequeña"
          hint="Palabra suelta arriba de la frase de cierre, antes del pie de página."
          example="Contacto"
          value={content.home.cierreKicker}
          onChange={(e) =>
            setContent({
              ...content,
              home: { ...content.home, cierreKicker: e.target.value },
            })
          }
        />
        <AdminTextarea
          id="cierre-texto"
          label="Frase principal"
          hint="Texto de cierre o llamada a la acción al final del inicio."
          example="¿Querés trabajar juntos? Escribime."
          rows={3}
          value={content.home.cierreTexto}
          onChange={(e) =>
            setContent({
              ...content,
              home: { ...content.home, cierreTexto: e.target.value },
            })
          }
        />
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="bg-charcoal px-8 py-3 text-sm tracking-widest text-cream uppercase transition-colors hover:bg-ink disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
        {error && <p className="text-sm text-red-700">{error}</p>}
      </div>
    </div>
  );
}
