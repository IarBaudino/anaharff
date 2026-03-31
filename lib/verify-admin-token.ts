import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export async function isAdminIdToken(idToken: string | null | undefined): Promise<boolean> {
  if (!idToken) return false;

  const auth = getAdminAuth();
  const db = getAdminDb();
  if (!auth || !db) return false;

  try {
    const decoded = await auth.verifyIdToken(idToken);
    const snap = await db.collection("admins").doc(decoded.uid).get();
    return snap.exists;
  } catch {
    return false;
  }
}
