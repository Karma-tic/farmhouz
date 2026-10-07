"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { PackageId } from "@/content/site";

export type EnquiryPrefill = {
  packageId?: PackageId;
  occasion?: string;
  /** layoutId of the image that should morph into the sheet header */
  morphId?: string;
};

type Ctx = {
  open: boolean;
  prefill: EnquiryPrefill;
  openEnquiry: (prefill?: EnquiryPrefill) => void;
  setOpen: (o: boolean) => void;
};

const EnquiryCtx = createContext<Ctx | null>(null);

export function EnquiryProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [prefill, setPrefill] = useState<EnquiryPrefill>({});
  const openEnquiry = useCallback((p: EnquiryPrefill = {}) => {
    setPrefill(p);
    setOpen(true);
  }, []);
  const value = useMemo(() => ({ open, prefill, openEnquiry, setOpen }), [open, prefill, openEnquiry]);
  return <EnquiryCtx.Provider value={value}>{children}</EnquiryCtx.Provider>;
}

export function useEnquiry() {
  const ctx = useContext(EnquiryCtx);
  if (!ctx) throw new Error("useEnquiry must be used inside <EnquiryProvider>");
  return ctx;
}
