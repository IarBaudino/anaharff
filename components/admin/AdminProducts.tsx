"use client";

import { useMemo, useState } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { type SiteContent } from "@/lib/site-content";
import { CloudinaryUploadField } from "@/components/admin/CloudinaryUploadField";

function inputClass() {
  return "w-full px-4 py-3 border border-charcoal/20 bg-cream focus:border-charcoal focus:outline-none";
}

export function AdminProducts() {
  const { content, setContent, save, saving, loading, error, isFirebaseConfigured } =
    useSiteContent();
  const [message, setMessage] = useState<string | null>(null);
  const itemCount = useMemo(() => content.tienda.items.length, [content.tienda.items.length]);

  async function onSave() {
    const res = await save(content);
    if (res.ok) {
      setMessage(
        res.offline
          ? "Guardado local (sin Firebase configurado)."
          : "Productos guardados en Firebase."
      );
      return;
    }
    setMessage("No se pudo guardar.");
  }

  if (loading) {
    return <p className="text-stone">Cargando productos...</p>;
  }

  return (
    <div className="space-y-8">
      {!isFirebaseConfigured && (
        <div className="border border-amber-500/30 bg-amber-100/50 p-4 text-sm text-amber-900">
          Firebase no está configurado en entorno. Podés editar visualmente, pero no se
          persistirá en la nube hasta configurar variables.
        </div>
      )}

      <section className="space-y-4">
        <h2 className="font-display text-2xl">Productos y fotos ({itemCount})</h2>
        <p className="text-sm text-stone">
          Acá cargás y editás los productos de la tienda. Podés subir la foto de cada producto
          desde su tarjeta.
        </p>
        <input
          className={inputClass()}
          value={content.tienda.titulo}
          onChange={(e) =>
            setContent({
              ...content,
              tienda: { ...content.tienda, titulo: e.target.value },
            })
          }
          placeholder="Título de sección tienda"
        />
        <textarea
          className={inputClass()}
          rows={3}
          value={content.tienda.descripcion}
          onChange={(e) =>
            setContent({
              ...content,
              tienda: { ...content.tienda, descripcion: e.target.value },
            })
          }
          placeholder="Descripción general de la tienda"
        />
      </section>

      <div className="space-y-5">
        {content.tienda.items.map((item, idx) => (
          <div key={item.id} className="border border-charcoal/10 p-4 space-y-3 rounded-lg">
            <div className="grid md:grid-cols-2 gap-3">
              <input
                className={inputClass()}
                value={item.titulo}
                onChange={(e) => updateItem(content, setContent, idx, { titulo: e.target.value })}
                placeholder="Título"
              />
              <input
                className={inputClass()}
                value={item.precio}
                type="number"
                onChange={(e) =>
                  updateItem(content, setContent, idx, {
                    precio: Number(e.target.value) || 0,
                  })
                }
                placeholder="Precio"
              />
            </div>
            <textarea
              className={inputClass()}
              rows={2}
              value={item.descripcion}
              onChange={(e) =>
                updateItem(content, setContent, idx, { descripcion: e.target.value })
              }
              placeholder="Descripción"
            />
            <input
              className={inputClass()}
              value={item.imagenUrl}
              onChange={(e) =>
                updateItem(content, setContent, idx, { imagenUrl: e.target.value })
              }
              placeholder="URL de la imagen (opcional si ya subiste con el botón)"
            />
            <CloudinaryUploadField
              onUploaded={(secureUrl) =>
                updateItem(content, setContent, idx, { imagenUrl: secureUrl })
              }
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="px-8 py-3 bg-charcoal text-cream text-sm tracking-widest uppercase hover:bg-ink transition-colors disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar productos"}
        </button>
        {message && <p className="text-sm text-charcoal/80">{message}</p>}
        {error && <p className="text-sm text-red-700">{error}</p>}
      </div>
    </div>
  );
}

function updateItem(
  content: SiteContent,
  // eslint-disable-next-line no-unused-vars
  setContent: (next: SiteContent) => void,
  idx: number,
  patch: Partial<SiteContent["tienda"]["items"][number]>
) {
  const nextItems = [...content.tienda.items];
  nextItems[idx] = { ...nextItems[idx], ...patch };
  setContent({
    ...content,
    tienda: { ...content.tienda, items: nextItems },
  });
}
