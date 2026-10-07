"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      toastOptions={{
        className: "!rounded-[var(--radius-card)] !border-line !bg-card !text-ink !font-sans",
      }}
    />
  );
}
