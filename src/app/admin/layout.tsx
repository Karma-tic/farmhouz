import type { Metadata } from "next";
import { ClientOnly } from "@/components/ui/client-only";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

/** The admin is fully client-rendered: every screen is live data behind a sign-in. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <ClientOnly fallback={<div className="min-h-svh" aria-busy="true" />}>{children}</ClientOnly>;
}
