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

export type DeleteCloudinaryUrlsResult = {
  total: number;
  deleted: number;
  failed: number;
};

/** Borra varias URLs en Cloudinary (espera a que terminen todas las peticiones). */
export async function deleteCloudinaryUrls(
  urls: string[]
): Promise<DeleteCloudinaryUrlsResult> {
  const unique = [...new Set(urls.map((u) => u.trim()).filter(Boolean))];
  let deleted = 0;
  let failed = 0;

  for (const url of unique) {
    try {
      const result = await deleteCloudinaryByUrl(url);
      if (result.deleted) deleted++;
      else failed++;
    } catch {
      failed++;
    }
  }

  return { total: unique.length, deleted, failed };
}
