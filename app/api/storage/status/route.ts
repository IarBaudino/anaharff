import { NextResponse } from "next/server";
import { isSupabaseStorageConfigured } from "@/lib/storage-config";

export const runtime = "nodejs";

/** Estado de Supabase Storage en este servidor (local vs Vercel). */
export async function GET() {
  const configured = isSupabaseStorageConfigured();
  return NextResponse.json({
    configured,
    bucket: process.env.SUPABASE_STORAGE_BUCKET?.trim() || "images",
    hint: configured
      ? null
      : "Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en este entorno.",
  });
}
