# Dominio anaharff.com + Zoho Mail

Checklist para cuando el DNS y Zoho estén listos. **El código ya lee todo desde variables de entorno**; no hace falta redeploy de lógica, solo actualizar env en Vercel y redeploy (o reiniciar) para tomar los valores.

## Casillas Zoho sugeridas (5 free → forward a Gmail de Ana)

| Casilla | Uso |
|---------|-----|
| `hola@anaharff.com` | Remitente público + contacto |
| `pedidos@anaharff.com` | Avisos de compra / operación tienda (`ADMIN_EMAIL`) |
| `noreply@anaharff.com` | Opcional; si no, usá `hola@` como From |
| `prensa@anaharff.com` | Prensa / colaboraciones |
| `sesiones@anaharff.com` o `info@anaharff.com` | Encargos / genérico |

## 1. DNS del dominio

En el registrador (o donde esté el DNS de `anaharff.com`):

1. **Sitio (Vercel)**  
   - A / CNAME según indique Vercel → Domains → `anaharff.com` y `www`.
2. **Zoho Mail**  
   - Registros MX, TXT (SPF), DKIM y verificación que Zoho pida al agregar el dominio.
3. Esperá propagación (a veces minutos, a veces horas).

## 2. Zoho → SMTP

En Zoho Mail (cuenta que envía, p. ej. `hola@anaharff.com`):

- Activar SMTP / “App password” o contraseña de aplicación si Zoho lo pide.
- Host típico: `smtp.zoho.com` (o el que indique Zoho para tu región, a veces `smtp.zoho.eu`).
- Puerto: `587` (STARTTLS) o `465` (SSL).

## 3. Vercel → Environment Variables

Reemplazá / agregá (Production + Preview si aplica):

```env
NEXT_PUBLIC_APP_URL=https://anaharff.com

SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=hola@anaharff.com
SMTP_PASS=contraseña_o_app_password_de_zoho
EMAIL_FROM=Ana Harff <hola@anaharff.com>
ADMIN_EMAIL=pedidos@anaharff.com
```

Forward en Zoho: `hola@` y `pedidos@` → Gmail personal de Ana (ella lee todo en un solo inbox).

**Redeploy** después de guardar las variables.

## 4. Mercado Pago

En la app de Checkout Pro:

- Webhook modo productivo: `https://anaharff.com/api/mercadopago/webhook`
- Cuando salgan de prueba: Access Token de **producción** en `MERCADOPAGO_ACCESS_TOKEN`

## 5. Firebase Auth

Authentication → Settings → **Authorized domains** → agregar:

- `anaharff.com`
- `www.anaharff.com` (si lo usan)

## 6. Probar

1. Formulario `/contacto` → llega a `pedidos@` / Gmail.
2. Registro de cuenta → mail de bienvenida desde `hola@`.
3. Compra de prueba (o real) → mails a cliente y a Ana.
4. Links dentro de los mails apuntan a `https://anaharff.com/...` (por `NEXT_PUBLIC_APP_URL`).

## Notas

- Mientras el dominio no esté, se puede seguir con `https://anaharff.vercel.app` y Gmail SMTP.
- No hardcodear mails en el código: siempre `EMAIL_FROM` / `ADMIN_EMAIL` / SMTP_*.
- Feature pendiente (no bloquea el dominio): tracking + empresas de envío + mail de despacho.
