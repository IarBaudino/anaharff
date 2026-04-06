/**
 * Crea/actualiza el documento Firestore admins/{uid} para un usuario que ya existe en Firebase Auth.
 *
 * Requisito: variable de entorno FIREBASE_SERVICE_ACCOUNT_KEY (misma que en el servidor).
 *
 * Uso:
 *   node scripts/grant-admin-by-email.cjs anaharff@gmail.com
 */

const { cert, getApps, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const email = process.argv[2];
if (!email || !email.includes("@")) {
  console.error("Uso: node scripts/grant-admin-by-email.cjs <email>");
  process.exit(1);
}

const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!raw) {
  console.error("Falta FIREBASE_SERVICE_ACCOUNT_KEY en el entorno.");
  process.exit(1);
}

let parsed;
try {
  parsed = JSON.parse(raw);
} catch {
  console.error("FIREBASE_SERVICE_ACCOUNT_KEY no es JSON válido.");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key?.replace(/\\n/g, "\n"),
    }),
  });
}

async function main() {
  const auth = getAuth();
  const user = await auth.getUserByEmail(email);
  const db = getFirestore();
  await db.collection("admins").doc(user.uid).set(
    {
      email: user.email || email,
      grantedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  console.log("Admin otorgado.");
  console.log("  Email:", user.email);
  console.log("  UID:  ", user.uid);
  console.log('  Documento: admins/' + user.uid);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
