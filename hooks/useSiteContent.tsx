"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase-client";
import {
  defaultSiteContent,
  mergeSiteContentFromFirestore,
  type SiteContent,
} from "@/lib/site-content";

const CONTENT_DOC = "site/content";

export type SiteContentContextValue = {
  content: SiteContent;
  setContent: Dispatch<SetStateAction<SiteContent>>;
  loading: boolean;
  saving: boolean;
  error: string | null;
  save: (nextContent: SiteContent) => Promise<{ ok: boolean; offline: boolean }>;
  isFirebaseConfigured: boolean;
  reload: () => Promise<void>;
};

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

/** Firestore no admite `undefined` en campos; JSON elimina esas claves. */
function cloneForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

function useSiteContentState(): SiteContentContextValue {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadFromFirestore() {
    if (!isFirebaseConfigured || !db) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const snap = await getDoc(doc(db, CONTENT_DOC));
      if (snap.exists()) {
        setContent(mergeSiteContentFromFirestore(snap.data() as Partial<SiteContent>));
      } else {
        setContent(defaultSiteContent);
      }
    } catch {
      setError("No se pudo cargar el contenido. Probá recargar la página.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadFromFirestore();
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
    reload: loadFromFirestore,
  };
}

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const value = useSiteContentState();
  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent(): SiteContentContextValue {
  const ctx = useContext(SiteContentContext);
  if (!ctx) {
    throw new Error("useSiteContent debe usarse dentro de <SiteContentProvider>.");
  }
  return ctx;
}
