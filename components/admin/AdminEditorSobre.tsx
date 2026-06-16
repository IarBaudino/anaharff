"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  ADMIN_SAVE_SUCCESS,
  AdminPanelNotice,
  adminNoticeVariant,
  useAdminPanelUi,
} from "@/components/admin/admin-panel-ui";
import { useSiteContent } from "@/hooks/useSiteContent";
import { newIntroduccionLangId, type SobreMiIdioma } from "@/lib/site-content";
import { AdminCurriculoEditor } from "@/components/admin/AdminCurriculoEditor";
import {
  AdminInput,
  AdminTextarea,
  HelpText,
  PanelTitle,
  SectionHeading,
} from "@/components/admin/admin-fields";

export function AdminEditorSobre() {
  const { confirmDelete } = useAdminPanelUi();
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
        res.offline ? "Cambios guardados (solo en este navegador)." : ADMIN_SAVE_SUCCESS
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

  async function removeIdioma(id: string) {
    if (sm.idiomas.length <= 1) return;
    const bloque = sm.idiomas.find((b) => b.id === id);
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
      sobreMi: {
        ...sm,
        idiomas: sm.idiomas.filter((b) => b.id !== id),
      },
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
        <PanelTitle>Acerca de mí</PanelTitle>
        <HelpText>
          Corresponde a la página <strong>/sobre-mi</strong>. Podés repetir biografía y bloque de
          sesión en varios idiomas: en el sitio se muestran uno debajo del otro, en el mismo orden
          que acá.
        </HelpText>
      </div>

      <section className="space-y-4">
        <SectionHeading>Cabecera de la página</SectionHeading>
        <AdminInput
          id="sm-kicker"
          label="Etiqueta chica (columna izquierda)"
          hint="Rubro o palabra suelta arriba del título grande en /sobre-mi."
          example="Fotografía"
          value={sm.kickerColumna}
          onChange={(e) =>
            setContent({
              ...content,
              sobreMi: { ...sm, kickerColumna: e.target.value },
            })
          }
        />
        <AdminInput
          id="sm-titulo"
          label="Título grande de la página"
          hint="Encabezado principal de la biografía."
          example="Sobre mí"
          value={sm.tituloPagina}
          onChange={(e) =>
            setContent({
              ...content,
              sobreMi: { ...sm, tituloPagina: e.target.value },
            })
          }
        />
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
                onChange={(e) => patchIdioma(bloque.id, { etiqueta: e.target.value })}
              />
              <AdminTextarea
                label="Biografía — primer párrafo"
                hint="Texto principal del bloque en este idioma."
                example="Soy fotógrafa basada en Buenos Aires…"
                rows={5}
                className="mt-3"
                value={bloque.bio1}
                onChange={(e) => patchIdioma(bloque.id, { bio1: e.target.value })}
              />
              <AdminTextarea
                label="Biografía — segundo párrafo"
                hint="Continuación opcional. Podés dejarlo vacío."
                example="Mi trabajo explora la intimidad y la luz natural."
                rows={5}
                className="mt-3"
                value={bloque.bio2}
                onChange={(e) => patchIdioma(bloque.id, { bio2: e.target.value })}
              />
              <AdminInput
                label="Título del bloque «sesiones»"
                hint="Encabezado de la sección sobre sesiones de fotos en este idioma."
                example="Sesión de fotos"
                className="mt-3"
                value={bloque.tituloSesion}
                onChange={(e) => patchIdioma(bloque.id, { tituloSesion: e.target.value })}
              />
              <AdminTextarea
                label="Texto sobre sesiones"
                hint="Información de contacto, tipos de sesión, duración, etc."
                example="Ofrezco sesiones en estudio y exteriores. Escribime para coordinar."
                rows={4}
                className="mt-3"
                value={bloque.sesionTexto}
                onChange={(e) => patchIdioma(bloque.id, { sesionTexto: e.target.value })}
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

      <AdminCurriculoEditor
        sobreMi={sm}
        onChange={(nextSobreMi) =>
          setContent({
            ...content,
            sobreMi: nextSobreMi,
          })
        }
      />

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
