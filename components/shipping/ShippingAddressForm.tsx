"use client";

import type { Dispatch, SetStateAction } from "react";
import type { ShippingAddress, ShippingZoneId } from "@/lib/shipping";
import { SHIPPING_ZONE_OPTIONS } from "@/lib/shipping";
import { cn } from "@/lib/utils";

function fieldClass() {
  return "mt-1 w-full rounded-xl border border-charcoal/20 bg-cream px-4 py-3 text-charcoal focus:border-charcoal focus:outline-none";
}

type Props = {
  value: ShippingAddress;
  onChange: Dispatch<SetStateAction<ShippingAddress>>;
  showZoneSelector?: boolean;
  className?: string;
};

export function ShippingAddressForm({
  value,
  onChange,
  showZoneSelector = true,
  className,
}: Props) {
  function patch(partial: Partial<ShippingAddress>) {
    onChange((prev) => ({ ...prev, ...partial }));
  }

  function onZoneChange(zona: ShippingZoneId) {
    onChange((prev) => ({
      ...prev,
      zona,
      pais: zona === "internacional" ? prev.pais : "Argentina",
      provincia:
        zona === "buenos_aires"
          ? prev.provincia || "CABA"
          : zona === "internacional"
            ? prev.provincia
            : prev.provincia,
    }));
  }

  return (
    <div className={cn("space-y-4", className)}>
      {showZoneSelector ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-charcoal">Zona de envío</legend>
          <div className="space-y-2">
            {SHIPPING_ZONE_OPTIONS.map((zone) => (
              <label
                key={zone.id}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors",
                  value.zona === zone.id
                    ? "border-charcoal bg-charcoal/[0.04]"
                    : "border-charcoal/15 hover:border-charcoal/30"
                )}
              >
                <input
                  type="radio"
                  name="shipping-zone"
                  className="mt-1"
                  checked={value.zona === zone.id}
                  onChange={() => onZoneChange(zone.id)}
                />
                <span>
                  <span className="block text-sm font-medium text-charcoal">{zone.label}</span>
                  <span className="mt-0.5 block text-xs text-stone">{zone.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-xs uppercase tracking-widest text-stone" htmlFor="ship-nombre">
            Nombre y apellido
          </label>
          <input
            id="ship-nombre"
            className={fieldClass()}
            value={value.nombre}
            onChange={(e) => patch({ nombre: e.target.value })}
            autoComplete="name"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-stone" htmlFor="ship-tel">
            Teléfono
          </label>
          <input
            id="ship-tel"
            className={fieldClass()}
            value={value.telefono}
            onChange={(e) => patch({ telefono: e.target.value })}
            autoComplete="tel"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-stone" htmlFor="ship-cp">
            Código postal
          </label>
          <input
            id="ship-cp"
            className={fieldClass()}
            value={value.codigoPostal}
            onChange={(e) => patch({ codigoPostal: e.target.value })}
            autoComplete="postal-code"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs uppercase tracking-widest text-stone" htmlFor="ship-calle">
            Calle
          </label>
          <input
            id="ship-calle"
            className={fieldClass()}
            value={value.calle}
            onChange={(e) => patch({ calle: e.target.value })}
            autoComplete="street-address"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-stone" htmlFor="ship-num">
            Número
          </label>
          <input
            id="ship-num"
            className={fieldClass()}
            value={value.numero}
            onChange={(e) => patch({ numero: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-stone" htmlFor="ship-piso">
            Piso / depto (opcional)
          </label>
          <input
            id="ship-piso"
            className={fieldClass()}
            value={value.piso ?? ""}
            onChange={(e) => patch({ piso: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-stone" htmlFor="ship-ciudad">
            Ciudad / localidad
          </label>
          <input
            id="ship-ciudad"
            className={fieldClass()}
            value={value.ciudad}
            onChange={(e) => patch({ ciudad: e.target.value })}
            autoComplete="address-level2"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-stone" htmlFor="ship-prov">
            {value.zona === "internacional" ? "Estado / provincia" : "Provincia"}
          </label>
          <input
            id="ship-prov"
            className={fieldClass()}
            value={value.provincia}
            onChange={(e) => patch({ provincia: e.target.value })}
            autoComplete="address-level1"
          />
        </div>
        {value.zona === "internacional" ? (
          <div className="sm:col-span-2">
            <label className="text-xs uppercase tracking-widest text-stone" htmlFor="ship-pais">
              País
            </label>
            <input
              id="ship-pais"
              className={fieldClass()}
              value={value.pais}
              onChange={(e) => patch({ pais: e.target.value })}
              autoComplete="country-name"
            />
          </div>
        ) : null}
        <div className="sm:col-span-2">
          <label className="text-xs uppercase tracking-widest text-stone" htmlFor="ship-notas">
            Indicaciones para el envío (opcional)
          </label>
          <textarea
            id="ship-notas"
            className={fieldClass()}
            rows={2}
            value={value.notas ?? ""}
            onChange={(e) => patch({ notas: e.target.value })}
            placeholder="Horario de entrega, timbre, etc."
          />
        </div>
      </div>
    </div>
  );
}
