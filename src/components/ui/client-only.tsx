"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Renders children only in the browser (for screens that depend on "now", cookies or live data). */
export function ClientOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  return hydrated ? <>{children}</> : <>{fallback}</>;
}
