"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { newIntroduccionLangId, type BlogEntrada } from "@/lib/site-content";
import { CloudinaryUploadField } from "@/components/admin/CloudinaryUploadField";
import {
  FieldLabel,
  HelpText,
  inputClass,
  PanelTitle,
  SectionHeading,
} from "@/components/admin/admin-fields";

function emptyEntrada(): BlogEntrada {
  return {
    id: newIntroduccionLangId(),
    titulo: "",
    fecha: "",
    cuerpo: "",
    imagenUrl: "",
  };
}

export function AdminEditorBlog() {
  const { content, setContent, save, saving, loading, error, isFirebaseConfigured } =
    useSiteContent();
  const [message, setMessage] = useState<string | null>(null);

  async function onSave() {
    const res = await save(content);
    if (res.ok) {
      setMessage(
        res.offline
          ? "Guardado local (sin Firebase configurado)."
          : "Guardado correctamente en Firebase."
      );
      return;
    }
    setMessage("No se pudo guardar.");
  }

  const blog = content.blog;

  function patchEntrada(id: string, patch: Partial<BlogEntrada>) {
    setContent({
      ...content,
      blog: {
        ...blog,
        entradas: blog.entradas.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      },
    });
  }

  function addEntrada() {
    setContent({
      ...content,
      blog: {
        ...blog,
        entradas: [...blog.entradas, emptyEntrada()],
      },
    });
  }

  function removeEntrada(id: string) {
    setContent({
      ...content,
      blog: {
        ...blog,
        entradas: blog.entradas.filter((e) => e.id !== id),
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
          Firebase no está configurado en entorno. Podés editar visualmente, pero no se
          persistirá en la nube hasta configurar variables.
        </div>
      )}

      <div>
        <PanelTitle>Blog</PanelTitle>
        <HelpText>
          <strong>Dónde están las entradas:</strong> acá mismo, en esta pestaña &quot;Blog&quot;
          del panel. Cada tarjeta de abajo es una entrada pública: título, fecha opcional, texto e
          imagen opcional (subida con el botón).
        </HelpText>
      </div>

      <section className="space-y-4">
        <SectionHeading>Cabecera de la página /blog</SectionHeading>
        <div>
          <FieldLabel htmlFor="blog-kicker">Etiqueta pequeña</FieldLabel>
          <input
            id="blog-kicker"
            className={inputClass()}
            value={blog.kicker}
            onChange={(e) =>
              setContent({
                ...content,
                blog: { ...blog, kicker: e.target.value },
              })
            }
          />
        </div>
        <div>
          <FieldLabel htmlFor="blog-titulo-pagina">Título grande de la página</FieldLabel>
          <input
            id="blog-titulo-pagina"
            className={inputClass()}
            value={blog.tituloPagina}
            onChange={(e) =>
              setContent({
                ...content,
                blog: { ...blog, tituloPagina: e.target.value },
              })
            }
          />
        </div>
        <div>
          <FieldLabel htmlFor="blog-intro">Texto introductorio (opcional)</FieldLabel>
          <HelpText>
            Aparece debajo del título y <strong>arriba</strong> de la lista de entradas. Podés
            dejarlo en blanco si solo querés mostrar posts.
          </HelpText>
          <textarea
            id="blog-intro"
            className={inputClass()}
            rows={5}
            value={blog.introduccion}
            onChange={(e) =>
              setContent({
                ...content,
                blog: { ...blog, introduccion: e.target.value },
              })
            }
          />
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeading>Entradas</SectionHeading>
        <HelpText>
          Orden en el sitio = orden de estas tarjetas. El visitante no ve entradas totalmente vacías.
        </HelpText>

        {blog.entradas.map((entrada, idx) => (
          <div
            key={entrada.id}
            className="space-y-3 rounded-lg border border-charcoal/15 bg-cream/60 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-widest text-stone">
                Entrada {idx + 1}
              </span>
              <button
                type="button"
                onClick={() => removeEntrada(entrada.id)}
                className="inline-flex items-center gap-1 text-xs text-stone hover:text-red-700"
              >
                <Trash2 className="size-3.5" />
                Eliminar entrada
              </button>
            </div>
            <input
              className={inputClass()}
              value={entrada.titulo}
              onChange={(e) => patchEntrada(entrada.id, { titulo: e.target.value })}
              placeholder="Título de la entrada"
            />
            <input
              className={inputClass()}
              value={entrada.fecha}
              onChange={(e) => patchEntrada(entrada.id, { fecha: e.target.value })}
              placeholder="Fecha opcional (ej. 2025-04-06)"
            />
            <div>
              <FieldLabel>Foto de la entrada (opcional)</FieldLabel>
              <HelpText className="!mt-0.5">
                Se muestra arriba del título en el sitio. Podés subirla desde acá o dejarla vacía.
              </HelpText>
              <CloudinaryUploadField
                onUploaded={(url) => patchEntrada(entrada.id, { imagenUrl: url })}
                disabled={saving}
              />
              {entrada.imagenUrl.trim() ? (
                <p className="mt-2 text-xs text-stone">
                  Imagen cargada. Volvé a subir si querés reemplazarla.
                </p>
              ) : null}
            </div>
            <textarea
              className={inputClass()}
              rows={6}
              value={entrada.cuerpo}
              onChange={(e) => patchEntrada(entrada.id, { cuerpo: e.target.value })}
              placeholder="Cuerpo del texto"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addEntrada}
          className="inline-flex items-center gap-2 border border-charcoal/20 px-4 py-2 text-sm text-charcoal transition-colors hover:border-charcoal/40"
        >
          <Plus className="size-4" />
          Nueva entrada
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
