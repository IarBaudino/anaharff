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
import {
  AdminField,
  AdminInput,
  AdminTextarea,
  HelpText,
  PanelTitle,
} from "@/components/admin/admin-fields";

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

      <section className="space-y-4">
        <PanelTitle>Tienda</PanelTitle>
        <HelpText>
          Impresiones a la venta en <strong>/tienda</strong>. El comprador debe tener cuenta y completar
          datos de envío en el carrito. Configurá los costos de envío abajo.
        </HelpText>
        <AdminInput
          id="tienda-titulo"
          label="Título de la página"
          hint="Encabezado grande que ve el visitante al entrar a la tienda."
          example="Tienda"
          value={content.tienda.titulo}
          onChange={(e) =>
            setContent({
              ...content,
              tienda: { ...content.tienda, titulo: e.target.value },
            })
          }
        />
        <AdminTextarea
          id="tienda-descripcion"
          label="Texto introductorio"
          hint="Párrafo breve debajo del título. Podés dejarlo vacío."
          example="Impresiones en edición limitada. Fotografía analógica en papel fine art."
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

      <section className="space-y-4 rounded-lg border border-charcoal/10 bg-cream/60 p-4">
        <p className="text-sm font-medium text-charcoal">Costos de envío (ARS)</p>
        <HelpText>
          Montos que se suman al carrito según la zona que elija el comprador. Podés poner{" "}
          <strong>0</strong> si el envío es sin cargo en esa zona.
        </HelpText>
        <div className="grid gap-3 md:grid-cols-3">
          <AdminInput
            label="CABA y GBA"
            hint="Buenos Aires ciudad y conurbano."
            example="0"
            type="number"
            min={0}
            value={content.tienda.envios.buenosAires}
            onChange={(e) =>
              setContent({
                ...content,
                tienda: {
                  ...content.tienda,
                  envios: {
                    ...content.tienda.envios,
                    buenosAires: Number(e.target.value) || 0,
                  },
                },
              })
            }
          />
          <AdminInput
            label="Resto de Argentina"
            hint="Provincias fuera de CABA y GBA."
            example="8000"
            type="number"
            min={0}
            value={content.tienda.envios.restoArgentina}
            onChange={(e) =>
              setContent({
                ...content,
                tienda: {
                  ...content.tienda,
                  envios: {
                    ...content.tienda.envios,
                    restoArgentina: Number(e.target.value) || 0,
                  },
                },
              })
            }
          />
          <AdminInput
            label="Internacional"
            hint="Envíos fuera de Argentina."
            example="25000"
            type="number"
            min={0}
            value={content.tienda.envios.internacional}
            onChange={(e) =>
              setContent({
                ...content,
                tienda: {
                  ...content.tienda,
                  envios: {
                    ...content.tienda.envios,
                    internacional: Number(e.target.value) || 0,
                  },
                },
              })
            }
          />
        </div>
      </section>

      <section className="space-y-4">
        <p className="text-sm font-medium text-charcoal">Productos (impresiones)</p>
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
              <AdminInput
                label="Nombre del producto"
                hint="Título en la tarjeta y en el checkout de Mercado Pago."
                example="Serie Única — impresión 30×40 cm"
                value={item.titulo}
                onChange={(e) => updateItem(content, setContent, idx, { titulo: e.target.value })}
              />
              <AdminInput
                label="Precio (ARS)"
                hint="Monto en pesos argentinos, sin puntos ni símbolo."
                example="45000"
                type="number"
                min={0}
                value={item.precio}
                onChange={(e) =>
                  updateItem(content, setContent, idx, {
                    precio: Number(e.target.value) || 0,
                  })
                }
              />
            </div>
            <AdminTextarea
              label="Descripción"
              hint="Detalle de la impresión: técnica, tamaño, papel, tirada, etc."
              example="Fotografía analógica 35mm, impresión fine art 30×40 cm en papel algodón."
              rows={2}
              value={item.descripcion}
              onChange={(e) =>
                updateItem(content, setContent, idx, { descripcion: e.target.value })
              }
            />
            <AdminField
              label="Foto del producto"
            >
              <div className="rounded-lg border border-charcoal/10 bg-cream/70 p-3">
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
            </AdminField>
          </div>
        ))}
      </section>

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
