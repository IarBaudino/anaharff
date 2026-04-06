"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import {
  isPlaceholderHeroUrl,
  newIntroduccionLangId,
  type IntroduccionIdioma,
} from "@/lib/site-content";
import { CloudinaryUploadField } from "@/components/admin/CloudinaryUploadField";
import {
  FieldLabel,
  HelpText,
  inputClass,
  PanelTitle,
  SectionHeading,
} from "@/components/admin/admin-fields";

export function AdminEditorHome() {
  const { content, setContent, save, saving, loading, error, isFirebaseConfigured } =
    useSiteContent();
  const [message, setMessage] = useState<string | null>(null);

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
        res.offline
          ? "Guardado solo en este navegador; aún no está en el sitio en vivo."
          : "Listo. Los cambios ya están publicados en el sitio."
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

  function removeIdioma(id: string) {
    if (content.home.introduccionIdiomas.length <= 1) return;
    setContent({
      ...content,
      home: {
        ...content.home,
        introduccionIdiomas: content.home.introduccionIdiomas.filter((b) => b.id !== id),
      },
    });
  }

  if (loading) {
    return <p className="text-stone">Cargando contenido...</p>;
  }

  return (
    <div className="space-y-10">
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
          Todo lo de esta pestaña se ve en el <strong>inicio del sitio</strong> (la portada con
          título grande, foto y textos al costado).
        </HelpText>
      </div>

      <section className="space-y-4">
        <SectionHeading>Título del sitio</SectionHeading>
        <div>
          <FieldLabel htmlFor="home-titulo">Nombre que se muestra como titular principal</FieldLabel>
          <HelpText>
            Aparece muy grande arriba de todo (junto a Instagram y el enlace a contacto) y en el
            encabezado del navegador si no definís otro. Suele ser tu nombre artístico en mayúsculas
            o el que prefieras.
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
          Estos párrafos van en la <strong>columna derecha</strong> del bloque principal, al lado de
          la foto. El orden es el del sitio: el primero como texto principal; los siguientes, más
          suaves (cursiva). Podés añadir otro bloque con el botón de abajo.
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
                    onClick={() => removeIdioma(bloque.id)}
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
          <strong>Obligatoria:</strong> la imagen grande que va a la izquierda del texto en
          computadora (formato vertical recomendado). Usá el botón para subirla desde tu
          computadora. No se puede guardar dejando solo la imagen de muestra.
        </HelpText>
        <CloudinaryUploadField
          previewUrl={content.home.heroImagenUrl}
          onUploaded={(secureUrl) =>
            setContent({
              ...content,
              home: { ...content.home, heroImagenUrl: secureUrl },
            })
          }
          disabled={saving}
        />
      </section>

      <section className="space-y-4">
        <SectionHeading>Línea sobre la foto</SectionHeading>
        <div>
          <FieldLabel htmlFor="hero-kicker">Texto pequeño encima de la foto</FieldLabel>
          <HelpText>
            Es la frase cortita que aparece arriba de la imagen (por ejemplo rubro y ciudad).
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
          <FieldLabel htmlFor="dest-link">Texto del enlace a la tienda</FieldLabel>
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
        {message && <p className="text-sm text-charcoal/80">{message}</p>}
        {error && <p className="text-sm text-red-700">{error}</p>}
      </div>
    </div>
  );
}
