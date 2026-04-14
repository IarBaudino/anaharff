"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { normalizeFeaturedOrder, type SiteContent } from "@/lib/site-content";
import { CloudinaryUploadField } from "@/components/admin/CloudinaryUploadField";

function inputClass() {
  return "w-full px-4 py-3 border border-charcoal/20 bg-cream focus:border-charcoal focus:outline-none";
}

export function AdminProducts() {
  const { content, setContent, save, saving, loading, error, isFirebaseConfigured } =
    useSiteContent();
  const [message, setMessage] = useState<string | null>(null);
  const itemCount = useMemo(() => content.tienda.items.length, [content.tienda.items.length]);
  const featuredCount = useMemo(
    () => content.tienda.items.filter((it) => it.destacarEnInicio).length,
    [content.tienda.items]
  );

  async function onSave() {
    const res = await save(content);
    if (res.ok) {
      setMessage(
        res.offline
          ? "Guardado solo en este navegador; aún no está en el sitio en vivo."
          : "Productos guardados. Deberían verse ya en la tienda."
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
          Podés editar aquí, pero los cambios <strong>no se publicarán</strong> en el sitio hasta que
          esté todo conectado. Si ves este aviso en la web ya publicada, contactá a quien te dio
          acceso.
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
        <div className="rounded-lg border border-charcoal/10 bg-cream/60 p-4">
          <p className="text-sm font-medium text-charcoal">Trabajos recientes (inicio)</p>
          <p className="mt-1 text-xs text-stone">
            Podés destacar productos puntuales, ordenarlos y definir cuántas cards mostrar.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label htmlFor="destacados-cantidad" className="text-sm text-charcoal/90">
              Cantidad visible:
            </label>
            <select
              id="destacados-cantidad"
              className={inputClass()}
              value={content.tienda.destacadosCantidad ?? 3}
              onChange={(e) =>
                setContent({
                  ...content,
                  tienda: {
                    ...content.tienda,
                    destacadosCantidad: Number(e.target.value) as 3 | 4 | 6,
                  },
                })
              }
            >
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={6}>6</option>
            </select>
            <span className="text-xs text-stone">
              Marcados actualmente: {featuredCount} (si faltan, se completan automáticamente).
            </span>
          </div>
        </div>
      </section>

      <div className="space-y-5">
        {content.tienda.items.map((item, idx) => (
          <div key={item.id} className="border border-charcoal/10 p-4 space-y-3 rounded-lg">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-charcoal/10 bg-cream/70 p-3">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={Boolean(item.destacarEnInicio)}
                  onChange={(e) =>
                    toggleFeatured(content, setContent, idx, e.target.checked)
                  }
                />
                Destacar en inicio
              </label>
              {item.destacarEnInicio ? (
                <div className="flex items-center gap-2">
                  <span className="rounded border border-charcoal/20 px-2 py-1 text-xs text-charcoal/80">
                    Orden {item.destacadoOrden ?? "—"}
                  </span>
                  <button
                    type="button"
                    className="inline-flex size-8 items-center justify-center rounded border border-charcoal/15 text-charcoal/80 transition-colors hover:bg-charcoal/5 disabled:opacity-40"
                    onClick={() => moveFeatured(content, setContent, item.id, -1)}
                    disabled={(item.destacadoOrden ?? 1) <= 1}
                    aria-label="Subir destacado"
                    title="Subir destacado"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex size-8 items-center justify-center rounded border border-charcoal/15 text-charcoal/80 transition-colors hover:bg-charcoal/5 disabled:opacity-40"
                    onClick={() => moveFeatured(content, setContent, item.id, 1)}
                    disabled={(item.destacadoOrden ?? 1) >= featuredCount}
                    aria-label="Bajar destacado"
                    title="Bajar destacado"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                </div>
              ) : (
                <span className="text-xs text-stone">No destacado</span>
              )}
            </div>
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
              previewUrl={item.imagenUrl}
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

function toggleFeatured(
  content: SiteContent,
  // eslint-disable-next-line no-unused-vars
  setContent: (next: SiteContent) => void,
  idx: number,
  nextValue: boolean
) {
  const nextItems = [...content.tienda.items];
  nextItems[idx] = {
    ...nextItems[idx],
    destacarEnInicio: nextValue,
    destacadoOrden: nextValue ? Number.MAX_SAFE_INTEGER : undefined,
  };

  setContent({
    ...content,
    tienda: { ...content.tienda, items: normalizeFeaturedOrder(nextItems) },
  });
}

function moveFeatured(
  content: SiteContent,
  // eslint-disable-next-line no-unused-vars
  setContent: (next: SiteContent) => void,
  itemId: string,
  direction: -1 | 1
) {
  const featured = content.tienda.items
    .filter((it) => it.destacarEnInicio)
    .sort((a, b) => (a.destacadoOrden ?? Number.MAX_SAFE_INTEGER) - (b.destacadoOrden ?? Number.MAX_SAFE_INTEGER));
  const from = featured.findIndex((it) => it.id === itemId);
  if (from < 0) return;
  const to = from + direction;
  if (to < 0 || to >= featured.length) return;
  const swapped = [...featured];
  [swapped[from], swapped[to]] = [swapped[to], swapped[from]];
  const orderMap = new Map(swapped.map((it, i) => [it.id, i + 1]));

  const nextItems = content.tienda.items.map((it) =>
    it.destacarEnInicio ? { ...it, destacadoOrden: orderMap.get(it.id) ?? it.destacadoOrden } : it
  );
  setContent({
    ...content,
    tienda: { ...content.tienda, items: nextItems },
  });
}
