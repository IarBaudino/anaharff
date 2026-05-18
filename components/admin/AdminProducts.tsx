"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { deleteCloudinaryByUrl } from "@/lib/cloudinary-client";
import {
  newManagedItemId,
  normalizeFeaturedOrder,
  type SiteContent,
  type StoreItem,
} from "@/lib/site-content";
import { CloudinaryUploadField } from "@/components/admin/CloudinaryUploadField";

function inputClass() {
  return "w-full border border-charcoal/20 bg-cream px-4 py-3 focus:border-charcoal focus:outline-none";
}

export function AdminProducts() {
  const {
    content,
    setContent,
    save,
    saving,
    loading,
    error,
    isFirebaseConfigured,
    reload,
  } = useSiteContent();
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
        <h2 className="font-display text-2xl">Productos ({itemCount})</h2>
        <p className="text-sm text-stone">
          Un producto = una foto, título, descripción y precio. Para vender otra imagen, añadí otro
          producto. Lo que ves en la tienda pública sale de acá (Firestore, documento{" "}
          <code className="rounded bg-charcoal/5 px-1 text-[11px]">site/content</code>
          ).
        </p>
        {itemCount === 0 && !loading ? (
          <p className="rounded-lg border border-amber-200/80 bg-amber-50/80 p-3 text-sm text-amber-950">
            No hay productos cargados en el panel. Si en la web pública igual ves fotos en la tienda,
            puede ser un deploy viejo o datos guardados con otro formato: tocá{" "}
            <strong>Recargar desde la base</strong> abajo. Si siguen sin aparecer, revisá en Firebase
            la colección que el campo sea <code className="text-[11px]">tienda.items</code>.
          </p>
        ) : null}
        <input
          className={inputClass()}
          value={content.tienda.titulo}
          onChange={(e) =>
            setContent({
              ...content,
              tienda: { ...content.tienda, titulo: e.target.value },
            })
          }
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
        />
        <div className="rounded-lg border border-charcoal/10 bg-cream/60 p-4">
          <p className="text-sm font-medium text-charcoal">Trabajos recientes (inicio)</p>
          <p className="mt-1 text-xs text-stone">
            Marcá productos para destacarlos en la página de inicio y ordenalos.
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
            <span className="text-xs text-stone">Destacados: {featuredCount}</span>
          </div>
        </div>
      </section>

      <div className="space-y-5">
        {content.tienda.items.map((item, idx) => (
          <div key={item.id} className="space-y-3 rounded-lg border border-charcoal/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-widest text-stone">Producto {idx + 1}</span>
              <button
                type="button"
                onClick={() => removeProduct(content, setContent, idx)}
                className="inline-flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-xs text-red-800 hover:bg-red-50"
              >
                <Trash2 className="size-3.5" />
                Eliminar
              </button>
            </div>
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
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className={inputClass()}
                value={item.titulo}
                onChange={(e) => updateItem(content, setContent, idx, { titulo: e.target.value })}
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
              />
            </div>
            <textarea
              className={inputClass()}
              rows={2}
              value={item.descripcion}
              onChange={(e) =>
                updateItem(content, setContent, idx, { descripcion: e.target.value })
              }
            />
            <div className="rounded-lg border border-charcoal/10 bg-cream/70 p-3">
              <p className="text-xs uppercase tracking-widest text-stone">Foto del producto</p>
              <CloudinaryUploadField
                previewUrl={item.imagenUrl}
                onUploaded={(secureUrl) =>
                  updateItem(content, setContent, idx, { imagenUrl: secureUrl })
                }
                autoDeletePrevious
                disabled={saving}
              />
              {!item.imagenUrl?.trim() ? (
                <p className="mt-2 text-xs text-amber-900">
                  Sin foto válida: en la tienda se ve un recuadro vacío. Subí imagen o eliminá este
                  producto.
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => addProduct(content, setContent)}
        className="inline-flex items-center gap-2 rounded border border-charcoal/25 px-4 py-2 text-sm hover:bg-charcoal/5"
      >
        <Plus className="size-4" />
        Añadir producto
      </button>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="bg-charcoal px-8 py-3 text-sm uppercase tracking-widest text-cream transition-colors hover:bg-ink disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar productos"}
        </button>
        <button
          type="button"
          onClick={() => void reload()}
          disabled={saving || loading}
          className="rounded-full border border-charcoal/25 px-4 py-2 text-xs uppercase tracking-widest text-charcoal transition-colors hover:bg-charcoal/5 disabled:opacity-50"
        >
          Recargar desde la base
        </button>
        {message && <p className="text-sm text-charcoal/80">{message}</p>}
        {error && <p className="text-sm text-red-700">{error}</p>}
      </div>
    </div>
  );
}

function updateItem(
  content: SiteContent,
  setContent: ReturnType<typeof useSiteContent>["setContent"],
  idx: number,
  patch: Partial<StoreItem>
) {
  const nextItems = [...content.tienda.items];
  nextItems[idx] = { ...nextItems[idx], ...patch };
  setContent({
    ...content,
    tienda: { ...content.tienda, items: nextItems },
  });
}

function addProduct(
  content: SiteContent,
  setContent: ReturnType<typeof useSiteContent>["setContent"]
) {
  const nextItems = [
    ...content.tienda.items,
    {
      id: newManagedItemId("prod"),
      titulo: "Nuevo producto",
      descripcion: "",
      precio: 0,
      imagenUrl: "",
    },
  ];
  setContent({
    ...content,
    tienda: { ...content.tienda, items: nextItems },
  });
}

function removeProduct(
  content: SiteContent,
  setContent: ReturnType<typeof useSiteContent>["setContent"],
  idx: number
) {
  const row = content.tienda.items[idx];
  const url = row.imagenUrl?.trim();
  if (url) void deleteCloudinaryByUrl(url).catch(() => undefined);
  const nextItems = content.tienda.items.filter((_, i) => i !== idx);
  setContent({
    ...content,
    tienda: { ...content.tienda, items: normalizeFeaturedOrder(nextItems) },
  });
}

function toggleFeatured(
  content: SiteContent,
  setContent: ReturnType<typeof useSiteContent>["setContent"],
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
  setContent: ReturnType<typeof useSiteContent>["setContent"],
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
