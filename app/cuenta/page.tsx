"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
} from "firebase/auth";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  Timestamp,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase-client";
import { useAuth } from "@/components/AuthProvider";
import type { CustomerRecord, OrderRecord, OrderStatus } from "@/lib/commerce-types";
import { cn } from "@/lib/utils";
import { siteButtonGhost, siteButtonOutline, siteButtonSolid } from "@/lib/site-buttons";

function inputClass() {
  return "w-full rounded-xl border border-charcoal/20 bg-cream px-4 py-3 focus:border-charcoal focus:outline-none";
}

const statusLabels: Record<OrderStatus, string> = {
  pendiente: "Pendiente",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
  en_preparacion: "En preparación",
  completado: "Completado",
  cancelado: "Cancelado",
};

function formatDate(d: unknown) {
  if (!d) return "—";
  if (d instanceof Timestamp) return d.toDate().toLocaleString("es-AR");
  if (d instanceof Date) return d.toLocaleString("es-AR");
  return String(d);
}

function mergeOrderLists(
  byUid: (OrderRecord & { id: string })[],
  byEmail: (OrderRecord & { id: string })[]
): (OrderRecord & { id: string })[] {
  const m = new Map<string, OrderRecord & { id: string }>();
  for (const o of byUid) m.set(o.id, o);
  for (const o of byEmail) m.set(o.id, o);
  return Array.from(m.values()).sort((a, b) => {
    const ta = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
    const tb = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
    return tb - ta;
  });
}

