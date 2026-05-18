import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "@/lib/firebase-client";

/** Crea `customers/{uid}` solo si no existe (respeta reglas de Firestore). */
export async function ensureCustomerProfile(user: User): Promise<void> {
  if (!db || !user.uid || !user.email) return;

  const ref = doc(db, "customers", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  await setDoc(ref, {
    uid: user.uid,
    email: user.email,
    nombre: "",
    telefono: "",
    createdAt: serverTimestamp(),
    ordersCount: 0,
  });
}