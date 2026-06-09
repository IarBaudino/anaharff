import { auth } from "@/lib/firebase-client";
import { isCloudinaryUrl } from "@/lib/storage-urls";

async function adminIdToken(): Promise<string | null> {
  if (!auth?.currentUser) return null;
  return auth.currentUser.getIdToken();
}

export async function deleteStoredImageByUrl(
  url: string
): Promise<{ ok: boolean; deleted: boolean; skipped: boolean }> {
  const trimmed = url.trim();
  if (!trimmed) return { ok: true, deleted: false, skipped: true };

  if (isCloudinaryUrl(trimmed)) {
    return { ok: true, deleted: false, skipped: true };
  }

  const idToken = await adminIdToken();
  if (!idToken) {
    return { ok: false, deleted: false, skipped: false };
  }

  const res = await fetch("/api/storage/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ url: trimmed }),
  });

  let data: { error?: string; deleted?: boolean; skipped?: boolean } = {};
  try {
    data = (await res.json()) as typeof data;
  } catch {
    return { ok: false, deleted: false, skipped: false };
  }

  if (!res.ok) {
    return { ok: false, deleted: false, skipped: false };
  }

  return {
    ok: true,
    deleted: Boolean(data.deleted),
    skipped: Boolean(data.skipped),
  };
}

export type DeleteStoredUrlsResult = {
  total: number;
  deleted: number;
  skipped: number;
  failed: number;
};

/** Borra varias URLs en Storage (espera a que terminen todas las peticiones). */
export async function deleteStoredUrls(
  urls: string[]
): Promise<DeleteStoredUrlsResult> {
  const unique = [...new Set(urls.map((u) => u.trim()).filter(Boolean))];
  let deleted = 0;
  let skipped = 0;
  let failed = 0;

  for (const url of unique) {
    try {
      const result = await deleteStoredImageByUrl(url);
      if (!result.ok) {
        failed += 1;
      } else if (result.skipped) {
        skipped += 1;
      } else if (result.deleted) {
        deleted += 1;
      }
    } catch {
      failed += 1;
    }
  }

  return { total: unique.length, deleted, skipped, failed };
}
