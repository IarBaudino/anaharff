"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  Timestamp,
} from "firebase/firestore";
import { Package, Truck, User } from "lucide-react";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase-client";
import { useAuth } from "@/components/AuthProvider";
import { ensureCustomerProfile } from "@/lib/customer-profile";
import type { CustomerRecord, OrderRecord, OrderStatus } from "@/lib/commerce-types";
import { cn } from "@/lib/utils";
import { siteButtonOutline, siteButtonSolid } from "@/lib/site-buttons";
import { ShippingAddressForm } from "@/components/shipping/ShippingAddressForm";
import {
  emptyShippingAddress,
  normalizeShippingAddress,
  validateShippingAddress,
  type ShippingAddress,
} from "@/lib/shipping";
import { PasswordField } from "@/components/ui/PasswordField";

const tabs = [
  { id: "datos", label: "Mis datos", icon: User },
  { id: "envio", label: "Envío", icon: Truck },
  { id: "pedidos", label: "Mis pedidos", icon: Package },
] as const;

type TabId = (typeof tabs)[number]["id"];

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

function statusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case "aprobado":
    case "completado":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "en_preparacion":
      return "border-sky-200 bg-sky-50 text-sky-900";
    case "rechazado":
    case "cancelado":
      return "border-red-200 bg-red-50 text-red-900";
    default:
      return "border-amber-200 bg-amber-50 text-amber-900";
  }
}

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

