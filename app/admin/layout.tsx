import type { ReactNode } from "react";
import { AdminGate } from "@/components/admin/AdminGate";

export default function AdminSectionLayout({ children }: { children: ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}
