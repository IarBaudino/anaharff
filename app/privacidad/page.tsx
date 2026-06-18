import Link from "next/link";
import { SectionDivider } from "@/components/SectionDivider";
import { SITE_PAGE_SHELL } from "@/lib/layout-constants";

export default function PrivacidadPage() {
  return (
    <div className={SITE_PAGE_SHELL}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="section-kicker mb-3">Legal</p>
          <h1 className="font-display text-4xl font-light tracking-tight text-charcoal md:text-5xl">
            Política de privacidad
          </h1>
          <p className="mt-4 text-sm text-stone">Última actualización: junio 2026</p>
          <SectionDivider variant="line" className="mt-8 max-w-sm" />
        </header>

        <div className="prose-custom space-y-8 text-base leading-relaxed text-charcoal/90">
          <section className="space-y-3">
            <h2 className="font-display text-2xl font-light text-charcoal">Responsable</h2>
            <p>
              Ana Harff («nosotros», «la artista») es responsable del tratamiento de los datos
              personales que se recaban a través de este sitio web, conforme a la Ley 25.326 de
              Protección de Datos Personales de la República Argentina y normas complementarias.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-light text-charcoal">Qué datos recopilamos</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Formulario de contacto:</strong> nombre, email, teléfono opcional, motivo y
                mensaje.
              </li>
              <li>
                <strong>Cuenta de usuario:</strong> email, nombre, teléfono y dirección de envío si
                la guardás para compras.
              </li>
              <li>
                <strong>Compras en la tienda:</strong> datos de envío, ítems del pedido, estado del
                pago y referencias de Mercado Pago.
              </li>
              <li>
                <strong>Datos técnicos mínimos:</strong> logs del servidor y, si está configurado,
                herramientas de monitoreo de errores para mantener el sitio estable.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-light text-charcoal">Para qué los usamos</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Responder consultas enviadas por el formulario de contacto.</li>
              <li>Gestionar tu cuenta, pedidos e impresiones adquiridas.</li>
              <li>Procesar pagos a través de Mercado Pago (no almacenamos datos completos de tarjetas).</li>
              <li>Enviarte correos transaccionales (confirmación de compra, bienvenida, recuperación de contraseña).</li>
              <li>Mejorar la seguridad y el funcionamiento del sitio.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-light text-charcoal">Base legal y conservación</h2>
            <p>
              El tratamiento se basa en tu consentimiento (formulario de contacto), en la ejecución
              de una relación contractual (compras) o en el interés legítimo de operar el sitio de
              forma segura. Conservamos los datos el tiempo necesario para esos fines y las
              obligaciones legales aplicables.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-light text-charcoal">Terceros</h2>
            <p>Podemos compartir datos solo con proveedores necesarios para operar el sitio:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Firebase (Google):</strong> autenticación y base de datos de contenido y
                pedidos.
              </li>
              <li>
                <strong>Mercado Pago:</strong> procesamiento de pagos.
              </li>
              <li>
                <strong>Supabase:</strong> almacenamiento de imágenes del sitio.
              </li>
              <li>
                <strong>Proveedor de email (SMTP):</strong> envío de correos transaccionales.
              </li>
              <li>
                <strong>Vercel:</strong> hosting del sitio.
              </li>
            </ul>
            <p>
              Estos proveedores actúan como encargados del tratamiento según sus propias políticas y
              acuerdos de servicio.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-light text-charcoal">Tus derechos</h2>
            <p>
              Podés acceder, rectificar, actualizar o solicitar la supresión de tus datos, y oponerte
              a tratamientos no esenciales, escribiendo a través del{" "}
              <Link href="/contacto" className="text-accent underline underline-offset-2">
                formulario de contacto
              </Link>
              . También podés presentar un reclamo ante la Agencia de Acceso a la Información Pública
              (AAIP) de Argentina.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-light text-charcoal">Cookies</h2>
            <p>
              El sitio utiliza cookies y almacenamiento local estrictamente necesarios para la sesión
              de usuario, el carrito de compras y preferencias técnicas. No usamos cookies de
              publicidad de terceros en el estado actual del proyecto.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-light text-charcoal">Cambios</h2>
            <p>
              Podemos actualizar esta política. La fecha de revisión se indica al inicio del
              documento. El uso continuado del sitio implica la aceptación de la versión vigente.
            </p>
          </section>

          <p className="text-sm text-stone">
            Consultas:{" "}
            <Link href="/contacto" className="text-accent underline underline-offset-2">
              Contacto
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
