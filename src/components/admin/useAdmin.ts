"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export class Unauthorized extends Error {}

export async function adminFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (res.status === 401) throw new Unauthorized();
  const json = (await res.json().catch(() => ({}))) as T & { ok?: boolean; error?: string };
  if (!res.ok || json.ok === false) throw new Error(json.error ?? `Request failed (${res.status})`);
  return json;
}

/** Loads admin data, re-polls every `every` ms, and reports when sign-in is needed. */
export function useAdminData<T>(url: string | null, every = 30_000) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const alive = useRef(true);

  const reload = useCallback(async () => {
    if (!url) return;
    try {
      const d = await adminFetch<T>(url);
      if (!alive.current) return;
      setData(d);
      setError(null);
      setNeedsLogin(false);
    } catch (e) {
      if (!alive.current) return;
      if (e instanceof Unauthorized) setNeedsLogin(true);
      else setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }, [url]);

  useEffect(() => {
    alive.current = true;
    const first = setTimeout(reload, 0);
    const t = every ? setInterval(reload, every) : undefined;
    return () => {
      alive.current = false;
      clearTimeout(first);
      if (t) clearInterval(t);
    };
  }, [reload, every]);

  return { data, setData, error, needsLogin, reload };
}
