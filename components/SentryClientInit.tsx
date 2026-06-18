"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

const dsn =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_SENTRY_DSN?.trim()
    : undefined;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.05,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || "production",
  });
}

export default function SentryClientInit() {
  useEffect(() => {
    /* init arriba al cargar el módulo */
  }, []);
  return null;
}
