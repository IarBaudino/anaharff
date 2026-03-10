# Ana Harff | Fotografía Analógica

Sitio web de portfolio y tienda para Ana Harff, fotógrafa analógica de Buenos Aires. Construido con Next.js 15, Tailwind CSS y MercadoPago para la venta de imágenes.

## Estructura

- **Home** – Hero con mensaje de la artista
- **Sobre mí** – Biografía y sesiones
- **Portfolio** – Categorías: Desnudos, Retratos, Artístico, Experimental
- **Series** – Unica, Ser Gorda, Venus as a Boy, Desde la Distancia
- **Blog** – Sección en desarrollo
- **Tienda** – Venta de imágenes con MercadoPago

## Tecnologías

- Next.js 15 (App Router)
- React 19
- Tailwind CSS 4
- Framer Motion
- Cloudinary (imágenes)
- MercadoPago (pagos)
- Resend (emails)
- Firebase (opcional)

## Configuración

1. Copiar `.env.example` a `.env.local`
2. Configurar credenciales de MercadoPago (para la tienda)
3. Configurar Cloudinary (para imágenes)
4. Ejecutar `npm install` y `npm run dev`

## MercadoPago

- Crear una aplicación en [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
- Obtener el Access Token (producción o prueba)
- Agregar `MERCADOPAGO_ACCESS_TOKEN` en `.env.local`

## Despliegue

Configurar `NEXT_PUBLIC_APP_URL` con la URL de producción para que los redirects de MercadoPago funcionen correctamente.