export function CuentaDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabId>("datos");

  const [profileReady, setProfileReady] = useState(false);
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

  const [envio, setEnvio] = useState<ShippingAddress>(() => emptyShippingAddress());
  const [envioSaving, setEnvioSaving] = useState(false);
  const [envioMsg, setEnvioMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !db || !isFirebaseConfigured) {
      setProfile(null);
      setProfileReady(false);
      return;
    }

    const firestore = db;
    let unsub: (() => void) | undefined;

    void ensureCustomerProfile(user).finally(() => {
      const ref = doc(firestore, "customers", user.uid);
      unsub = onSnapshot(
        ref,
        (snap) => {
          if (!snap.exists()) {
            setProfile(null);
            setNombre("");
            setTelefono("");
          } else {
            const data = snap.data() as CustomerRecord;
            setProfile(data);
            setNombre(data.nombre ?? "");
            setTelefono(data.telefono ?? "");
            if (data.envio) {
              const normalized = normalizeShippingAddress(data.envio);
              if (normalized) setEnvio(normalized);
            }
          }
          setProfileReady(true);
        },
        () => {
          setProfile(null);
          setProfileReady(true);
        }
      );
    });

    return () => unsub?.();
  }, [user]);

  useEffect(() => {
    if (!user || !db || !isFirebaseConfigured) {
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
  }, [user]);

  useEffect(() => {
    if (!user || !db || !isFirebaseConfigured) {
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
  }, [user]);

  async function onSaveProfile(e: FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    if (!user || !db) return;
    setProfileSaving(true);
    try {
      const ref = doc(db, "customers", user.uid);
      const snap = await getDoc(ref);
      const nombreTrim = nombre.trim();
      const telefonoTrim = telefono.trim();

      if (!snap.exists()) {
        if (!user.email) {
          setProfileMsg("Tu cuenta no tiene email verificado; no se puede crear el perfil.");
          return;
        }
        await setDoc(ref, {
          uid: user.uid,
          email: user.email,
          nombre: nombreTrim,
          telefono: telefonoTrim,
          createdAt: serverTimestamp(),
          ordersCount: 0,
        });
      } else {
        await updateDoc(ref, {
          nombre: nombreTrim,
          telefono: telefonoTrim,
        });
      }
      setProfileMsg("Datos guardados.");
    } catch {
      setProfileMsg("No se pudieron guardar los datos.");
    } finally {
      setProfileSaving(false);
    }
  }

  async function onSaveEnvio(e: FormEvent) {
    e.preventDefault();
    setEnvioMsg(null);
    const err = validateShippingAddress(envio);
    if (err) {
      setEnvioMsg(err);
      return;
    }
    if (!user || !db) return;
    const normalized = normalizeShippingAddress(envio);
    if (!normalized) return;
    setEnvioSaving(true);
    try {
      const ref = doc(db, "customers", user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        if (!user.email) {
          setEnvioMsg("Tu cuenta no tiene email verificado.");
          return;
        }
        await setDoc(ref, {
          uid: user.uid,
          email: user.email,
          nombre: nombre.trim(),
          telefono: telefono.trim(),
          envio: normalized,
          createdAt: serverTimestamp(),
          ordersCount: 0,
        });
      } else {
        await updateDoc(ref, { envio: normalized });
      }
      setEnvioMsg("Dirección de envío guardada.");
    } catch {
      setEnvioMsg("No se pudo guardar la dirección.");
    } finally {
      setEnvioSaving(false);
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

  if (!user) return null;

  return (
    <div className="flex flex-col gap-10 lg:flex-row">
      <nav className="shrink-0 space-y-1 lg:w-56">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                active
                  ? "border-charcoal bg-charcoal text-cream"
                  : "border-charcoal/10 bg-cream text-charcoal hover:border-charcoal/25"
              )}
            >
              <Icon size={18} />
              {t.label}
              {t.id === "pedidos" && orders.length > 0 ? (
                <span
                  className={cn(
                    "ml-auto rounded-full px-2 py-0.5 text-[0.65rem] font-medium",
                    active ? "bg-cream/20 text-cream" : "bg-charcoal/10 text-charcoal"
                  )}
                >
                  {orders.length}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="min-w-0 flex-1">
        {tab === "datos" && (
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-2xl font-light text-charcoal">Mis datos</h2>
              <p className="mt-1 text-sm text-stone">
                Actualizá tu nombre y teléfono. El correo de la cuenta solo puede cambiarlo quien
                administra el sitio.
              </p>
            </div>

            <section className="space-y-4 rounded-lg border border-charcoal/10 bg-cream/70 p-5">
              <p className="text-xs uppercase tracking-widest text-stone">Cuenta</p>
              <p className="break-all text-sm text-charcoal">{user.email}</p>
            </section>

            <section className="space-y-4 rounded-lg border border-charcoal/10 bg-cream/70 p-5">
              <p className="text-xs uppercase tracking-widest text-stone">Datos personales</p>
              {!profileReady ? (
                <p className="text-sm text-stone">Cargando perfil…</p>
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
                  {!profile && profileReady ? (
                    <p className="text-xs text-stone">
                      Es la primera vez en tu cuenta: al guardar se crea tu perfil en el sitio.
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className={cn(siteButtonSolid, "w-full sm:w-auto")}
                  >
                    {profileSaving ? "Guardando…" : "Guardar datos"}
                  </button>
                  {profileMsg ? <p className="text-sm text-charcoal/80">{profileMsg}</p> : null}
                </form>
              )}
            </section>

            {user.email ? (
              <section className="space-y-4 rounded-lg border border-charcoal/10 bg-cream/70 p-5">
                <p className="text-xs uppercase tracking-widest text-stone">Contraseña</p>
                <form onSubmit={onChangePassword} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs tracking-widest" htmlFor="pass-old">
                      Contraseña actual
                    </label>
                    <PasswordField
                      id="pass-old"
                      value={passCurrent}
                      onChange={(e) => setPassCurrent(e.target.value)}
                      autoComplete="current-password"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs tracking-widest" htmlFor="pass-new">
                      Nueva contraseña
                    </label>
                    <PasswordField
                      id="pass-new"
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
                    <PasswordField
                      id="pass-confirm"
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
                  {passMsg ? <p className="text-sm text-charcoal/80">{passMsg}</p> : null}
                </form>
                <p className="text-xs text-stone">
                  <Link href="/cuenta/recuperar" className="text-accent underline underline-offset-2">
                    Olvidé mi contraseña
                  </Link>
                </p>
              </section>
            ) : null}
          </div>
        )}

        {tab === "envio" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-light text-charcoal">Datos de envío</h2>
              <p className="mt-1 text-sm text-stone">
                Guardá tu dirección para completar más rápido el carrito. Las compras son impresiones
                físicas que enviamos por correo.
              </p>
            </div>
            <section className="space-y-4 rounded-lg border border-charcoal/10 bg-cream/70 p-5">
              {!profileReady ? (
                <p className="text-sm text-stone">Cargando…</p>
              ) : (
                <form onSubmit={onSaveEnvio} className="space-y-4">
                  <ShippingAddressForm value={envio} onChange={setEnvio} />
                  <button
                    type="submit"
                    disabled={envioSaving}
                    className={cn(siteButtonSolid, "w-full sm:w-auto")}
                  >
                    {envioSaving ? "Guardando…" : "Guardar dirección"}
                  </button>
                  {envioMsg ? <p className="text-sm text-charcoal/80">{envioMsg}</p> : null}
                </form>
              )}
            </section>
          </div>
        )}

        {tab === "pedidos" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-light text-charcoal">Mis pedidos</h2>
              <p className="mt-1 text-sm text-stone">
                Estado de tus compras en la tienda. Si pagaste como invitado con otro email, puede que
                no aparezcan acá.
              </p>
            </div>

            {ordersLoading ? (
              <p className="text-sm text-stone">Cargando pedidos…</p>
            ) : orders.length === 0 ? (
              <div className="rounded-lg border border-charcoal/10 bg-cream/70 p-8 text-center">
                <p className="text-sm text-charcoal/80">Todavía no tenés pedidos asociados a esta cuenta.</p>
                <Link
                  href="/tienda"
                  className={cn(siteButtonOutline, "mt-5 inline-flex")}
                >
                  Ir a la tienda
                </Link>
              </div>
            ) : (
              <ul className="space-y-4">
                {orders.map((o) => (
                  <li
                    key={o.id}
                    className="rounded-lg border border-charcoal/10 bg-cream/80 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-stone">{formatDate(o.createdAt)}</p>
                        <p className="mt-1 text-xs text-stone">Pedido #{o.id.slice(0, 8)}…</p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide",
                          statusBadgeClass(o.status)
                        )}
                      >
                        {statusLabels[o.status] ?? o.status}
                      </span>
                    </div>
                    <p className="mt-3 text-lg font-medium text-charcoal">
                      ${Number(o.total).toLocaleString("es-AR")}{" "}
                      <span className="text-sm font-normal text-stone">{o.currency_id}</span>
                    </p>
                    <ul className="mt-4 space-y-2 border-t border-charcoal/10 pt-4 text-sm text-charcoal/90">
                      {o.items.map((it, idx) => (
                        <li key={`${o.id}-${it.id}-${idx}`} className="flex justify-between gap-4">
                          <span>
                            {it.title} ×{it.quantity}
                          </span>
                          <span className="shrink-0 text-stone">
                            ${(it.unit_price * it.quantity).toLocaleString("es-AR")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
