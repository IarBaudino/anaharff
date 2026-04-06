"use client";

import { useState } from "react";
import { BookOpen, Home, ImagePlus, ShoppingBag, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminEditorBlog } from "@/components/admin/AdminEditorBlog";
import { AdminEditorHome } from "@/components/admin/AdminEditorHome";
import { AdminEditorSobre } from "@/components/admin/AdminEditorSobre";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { AdminCustomers } from "@/components/admin/AdminCustomers";
import { AdminProducts } from "@/components/admin/AdminProducts";

const tabs = [
  { id: "pagina", label: "Página principal", icon: Home },
  { id: "acerca", label: "Acerca de mí", icon: User },
  { id: "blog", label: "Blog", icon: BookOpen },
  { id: "productos", label: "Productos y fotos", icon: ImagePlus },
  { id: "pedidos", label: "Pedidos", icon: ShoppingBag },
  { id: "clientes", label: "Clientes", icon: Users },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function AdminDashboard() {
  const [tab, setTab] = useState<TabId>("pagina");

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
            </button>
          );
        })}
      </nav>

      <div className="min-w-0 flex-1">
        {tab === "pagina" && <AdminEditorHome />}
        {tab === "acerca" && <AdminEditorSobre />}
        {tab === "blog" && <AdminEditorBlog />}
        {tab === "productos" && <AdminProducts />}
        {tab === "pedidos" && <AdminOrders />}
        {tab === "clientes" && <AdminCustomers />}
      </div>
    </div>
  );
}
