/**
 * Migra URLs de Cloudinary en Firestore (site/content) a Supabase Storage.
 *
 * Uso:
 *   node --env-file=.env.local scripts/migrate-cloudinary-to-supabase.cjs
 *   node --env-file=.env.local scripts/migrate-cloudinary-to-supabase.cjs --dry-run
 *
 * Requiere: FIREBASE_SERVICE_ACCOUNT_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

const admin = require("firebase-admin");
const { createClient } = require("@supabase/supabase-js");

const CONTENT_DOC = "site/content";
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "images";
const PREFIX = process.env.SUPABASE_STORAGE_PREFIX?.trim() || "anaharff";
const DRY_RUN = process.argv.includes("--dry-run");

function isCloudinary(url) {
  try {
    return new URL(url).hostname.endsWith("res.cloudinary.com");
  } catch {
    return false;
  }
}

function isSupabasePublic(url) {
  return url.includes(`/storage/v1/object/public/${BUCKET}/`);
}

function publicUrlFor(path) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
  const encoded = path
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/");
  return `${base}/storage/v1/object/public/${BUCKET}/${encoded}`;
}

function collectUrls(node, out = new Set()) {
  if (typeof node === "string") {
    const t = node.trim();
    if (t && (t.startsWith("http://") || t.startsWith("https://"))) out.add(t);
    return out;
  }
  if (Array.isArray(node)) {
    for (const item of node) collectUrls(item, out);
    return out;
  }
  if (node && typeof node === "object") {
    for (const value of Object.values(node)) collectUrls(value, out);
  }
  return out;
}

function replaceUrls(node, map) {
  if (typeof node === "string") {
    const t = node.trim();
    return map[t] ?? node;
  }
  if (Array.isArray(node)) return node.map((item) => replaceUrls(item, map));
  if (node && typeof node === "object") {
    const next = {};
    for (const [key, value] of Object.entries(node)) {
      next[key] = replaceUrls(value, map);
    }
    return next;
  }
  return node;
}

function guessExt(contentType, sourceUrl) {
  if (contentType?.includes("png")) return "png";
  if (contentType?.includes("webp")) return "webp";
  if (contentType?.includes("gif")) return "gif";
  if (contentType?.includes("avif")) return "avif";
  const m = sourceUrl.match(/\.([a-z0-9]+)(?:\?|$)/i);
  return m?.[1]?.toLowerCase() || "jpg";
}

function storagePathFor(sourceUrl) {
  const stamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 9);
  return `${PREFIX}/migrated/${stamp}-${rand}.jpg`;
}

async function main() {
  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!serviceAccountRaw) throw new Error("Falta FIREBASE_SERVICE_ACCOUNT_KEY");
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccountRaw)),
    });
  }

  const db = admin.firestore();
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const snap = await db.doc(CONTENT_DOC).get();
  if (!snap.exists) {
    console.log("No existe site/content en Firestore.");
    return;
  }

  const data = snap.data();
  const allUrls = [...collectUrls(data)];
  const cloudinaryUrls = allUrls.filter(isCloudinary);
  const alreadySupabase = allUrls.filter(isSupabasePublic);

  console.log(`URLs totales: ${allUrls.length}`);
  console.log(`Ya en Supabase: ${alreadySupabase.length}`);
  console.log(`Cloudinary a migrar: ${cloudinaryUrls.length}`);
  if (DRY_RUN) console.log("(modo dry-run: no se escribe nada)");

  const urlMap = {};

  for (const sourceUrl of cloudinaryUrls) {
    if (urlMap[sourceUrl]) continue;

    console.log(`\n→ ${sourceUrl}`);

    if (DRY_RUN) {
      urlMap[sourceUrl] = publicUrlFor(storagePathFor(sourceUrl));
      continue;
    }

    const res = await fetch(sourceUrl);
    if (!res.ok) {
      console.warn(`  ✗ No se pudo descargar (${res.status})`);
      continue;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const ext = guessExt(contentType, sourceUrl);
    const objectPath = storagePathFor(sourceUrl).replace(/\.jpg$/, `.${ext}`);

    const { error } = await supabase.storage.from(BUCKET).upload(objectPath, buffer, {
      contentType,
      upsert: false,
      cacheControl: "3600",
    });

    if (error) {
      console.warn(`  ✗ Error al subir: ${error.message}`);
      continue;
    }

    const publicUrl = publicUrlFor(objectPath);
    urlMap[sourceUrl] = publicUrl;
    console.log(`  ✓ ${publicUrl}`);
  }

  if (!Object.keys(urlMap).length) {
    console.log("\nNada que actualizar en Firestore.");
    return;
  }

  if (DRY_RUN) {
    console.log(`\nDry-run: se reemplazarían ${Object.keys(urlMap).length} URLs.`);
    return;
  }

  const updated = replaceUrls(data, urlMap);
  await db.doc(CONTENT_DOC).set(updated);
  console.log(`\nFirestore actualizado (${Object.keys(urlMap).length} URLs nuevas).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
