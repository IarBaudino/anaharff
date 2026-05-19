"use client";

import { auth, isFirebaseConfigured } from "@/lib/firebase-client";

export async function deleteCloudinaryByUrl(url: string): Promise<{ ok: boolean; deleted: boolean }> {
  const trimmed = (url ?? "").trim();
  if (!trimmed || !isFirebaseConfigured || !auth?.currentUser) return { ok: false, deleted: false };

  const idToken = await auth.currentUser.getIdToken();
  if (!idToken) return { ok: false, deleted: false };

  const res = await fetch("/api/cloudinary/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ url: trimmed }),
  });

  if (!res.ok) return { ok: false, deleted: false };
  const data = (await res.json()) as { deleted?: boolean };
  return { ok: true, deleted: Boolean(data.deleted) };
}

/** Borra varias URLs en Cloudinary sin bloquear la UI (errores se ignoran). */
export function deleteCloudinaryUrlsInBackground(urls: string[]): void {
  const unique = [...new Set(urls.map((u) => u.trim()).filter(Boolean))];
  for (const url of unique) {
    void deleteCloudinaryByUrl(url).catch(() => undefined);
  }
}
