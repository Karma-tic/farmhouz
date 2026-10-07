"use client";

import { useSyncExternalStore } from "react";

const subs = new Map<string, (cb: () => void) => () => void>();
function subscribe(query: string) {
  const cached = subs.get(query);
  if (cached) return cached;
  const fn = (cb: () => void) => {
    const m = window.matchMedia(query);
    m.addEventListener("change", cb);
    return () => m.removeEventListener("change", cb);
  };
  subs.set(query, fn);
  return fn;
}

/** SSR-safe media query hook. Returns `fallback` during server render. */
export function useMediaQuery(query: string, fallback = false) {
  return useSyncExternalStore(
    subscribe(query),
    () => window.matchMedia(query).matches,
    () => fallback,
  );
}

export const usePrefersReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");
export const useIsDesktop = () => useMediaQuery("(min-width: 768px)", true);
export const useFinePointer = () => useMediaQuery("(pointer: fine)");
