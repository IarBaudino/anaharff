"use client";

import { useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import {
  isPlaceholderHeroUrl,
  newIntroduccionLangId,
  newTestimonioId,
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
  FieldLabel,
  HelpText,
  inputClass,
  PanelTitle,
  SectionHeading,
} from "@/components/admin/admin-fields";

export function AdminEditorHome() {
  const { confirmDelete } = useAdminPanelUi();
  const { content, setContent, save, saving, loading, error, isFirebaseConfigured } =
    useSiteContent();
  const [message, setMessage] = useState<string | null>(null);
  const heroPreviewRef = useRef<HTMLDivElement | null>(null);
  const heroPreviewMobileRef = useRef<HTMLDivElement | null>(null);

  async function onSave() {
    if (isPlaceholderHeroUrl(content.home.heroImagenUrl)) {
      setMessage(
        "Tenés que subir la foto principal del inicio con el botón «Subir imagen». No se puede guardar dejando solo la imagen de muestra."
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

  function updateHeroFocusFromPointer(clientX: number, clientY: number) {
    const el = heroPreviewRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    const clamp = (v: number) => Math.max(0, Math.min(100, v));
    setContent({
      ...content,
      home: { ...content.home, heroFocoX: clamp(x), heroFocoY: clamp(y) },
    });
  }

  function updateHeroFocusMobileFromPointer(clientX: number, clientY: number) {
    const el = heroPreviewMobileRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    const clamp = (v: number) => Math.max(0, Math.min(100, v));
    setContent({
      ...content,
      home: { ...content.home, heroFocoXMobile: clamp(x), heroFocoYMobile: clamp(y) },
    });
  }

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
          Todo lo de esta pestaña se ve en el <strong>inicio del sitio</strong>: portada a
          pantalla completa, testimonios, título y textos. La portada usa recorte tipo{" "}
          <strong>cover</strong> y podés mover el foco.
        </HelpText>
      </div>

      <section className="space-y-4">
        <SectionHeading>Título del sitio</SectionHeading>
        <div>
          <FieldLabel htmlFor="home-titulo">Nombre que se muestra como titular principal</FieldLabel>
          <HelpText>
            Aparece muy grande en el inicio (debajo de testimonios) y en el encabezado del navegador
            si no definís otro. Los enlaces a Instagram y contacto están en la barra lateral del
            sitio. Suele ser tu nombre artístico en mayúsculas o el que prefieras.
          </HelpText>
          <input
            id="home-titulo"
            className={inputClass()}
            value={content.home.titulo}
            onChange={(e) =>
              setContent({
                ...content,
                home: { ...content.home, titulo: e.target.value },
              })
            }
          />
        </div>
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
              <input
                className={inputClass()}
                value={bloque.etiqueta}
                onChange={(e) => updateIdioma(bloque.id, { etiqueta: e.target.value })}
                placeholder="Español, Inglés, …"
                aria-label="Nombre del bloque (solo para tu referencia en el panel)"
              />
              <textarea
                className={`${inputClass()} mt-3`}
                rows={5}
                value={bloque.texto}
                onChange={(e) => updateIdioma(bloque.id, { texto: e.target.value })}
                placeholder="Texto que verá el visitante en este idioma"
                aria-label="Texto del bloque"
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
        <SectionHeading>Foto principal del inicio</SectionHeading>
        <HelpText>
          <strong>Obligatoria:</strong> es la imagen de la portada a pantalla completa. Se muestra{" "}
          con recorte automático para cubrir todo el bloque. Podés ajustar el foco horizontal y
          vertical justo debajo. Subila con el botón. No se puede guardar dejando solo la imagen de
          muestra.
        </HelpText>
        <StorageUploadField
          folder="home"
          previewUrl={content.home.heroImagenUrl}
          onUploaded={(secureUrl) =>
            setContent({
              ...content,
              home: { ...content.home, heroImagenUrl: secureUrl },
            })
          }
          disabled={saving}
          autoDeletePrevious
        />
        <div className="space-y-2">
          <FieldLabel>Ajuste de recorte (arrastrá en la imagen)</FieldLabel>
          <HelpText>
            Vista desktop y móvil con el mismo recorte real del home (cover). Arrastrá en la desktop
            para mover el foco.
          </HelpText>
          <div
            ref={heroPreviewRef}
            className="relative w-full cursor-move overflow-hidden rounded-lg border border-charcoal/15 bg-charcoal/[0.04] h-[calc(100dvh-3.5rem)] max-h-[820px] min-h-[320px] lg:h-[100dvh]"
            style={{ width: "min(100%, calc(100vw - 14rem - 3rem))" }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              updateHeroFocusFromPointer(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (e.buttons !== 1) return;
              updateHeroFocusFromPointer(e.clientX, e.clientY);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.home.heroImagenUrl}
              alt=""
              className="h-full w-full object-cover"
              style={{ objectPosition: `${content.home.heroFocoX}% ${content.home.heroFocoY}%` }}
            />
            <div
              className="pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cream bg-charcoal/35 shadow"
              style={{ left: `${content.home.heroFocoX}%`, top: `${content.home.heroFocoY}%` }}
            />
          </div>
          <div className="pt-3">
            <p className="mb-2 text-xs uppercase tracking-widest text-stone">Vista móvil</p>
            <div
              ref={heroPreviewMobileRef}
              className="w-full cursor-move overflow-hidden rounded-lg border border-charcoal/15 bg-charcoal/[0.04]"
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                updateHeroFocusMobileFromPointer(e.clientX, e.clientY);
              }}
              onPointerMove={(e) => {
                if (e.buttons !== 1) return;
                updateHeroFocusMobileFromPointer(e.clientX, e.clientY);
              }}
            >
              <div className="relative h-[62dvh] max-h-[620px] min-h-[260px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={content.home.heroImagenUrl}
                  alt=""
                  className="h-full w-full object-contain"
                  style={{
                    objectPosition: `${content.home.heroFocoXMobile}% top`,
                  }}
                />
                <div
                  className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cream bg-charcoal/35 shadow"
                  style={{
                    left: `${content.home.heroFocoXMobile}%`,
                    top: "8px",
                  }}
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-stone">
            Foco desktop: X {Math.round(content.home.heroFocoX)}% · Y {Math.round(content.home.heroFocoY)}% ·
            Foco móvil: X {Math.round(content.home.heroFocoXMobile)}% · Y{" "}
            {Math.round(content.home.heroFocoYMobile)}%
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading>Testimonios (debajo de la portada)</SectionHeading>
        <HelpText>
          Tres columnas en escritorio: arriba el <strong>trabajo realizado</strong> (pequeño), línea
          fina, <strong>nombre</strong> y el <strong>testimonio</strong>. Sin marco de “card” en el
          sitio. Añadí o quitá filas con los botones de abajo.
        </HelpText>
        <div className="space-y-3">
          <div>
            <FieldLabel htmlFor="test-kicker">Etiqueta pequeña</FieldLabel>
            <input
              id="test-kicker"
              className={inputClass()}
              value={content.home.testimoniosKicker}
              onChange={(e) =>
                setContent({
                  ...content,
                  home: { ...content.home, testimoniosKicker: e.target.value },
                })
              }
            />
          </div>
          <div>
            <FieldLabel htmlFor="test-titulo">Título de la sección</FieldLabel>
            <input
              id="test-titulo"
              className={inputClass()}
              value={content.home.testimoniosTitulo}
              onChange={(e) =>
                setContent({
                  ...content,
                  home: { ...content.home, testimoniosTitulo: e.target.value },
                })
              }
            />
          </div>
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
              <div>
                <FieldLabel htmlFor={`test-trabajo-${t.id}`}>Trabajo realizado (opcional)</FieldLabel>
                <input
                  id={`test-trabajo-${t.id}`}
                  className={`${inputClass()} mt-1`}
                  value={t.trabajoRealizado ?? ""}
                  placeholder="Ej.: Sesión retrato, edición limitada…"
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
              </div>
              <div className="mt-3">
                <FieldLabel htmlFor={`test-nombre-${t.id}`}>Nombre</FieldLabel>
                <input
                  id={`test-nombre-${t.id}`}
                  className={`${inputClass()} mt-1`}
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
              </div>
              <div className="mt-3">
                <FieldLabel htmlFor={`test-texto-${t.id}`}>Testimonio</FieldLabel>
                <textarea
                  id={`test-texto-${t.id}`}
                  className={`${inputClass()} mt-1`}
                  rows={4}
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
        <SectionHeading>Línea sobre la foto</SectionHeading>
        <div>
          <FieldLabel htmlFor="hero-kicker">Texto pequeño (encima del manifiesto)</FieldLabel>
          <HelpText>
            Frase cortita de contexto (rubro, ciudad…) que se muestra antes del texto principal del
            inicio.
          </HelpText>
          <input
            id="hero-kicker"
            className={inputClass()}
            value={content.home.heroKicker}
            onChange={(e) =>
              setContent({
                ...content,
                home: { ...content.home, heroKicker: e.target.value },
              })
            }
          />
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading>Sección “Trabajos recientes”</SectionHeading>
        <div>
          <FieldLabel htmlFor="dest-kicker">Etiqueta pequeña (arriba del título)</FieldLabel>
          <input
            id="dest-kicker"
            className={inputClass()}
            value={content.home.destacadosKicker}
            onChange={(e) =>
              setContent({
                ...content,
                home: { ...content.home, destacadosKicker: e.target.value },
              })
            }
          />
        </div>
        <div>
          <FieldLabel htmlFor="dest-titulo">Título de la sección</FieldLabel>
          <input
            id="dest-titulo"
            className={inputClass()}
            value={content.home.destacadosTitulo}
            onChange={(e) =>
              setContent({
                ...content,
                home: { ...content.home, destacadosTitulo: e.target.value },
              })
            }
          />
        </div>
        <div>
          <FieldLabel htmlFor="dest-link">Texto del enlace a galería</FieldLabel>
          <input
            id="dest-link"
            className={inputClass()}
            value={content.home.destacadosLinkTexto}
            onChange={(e) =>
              setContent({
                ...content,
                home: { ...content.home, destacadosLinkTexto: e.target.value },
              })
            }
          />
        </div>
        <HomeDestacadosEditor content={content} setContent={setContent} />
      </section>

      <section className="space-y-4">
        <SectionHeading>Cierre de página (antes del pie)</SectionHeading>
        <div>
          <FieldLabel htmlFor="cierre-kicker">Etiqueta pequeña</FieldLabel>
          <input
            id="cierre-kicker"
            className={inputClass()}
            value={content.home.cierreKicker}
            onChange={(e) =>
              setContent({
                ...content,
                home: { ...content.home, cierreKicker: e.target.value },
              })
            }
          />
        </div>
        <div>
          <FieldLabel htmlFor="cierre-texto">Frase principal</FieldLabel>
          <textarea
            id="cierre-texto"
            className={inputClass()}
            rows={3}
            value={content.home.cierreTexto}
            onChange={(e) =>
              setContent({
                ...content,
                home: { ...content.home, cierreTexto: e.target.value },
              })
            }
          />
        </div>
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
