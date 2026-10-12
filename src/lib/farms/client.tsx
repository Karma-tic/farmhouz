"use client";

import { createContext, useContext, useMemo } from "react";
import type { Farmhouse } from "@/content/types";

type Farms = { farms: Farmhouse[]; get: (slug: string | undefined | null) => Farmhouse | undefined; inCity: (city: string) => Farmhouse[] };

const Ctx = createContext<Farms>({ farms: [], get: () => undefined, inCity: () => [] });

/** Gives client components the published farmhouses loaded by the root layout. */
export function FarmsProvider({ farms, children }: { farms: Farmhouse[]; children: React.ReactNode }) {
  const value = useMemo<Farms>(
    () => ({
      farms,
      get: (slug) => (slug ? farms.find((f) => f.slug === slug) : undefined),
      inCity: (city) => farms.filter((f) => f.city === city),
    }),
    [farms],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useFarms = () => useContext(Ctx);