export default function CuentaPage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<CustomerRecord | null>(null);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  const [ordersUid, setOrdersUid] = useState<(OrderRecord & { id: string })[]>([]);
  const [ordersEmail, setOrdersEmail] = useState<(OrderRecord & { id: string })[]>([]);
  const [uidLoading, setUidLoading] = useState(true);
  const [emailLoading, setEmailLoading] = useState(true);

  const orders = useMemo(
    () => mergeOrderLists(ordersUid, ordersEmail),
    [ordersUid, ordersEmail]
  );
  const ordersLoading = uidLoading || emailLoading;

  const [passCurrent, setPassCurrent] = useState("");
  const [passNew, setPassNew] = useState("");
  const [passConfirm, setPassConfirm] = useState("");
  const [passSaving, setPassSaving] = useState(false);
  const [passMsg, setPassMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !user || !db || !isFirebaseConfigured) {
      setProfile(null);
      return;
    }

    const ref = doc(db, "customers", user.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setProfile(null);
          setNombre("");
          setTelefono("");
          return;
        }
        const data = snap.data() as CustomerRecord;
        setProfile(data);
        setNombre(data.nombre ?? "");
        setTelefono(data.telefono ?? "");
      },
      () => setProfile(null)
    );
    return () => unsub();
  }, [ready, user]);

  useEffect(() => {
    if (!ready || !user || !db || !isFirebaseConfigured) {
      setOrdersUid([]);
      setUidLoading(false);
      return;
    }

    setUidLoading(true);
    const qUid = query(
      collection(db, "orders"),
      where("customerUid", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(40)
    );

    const unsub = onSnapshot(
      qUid,
      (snap) => {
        setOrdersUid(snap.docs.map((d) => ({ id: d.id, ...(d.data() as OrderRecord) })));
        setUidLoading(false);
      },
      () => {
        setOrdersUid([]);
        setUidLoading(false);
      }
    );

    return () => unsub();
  }, [ready, user]);

  useEffect(() => {
    if (!ready || !user || !db || !isFirebaseConfigured) {
      setOrdersEmail([]);
      setEmailLoading(false);
      return;
    }

    const email = user.email?.trim();
    if (!email) {
      setOrdersEmail([]);
      setEmailLoading(false);
      return;
    }

    setEmailLoading(true);
    const qEmail = query(
      collection(db, "orders"),
      where("customerEmail", "==", email),
      orderBy("createdAt", "desc"),
      limit(40)
    );

    const unsub = onSnapshot(
      qEmail,
      (snap) => {
        setOrdersEmail(snap.docs.map((d) => ({ id: d.id, ...(d.data() as OrderRecord) })));
        setEmailLoading(false);
      },
      () => {
        setOrdersEmail([]);
        setEmailLoading(false);
      }
    );

    return () => unsub();
  }, [ready, user]);

  async function onSaveProfile(e: FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    if (!user || !db) return;
    setProfileSaving(true);
    try {
      await updateDoc(doc(db, "customers", user.uid), {
        nombre: nombre.trim(),
        telefono: telefono.trim(),
      });
      setProfileMsg("Datos guardados.");
    } catch {
      setProfileMsg("No se pudieron guardar los datos.");
    } finally {
      setProfileSaving(false);
    }
  }

  async function onChangePassword(e: FormEvent) {
    e.preventDefault();
    setPassMsg(null);
    if (!auth || !user?.email) return;
    if (passNew.length < 6) {
      setPassMsg("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (passNew !== passConfirm) {
      setPassMsg("Las contraseñas nuevas no coinciden.");
      return;
    }
    setPassSaving(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, passCurrent);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, passNew);
      setPassCurrent("");
      setPassNew("");
      setPassConfirm("");
      setPassMsg("Contraseña actualizada.");
    } catch {
      setPassMsg("No se pudo cambiar la contraseña. Revisá la contraseña actual.");
    } finally {
      setPassSaving(false);
    }
  }

  const showPasswordForm = useMemo(() => Boolean(user?.email), [user?.email]);

  if (!ready) {
    return (
      <div className="pt-20 text-center text-stone md:pt-32">Cargando…</div>
    );
  }

  if (!isFirebaseConfigured || !user) {
    return (
      <div className="mx-auto max-w-md space-y-6 px-4 pb-20 pt-6 text-center md:pt-24">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-light"
        >
          Mi cuenta
        </motion.h1>
        <p className="text-sm text-stone">
          Iniciá sesión para ver tus pedidos y editar tus datos.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/cuenta/ingresar" className={siteButtonSolid}>
            Iniciar sesión
          </Link>
          <Link href="/cuenta/registro" className={siteButtonOutline}>
            Registrarse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-12 px-4 pb-20 pt-6 md:pt-24">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mb-2 font-display text-3xl font-light">Mi cuenta</h1>
        <p className="break-all text-sm text-stone">{user.email}</p>
        <p className="mt-2 text-xs text-stone">
          El panel de administración no está disponible desde esta cuenta; solo podés gestionar tu
          perfil y tus compras.
        </p>
      </motion.div>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-light text-charcoal">Datos personales</h2>
        {!profile ? (
          <p className="text-sm text-stone">
            No hay perfil en la base de datos todavía. Si acabás de registrarte, recargá la página en
            unos segundos.
          </p>
        ) : (
          <form onSubmit={onSaveProfile} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs tracking-widest" htmlFor="cuenta-nombre">
                Nombre
              </label>
              <input
                id="cuenta-nombre"
                className={inputClass()}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-xs tracking-widest" htmlFor="cuenta-tel">
                Teléfono
              </label>
              <input
                id="cuenta-tel"
                className={inputClass()}
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>
            <p className="text-xs text-stone">
              El email se cambia desde Firebase Authentication (contactá soporte técnico si lo
              necesitás).
            </p>
            <button
              type="submit"
              disabled={profileSaving}
              className={cn(siteButtonSolid, "w-full sm:w-auto")}
            >
              {profileSaving ? "Guardando…" : "Guardar datos"}
            </button>
            {profileMsg && <p className="text-sm text-charcoal/80">{profileMsg}</p>}
          </form>
        )}
      </section>

      {showPasswordForm && (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-light text-charcoal">Contraseña</h2>
          <form onSubmit={onChangePassword} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs tracking-widest" htmlFor="pass-old">
                Contraseña actual
              </label>
              <input
                id="pass-old"
                type="password"
                className={inputClass()}
                value={passCurrent}
                onChange={(e) => setPassCurrent(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs tracking-widest" htmlFor="pass-new">
                Nueva contraseña
              </label>
              <input
                id="pass-new"
                type="password"
                className={inputClass()}
                value={passNew}
                onChange={(e) => setPassNew(e.target.value)}
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs tracking-widest" htmlFor="pass-confirm">
                Repetir nueva contraseña
              </label>
              <input
                id="pass-confirm"
                type="password"
                className={inputClass()}
                value={passConfirm}
                onChange={(e) => setPassConfirm(e.target.value)}
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <button
              type="submit"
              disabled={passSaving}
              className={cn(siteButtonOutline, "w-full sm:w-auto")}
            >
              {passSaving ? "Actualizando…" : "Cambiar contraseña"}
            </button>
            {passMsg && <p className="text-sm text-charcoal/80">{passMsg}</p>}
          </form>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="font-display text-xl font-light text-charcoal">Mis compras</h2>
        {ordersLoading ? (
          <p className="text-sm text-stone">Cargando pedidos…</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-stone">
            Todavía no hay pedidos asociados. Si compraste como invitado con otro email, es posible
            que no aparezcan aquí.
          </p>
        ) : (
          <ul className="space-y-4 border-t border-charcoal/10 pt-4">
            {orders.map((o) => (
              <li
                key={o.id}
                className="rounded-lg border border-charcoal/10 bg-cream/80 p-4 text-sm"
              >
                <p className="text-xs text-stone">{formatDate(o.createdAt)}</p>
                <p className="mt-1 font-medium text-charcoal">
                  {statusLabels[o.status] ?? o.status}
                </p>
                <p className="mt-2 text-charcoal/90">
                  Total: ${Number(o.total).toLocaleString("es-AR")} {o.currency_id}
                </p>
                <ul className="mt-3 space-y-1 text-stone">
                  {o.items.map((it, idx) => (
                    <li key={`${o.id}-${it.id}-${idx}`}>
                      {it.title} ×{it.quantity}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="space-y-3">
        <Link href="/tienda" className={cn(siteButtonGhost, "flex w-full justify-center")}>
          Ir a la tienda
        </Link>
        <button
          type="button"
          onClick={async () => {
            if (auth) await signOut(auth);
            router.replace("/");
            router.refresh();
          }}
          className={cn(siteButtonSolid, "w-full")}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
