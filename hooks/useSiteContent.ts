"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase-client";
import {
  defaultSiteContent,
  normalizeBlog,
  normalizeHome,
  normalizeFeaturedOrder,
  normalizePortfolioCategories,
  normalizeSeriesProjects,
  normalizeStoreItems,
  normalizeSobreMi,
  type SiteContent,
} from "@/lib/site-content";

const CONTENT_DOC = "site/content";

/** Firestore no admite `undefined` en campos; JSON elimina esas claves. */
function cloneForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

/** Une Firestore parcial con defaults y migraciones (p. ej. párrafos ES/EN → idiomas). */
function mergeFromFirestore(partial: Partial<SiteContent>): SiteContent {
  const normalizedItems = normalizeFeaturedOrder(normalizeStoreItems(partial.tienda?.items));
  const cantidadRaw = partial.tienda?.destacadosCantidad;
  const destacadosCantidad = cantidadRaw === 4 || cantidadRaw === 6 ? cantidadRaw : 3;

  return {
    home: normalizeHome(partial.home),
    sobreMi: normalizeSobreMi(partial.sobreMi),
    blog: normalizeBlog(partial.blog),
    portfolio: {
      categories: normalizePortfolioCategories(partial.portfolio?.categories),
    },
    series: {
      projects: normalizeSeriesProjects(partial.series?.projects),
    },
    tienda: {
      ...defaultSiteContent.tienda,
      ...partial.tienda,
      destacadosCantidad,
      items: Array.isArray(partial.tienda?.items)
        ? normalizedItems
        : defaultSiteContent.tienda.items,
    },
  };
}

export function useSiteContent() {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isFirebaseConfigured || !db) {
        setLoading(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, CONTENT_DOC));
        if (!cancelled && snap.exists()) {
          setContent(
            mergeFromFirestore(snap.data() as Partial<SiteContent>)
          );
        }
      } catch {
        if (!cancelled) {
          setError("No se pudo cargar el contenido. Probá recargar la página.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function save(nextContent: SiteContent) {
    setContent(nextContent);

    if (!isFirebaseConfigured || !db) {
      return { ok: true, offline: true };
    }

    setSaving(true);
    setError(null);
    try {
      const payload = cloneForFirestore(nextContent);
      await setDoc(doc(db, CONTENT_DOC), payload, { merge: true });
      return { ok: true, offline: false };
    } catch (e) {
      const raw = e instanceof Error ? e.message : String(e);
      const hint =
        raw.includes("permission") || raw.includes("PERMISSION_DENIED")
          ? "Sin permiso para escribir en Firestore. Verificá que exista el documento admins/{tu uid} y las reglas publicadas."
          : raw.includes("undefined") || raw.includes("Unsupported field value")
            ? "Datos inválidos para Firestore (p. ej. campos vacíos). Recargá la página y probá de nuevo."
            : `No se pudo guardar: ${raw}`;
      setError(hint);
      return { ok: false, offline: false };
    } finally {
      setSaving(false);
    }
  }

  return {
    content,
    setContent,
    loading,
    saving,
    error,
    save,
    isFirebaseConfigured,
  };
}
