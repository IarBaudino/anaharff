# Backlog del sitio · Ana Harff

Lista exportable de pendientes y mejoras. Orden sugerido: **P0 → P1 → P2**.

## Leyenda de prioridades

| Prioridad | Significado |
|-----------|-------------|
| **P0** | Sin esto el producto puede mentir o fallar en lo esencial. |
| **P1** | Importante para uso real (cuenta, tienda, admin, calidad). |
| **P2** | Mejoras, legal, SEO, operación avanzada; no bloquean un lanzamiento mínimo. |

---

## P0 — Lo que el visitante cree que ya funciona

- [ ] **Contacto:** implementar envío real (`/api/contact` o similar) y conectar el formulario (hoy es simulado).
- [ ] **Contacto:** enviar email (p. ej. con **Resend** usando `RESEND_API_KEY`) y mostrar error claro si falla.
- [ ] **Contacto (recomendado):** límite simple anti-spam (rate limit o honeypot).

---

## P1 — Cuenta, tienda y admin

### Cuenta (`/cuenta`, ingreso, registro)

- [ ] **Recuperar contraseña** (flujo “olvidé mi contraseña” + email).
- [ ] **Cambiar email** (definir: flujo en app vs siempre manual por admin).
- [ ] **Perfil sin documento en Firestore:** flujo claro (“completar perfil”) si no existe `customers/{uid}`.
- [ ] **Compras como invitado:** decidir si vincular pedidos de otro email a la cuenta (y cómo).
- [ ] **Mis pedidos:** más detalle si hace falta (estado de envío, link a MP, comprobante, etc.).

### Tienda y pagos

- [ ] **Checkout:** reemplazar `alert()` por mensaje en pantalla (toast / banner).
- [ ] **Pruebas manuales / sandbox:** checklist Mercado Pago (OK, pendiente, error, webhook, pedido en Firestore, carrito tras pago).
- [ ] **Stock / límites** por obra (solo si el negocio lo necesita).

### Panel admin

- [ ] **Pedidos:** filtros o búsqueda (estado, email, fecha).
- [ ] **Pedidos:** export CSV si lo vas a usar operativamente.
- [ ] **Clientes:** acciones útiles (ver pedidos del cliente, notas, etc.).
- [ ] **Admins:** proceso documentado o pantalla para dar de alta admins (hoy manual + script `grant-admin`).

### Calidad del código

- [ ] **Tests mínimos** (p. ej. API de contacto + flujo crítico de checkout/carrito).
- [ ] **CI** (lint + `npm run build` en cada PR, p. ej. GitHub Actions).
- [ ] **Quitar o usar `next-auth`** (instalado pero no usado; login real = Firebase).

---

## P2 — Producto, legal, SEO, ops, pulido

### Sitio público y contenido

- [ ] Reemplazar textos **placeholder** / “Próximamente” del contenido por defecto (blog, etc.).
- [ ] **Tienda cerrada:** revisar copy y botones con `NEXT_PUBLIC_TIENDA_ENABLED=false`.
- [ ] Páginas **pendiente / error** de tienda: enlaces extra (carrito, contacto) si mejora UX.

### SEO

- [ ] **Sitemap:** sumar URLs que quieras indexar explícitamente.
- [ ] **Robots:** revisar allow/disallow para rutas nuevas (p. ej. carrito).

### Legal y analítica

- [ ] **Privacidad / términos** (páginas + enlaces en footer).
- [ ] Si agregás **analytics o pixels:** cookies + texto legal acorde.

### Operación

- [ ] Checklist de **variables de entorno** en producción vs `.env.example`.
- [ ] **Webhook Mercado Pago** verificado en prod y revisión de logs.
- [ ] **Reglas Firestore** desplegadas y alineadas con el modelo.
- [ ] **Backups** de Firestore (proceso manual o proveedor).

### UX técnica (opcional)

- [ ] `error.tsx` / `loading.tsx` en rutas clave.
- [ ] `middleware` (headers de seguridad, reglas extra) si aplica.
- [ ] **Monitor de errores** (p. ej. Sentry).
- [ ] **Accesibilidad** (foco, modales, formularios).
- [ ] **Rendimiento** (Lighthouse en home, tienda, portfolio).

---

## Vista rápida

```
P0  → Contacto real + email + anti-spam
P1  → Cuenta · Tienda/MP · Admin · Tests + CI + next-auth
P2  → Contenido · Legal · SEO · Ops · Pulido técnico
```

*Última actualización: checklist consolidada desde el análisis del repo.*
