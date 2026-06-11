"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import {
  ADMIN_SAVE_SUCCESS,
  AdminPanelNotice,
  adminNoticeVariant,
  useAdminPanelUi,
} from "@/components/admin/admin-panel-ui";
import { deleteStoredUrls } from "@/lib/storage-client";
import {
  newManagedItemId,
  type SiteContent,
  type StoreItem,
} from "@/lib/site-content";
import { StorageUploadField } from "@/components/admin/StorageUploadField";

function inputClass() {
  return "w-full border border-charcoal/20 bg-cream px-4 py-3 focus:border-charcoal focus:outline-none";
}

export function AdminProducts() {
  const { confirmDelete } = useAdminPanelUi();
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

  async function handleRemoveProduct(idx: number) {
    const row = content.tienda.items[idx];
    if (!row) return;
    const title = row.titulo?.trim() || "este producto";
    if (
      !(await confirmDelete({
        detail: `Vas a eliminar el producto «${title}».`,
        deletesStoredImages: true,
      }))
    ) {
      return;
    }

    const url = row.imagenUrl?.trim();
    if (url) {
      const { failed } = await deleteStoredUrls([url]);
      if (failed > 0) {
        setMessage(
          "Producto eliminado del panel, pero la imagen no se pudo borrar del almacenamiento."
        );
      }
    }

    const nextItems = content.tienda.items.filter((_, i) => i !== idx);
    setContent({
      ...content,
      tienda: { ...content.tienda, items: nextItems },
    });
  }

  async function onSave() {
    const res = await save(content);
    if (res.ok) {
      setMessage(
        res.offline
          ? "Cambios guardados (solo en este navegador)."
          : ADMIN_SAVE_SUCCESS
      );
      return;
    }
    setMessage("No se pudo guardar.");
  }

  if (loading) {
    return <p className="text-stone">Cargando productos...</p>;
  }

  const noticeVariant = adminNoticeVariant(message);

  return (
    <div className="space-y-8">
      {message && noticeVariant ? (
        <AdminPanelNotice variant={noticeVariant}>{message}</AdminPanelNotice>
      ) : null}
      {!isFirebaseConfigured && (
        <div className="border border-amber-500/30 bg-amber-100/50 p-4 text-sm text-amber-900">
          Podés editar aquí, pero los cambios <strong>no se publicarán</strong> en el sitio hasta que
          configures Firebase.
        </div>
      )}

      <section className="space-y-3">
        <h2 className="font-display text-2xl font-light text-charcoal">Tienda</h2>
        <p className="text-sm text-stone">
          Obras a la venta. Para mostrar fotos de galería en el inicio, usá{" "}
          <strong>Página principal → Trabajos recientes</strong>.
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
      </section>

      <div className="space-y-5">
        {content.tienda.items.map((item, idx) => (
          <div key={item.id} className="space-y-3 rounded-lg border border-charcoal/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-widest text-stone">Producto {idx + 1}</span>
              <button
                type="button"
                onClick={() => void handleRemoveProduct(idx)}
                className="inline-flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-xs text-red-800 hover:bg-red-50"
              >
                <Trash2 className="size-3.5" />
                Eliminar
              </button>
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
              <StorageUploadField
                folder="tienda"
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
