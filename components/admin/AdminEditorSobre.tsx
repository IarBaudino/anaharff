"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { newIntroduccionLangId, type SobreMiIdioma } from "@/lib/site-content";
import {
  FieldLabel,
  HelpText,
  inputClass,
  PanelTitle,
  SectionHeading,
} from "@/components/admin/admin-fields";

export function AdminEditorSobre() {
  const { content, setContent, save, saving, loading, error, isFirebaseConfigured } =
    useSiteContent();
  const [message, setMessage] = useState<string | null>(null);

  async function onSave() {
    if (!content.sobreMi.idiomas.length) {
      setMessage("Tenés que tener al menos un bloque de idioma.");
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

  const sm = content.sobreMi;

  function patchIdioma(id: string, patch: Partial<SobreMiIdioma>) {
    setContent({
      ...content,
      sobreMi: {
        ...sm,
        idiomas: sm.idiomas.map((b) => (b.id === id ? { ...b, ...patch } : b)),
      },
    });
  }

  function addIdioma() {
    setContent({
      ...content,
      sobreMi: {
        ...sm,
        idiomas: [
          ...sm.idiomas,
          {
            id: newIntroduccionLangId(),
            etiqueta: "",
            bio1: "",
            bio2: "",
            tituloSesion: "",
            sesionTexto: "",
          },
        ],
      },
    });
  }

  function removeIdioma(id: string) {
    if (sm.idiomas.length <= 1) return;
    setContent({
      ...content,
      sobreMi: {
        ...sm,
        idiomas: sm.idiomas.filter((b) => b.id !== id),
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
        <PanelTitle>Acerca de mí</PanelTitle>
        <HelpText>
          Corresponde a la página <strong>/sobre-mi</strong>. Podés repetir biografía y bloque de
          sesión en varios idiomas: en el sitio se muestran uno debajo del otro, en el mismo orden
          que acá.
        </HelpText>
      </div>

      <section className="space-y-4">
        <SectionHeading>Cabecera de la página</SectionHeading>
        <div>
          <FieldLabel htmlFor="sm-kicker">Etiqueta chica (columna izquierda)</FieldLabel>
          <HelpText>Rubro o palabra suelta arriba del título grande.</HelpText>
          <input
            id="sm-kicker"
            className={inputClass()}
            value={sm.kickerColumna}
            onChange={(e) =>
              setContent({
                ...content,
                sobreMi: { ...sm, kickerColumna: e.target.value },
              })
            }
          />
        </div>
        <div>
          <FieldLabel htmlFor="sm-titulo">Título grande de la página</FieldLabel>
          <input
            id="sm-titulo"
            className={inputClass()}
            value={sm.tituloPagina}
            onChange={(e) =>
              setContent({
                ...content,
                sobreMi: { ...sm, tituloPagina: e.target.value },
              })
            }
          />
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading>Contenido por idioma</SectionHeading>
        <HelpText>
          Mismo esquema que en la página principal: cada bloque es un idioma. Orden = orden en el
          sitio. La etiqueta es solo para encontrarlo en este panel.
        </HelpText>

        <div className="space-y-6">
          {sm.idiomas.map((bloque) => (
            <div
              key={bloque.id}
              className="rounded-lg border border-charcoal/15 bg-cream/80 p-4 shadow-sm"
            >
              {sm.idiomas.length > 1 && (
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
                onChange={(e) => patchIdioma(bloque.id, { etiqueta: e.target.value })}
                placeholder="Español, Inglés, …"
                aria-label="Nombre del bloque"
              />
              <textarea
                className={`${inputClass()} mt-3`}
                rows={5}
                value={bloque.bio1}
                onChange={(e) => patchIdioma(bloque.id, { bio1: e.target.value })}
                placeholder="Primer párrafo de la biografía"
                aria-label="Biografía párrafo 1"
              />
              <textarea
                className={`${inputClass()} mt-3`}
                rows={5}
                value={bloque.bio2}
                onChange={(e) => patchIdioma(bloque.id, { bio2: e.target.value })}
                placeholder="Segundo párrafo de la biografía"
                aria-label="Biografía párrafo 2"
              />
              <input
                className={`${inputClass()} mt-3`}
                value={bloque.tituloSesion}
                onChange={(e) => patchIdioma(bloque.id, { tituloSesion: e.target.value })}
                placeholder="Título del bloque sesiones (ej. Sesión de fotos)"
                aria-label="Título sesión"
              />
              <textarea
                className={`${inputClass()} mt-3`}
                rows={4}
                value={bloque.sesionTexto}
                onChange={(e) => patchIdioma(bloque.id, { sesionTexto: e.target.value })}
                placeholder="Texto sobre sesiones"
                aria-label="Texto sesión"
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
