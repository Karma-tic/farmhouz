"use client";

import { CalendarDays, Inbox, LogOut, Sprout, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Field, fieldBase } from "@/components/enquiry/EnquiryForm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Bookings", icon: Inbox },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/admin/leads", label: "Owner leads", icon: Sprout },
  { href: "/admin/waitlist", label: "Waitlist", icon: Users },
];

export function LoginCard({ onDone }: { onDone: () => void }) {
  const id = useId();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="mx-auto mt-10 max-w-sm rounded-[28px] border border-line bg-card p-8 shadow-lift">
      <p className="eyebrow mb-2 text-sage">Farmhouze admin</p>
      <h1 className="display display-md mb-6">Sign in</h1>
      <form
        className="grid gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setErr("");
          const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
          const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
          setBusy(false);
          if (json.ok) onDone();
          else setErr(json.error ?? "Couldn't sign in");
        }}
      >
        <Field label="Admin password" id={id} error={err}>
          <input id={id} type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} className={fieldBase} aria-invalid={!!err} />
        </Field>
        <Button type="submit" size="lg" disabled={busy || !pw}>
          Sign in
        </Button>
      </form>
    </div>
  );
}

/** Frame for every admin page: nav, sign-out, fixed noon light. */
export function AdminShell({ children, needsLogin, onLogin, banner }: { children: React.ReactNode; needsLogin: boolean; onLogin: () => void; banner?: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.daylightFixed = "0.34";
    root.dataset.admin = "";
    window.dispatchEvent(new Event("fz:daylight"));
    return () => {
      delete root.dataset.daylightFixed;
      delete root.dataset.admin;
      window.dispatchEvent(new Event("fz:daylight"));
    };
  }, []);

  return (
    <main id="main" className="min-h-svh pb-24 pt-[calc(var(--header-h)+1.5rem)]">
      <div className="container-x">
        {needsLogin ? (
          <LoginCard onDone={onLogin} />
        ) : (
          <>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <nav aria-label="Admin" className="flex flex-wrap gap-1 rounded-full border border-line bg-card p-1">
                {NAV.map((n) => {
                  const active = n.href === "/admin" ? path === "/admin" || path.startsWith("/admin/bookings") : path.startsWith(n.href);
                  return (
                    <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined} className={cn("inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-medium", active ? "bg-ink text-cream" : "text-ink hover:bg-ink/5")}>
                      <n.icon className="size-4" strokeWidth={1.5} aria-hidden="true" /> {n.label}
                    </Link>
                  );
                })}
              </nav>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted"
                onClick={async () => {
                  await fetch("/api/admin/logout", { method: "POST" });
                  router.refresh();
                  onLogin();
                }}
              >
                <LogOut /> Sign out
              </Button>
            </div>
            {banner}
            {children}
          </>
        )}
      </div>
    </main>
  );
}
