"use client";

import { useState } from "react";
import { ImagePlus, LayoutGrid, ShoppingBag, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminEditor } from "@/components/admin/AdminEditor";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { AdminCustomers } from "@/components/admin/AdminCustomers";
import { AdminProducts } from "@/components/admin/AdminProducts";

const tabs = [
  { id: "contenido", label: "Contenido del sitio", icon: LayoutGrid },
  { id: "productos", label: "Productos y fotos", icon: ImagePlus },
  { id: "pedidos", label: "Pedidos", icon: ShoppingBag },
  { id: "clientes", label: "Clientes", icon: Users },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function AdminDashboard() {
  const [tab, setTab] = useState<TabId>("contenido");

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      <nav className="lg:w-56 shrink-0 space-y-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm transition-colors border",
                active
                  ? "bg-charcoal text-cream border-charcoal"
                  : "bg-cream text-charcoal border-charcoal/10 hover:border-charcoal/25"
              )}
            >
              <Icon size={18} />
              {t.label}
            </button>
          );
        })}
      </nav>

      <div className="flex-1 min-w-0">
        {tab === "contenido" && <AdminEditor />}
        {tab === "productos" && <AdminProducts />}
        {tab === "pedidos" && <AdminOrders />}
        {tab === "clientes" && <AdminCustomers />}
      </div>
    </div>
  );
}
