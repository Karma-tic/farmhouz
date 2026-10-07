"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { Phase } from "@/content/site";

/**
 * Tiny external store for the page's time of day. DaylightProvider writes to it;
 * components subscribe without re-rendering the whole tree on every scroll.
 */
type Listener = (d: number) => void;
const listeners = new Set<Listener>();
let current = 0;
let currentPhase: Phase = "dawn";
const phaseListeners = new Set<() => void>();

export const daylightStore = {
  get: () => current,
  set(d: number, phase: Phase) {
    current = d;
    listeners.forEach((l) => l(d));
    if (phase !== currentPhase) {
      currentPhase = phase;
      phaseListeners.forEach((l) => l());
    }
  },
  subscribe(l: Listener) {
    listeners.add(l);
    l(current);
    return () => {
      listeners.delete(l);
    };
  },
};

/** Subscribe to the raw 0→1 value (call-back style, no re-render). */
export function useDaylightListener(cb: Listener) {
  useEffect(() => daylightStore.subscribe(cb), [cb]);
}

/** Re-renders only when the phase changes (dawn, morning, noon, golden, dusk, night). */
export function usePhase(): Phase {
  return useSyncExternalStore(
    (l) => {
      phaseListeners.add(l);
      return () => phaseListeners.delete(l);
    },
    () => currentPhase,
    () => "dawn",
  );
}

/** Coarse daylight value as React state (rounded to 2 decimals). */
export function useDaylight() {
  const [d, setD] = useState(0);
  useEffect(() => daylightStore.subscribe((v) => setD(Math.round(v * 100) / 100)), []);
  return d;
}
