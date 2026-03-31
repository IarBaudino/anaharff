# Ana Harff | Fotografía Analógica

Sitio web de portfolio y tienda para Ana Harff, fotógrafa analógica de Buenos Aires. Next.js 15, Tailwind CSS, Firebase (contenido, clientes, pedidos) y MercadoPago.

## Estructura

- **Home** – Hero editable desde el panel
- **Sobre mí** – Textos editables
- **Portfolio** / **Series** / **Blog**
- **Tienda** – MercadoPago + registro de pedidos en Firestore
- **Cuenta** – Registro e ingreso de clientes (Firebase Auth)
- **Admin** (`/admin`) – Contenido, pedidos y clientes

## Configuración rápida

1. Copiar `.env.example` a `.env.local`
2. `npm install` y `npm run dev`
3. En Vercel: mismas variables de entorno que en local

## Firebase

Variables `NEXT_PUBLIC_FIREBASE_*` según tu proyecto en la consola de Firebase.

**Firestore:** desplegar reglas desde `firestore.rules` (Firebase Console → Firestore → Reglas).

**Admin del panel:** creá un usuario en Authentication (email/contraseña). Copiá su **UID** y en Firestore creá el documento `admins/{UID}` con por ejemplo:

```json
{ "role": "admin", "email": "tu@email.com" }
```

Solo esos usuarios pueden entrar a `/admin` (después de iniciar sesión en `/admin/login`).

**Firebase Admin (servidor):** en Project settings → Service accounts → *Generate new private key*. Pegá el JSON completo en **una sola línea** en `FIREBASE_SERVICE_ACCOUNT_KEY` (Vercel: Environment Variables). Sirve para:

- Guardar sesiones de checkout al crear preferencias de MercadoPago
- Registrar pedidos desde el webhook y desde la página de éxito

## MercadoPago

- Access token en `MERCADOPAGO_ACCESS_TOKEN`
- URL pública en `NEXT_PUBLIC_APP_URL` (ej. tu dominio de Vercel)

**Webhook (recomendado):** en el panel de MercadoPago, notificaciones → URL:

`https://TU-DOMINIO/api/mercadopago/webhook`

- Tienda activa por defecto. Para modo “Próximamente”: `NEXT_PUBLIC_TIENDA_ENABLED=false`

## Panel admin

- **Contenido:** textos del sitio y productos de tienda (precios URLs, etc.)
- **Pedidos:** órdenes sincronizadas desde pagos aprobados (webhook o `/tienda/exito` con `payment_id`)
- **Clientes:** usuarios que se registraron en `/cuenta/registro`

## Despliegue

Configurá todas las variables en Vercel y desplegá las reglas de Firestore antes de producción.
