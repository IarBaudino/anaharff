import { getAdminDb } from "@/lib/firebase-admin";
import {
  defaultSiteContent,
  mergeSiteContentFromFirestore,
  type SiteContent,
} from "@/lib/site-content";

const CONTENT_DOC = "site/content";

/** Lee contenido de sitio en servidor (Firestore Admin) con fallback seguro. */
export async function getServerSiteContent(): Promise<SiteContent> {
  const db = getAdminDb();
  if (!db) return defaultSiteContent;

  try {
    const snap = await db.doc(CONTENT_DOC).get();
    if (!snap.exists) return defaultSiteContent;

    return mergeSiteContentFromFirestore(snap.data() as Partial<SiteContent>);
  } catch {
    return defaultSiteContent;
  }
}
