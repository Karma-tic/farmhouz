"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fieldBase } from "@/components/enquiry/EnquiryForm";
import { waNumber } from "@/lib/booking/messages";
import { cn } from "@/lib/utils";
import { AdminShell } from "./AdminShell";
import { adminFetch, useAdminData } from "./useAdmin";

type Person = { id: string; createdAt: string; name: string; phone: string; occasion: string | null; when: string | null; guests: number | null; notes: string | null; source: string | null; ref: string | null; status: string };
const STATUSES = ["new", "contacted", "booked", "not-interested"];

/** Pre-launch guest waitlist: people to WhatsApp the day bookings open. */
export function WaitlistAdmin() {
  const { data, setData, needsLogin, reload, error } = useAdminData<{ people: Person[] }>("/api/admin/waitlist", 60_000);
  const setStatus = async (id: string, status: string) => {
    await adminFetch("/api/admin/waitlist", { method: "POST", body: JSON.stringify({ id, status }) });
    setData((d) => (d ? { people: d.people.map((p) => (p.id === id ? { ...p, status } : p)) } : d));
  };
  const fresh = data?.people.filter((p) => p.status === "new").length ?? 0;
  return (
    <AdminShell needsLogin={needsLogin} onLogin={reload}>
      <h1 className="display display-md mb-2">Guest waitlist</h1>
      <p className="mb-6 text-muted">
        People who asked to hear first when bookings open{data ? ` · ${data.people.length} total, ${fresh} not contacted yet` : ""}.
      </p>
      {error && <p className="text-terra">{error}</p>}
      {!data ? (
        <p className="text-muted">Loading…</p>
      ) : data.people.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-line p-10 text-center text-muted">No one yet — share farmhouze.in on Instagram.</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {data.people.map((p) => (
            <li key={p.id} className="rounded-[var(--radius-card)] border border-line bg-card p-5">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <p className="display text-[1.5rem] leading-tight">{p.name}</p>
                  <p className="text-sm text-muted">
                    {[p.occasion, p.when, p.guests && `${p.guests} guests`].filter(Boolean).join(" · ") || "No details"} · {new Date(p.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </p>
                </div>
                <label className="sr-only" htmlFor={`wl-${p.id}`}>
                  Status
                </label>
                <select id={`wl-${p.id}`} value={p.status} onChange={(e) => setStatus(p.id, e.target.value)} className={cn(fieldBase, "min-h-10 w-auto py-1 text-sm")}>
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <p className="mb-3 font-mono">{p.phone}</p>
              {p.notes && <p className="mb-3 text-sm text-muted">{p.notes}</p>}
              {(p.source || p.ref) && <p className="eyebrow mb-3 text-sage">Heard via {[p.source, p.ref && `link: ${p.ref}`].filter(Boolean).join(" · ")}</p>}
              <Button asChild size="sm" variant="sage">
                <a href={`https://wa.me/${waNumber(p.phone)}?text=${encodeURIComponent(`Hi ${p.name}, this is Farmhouze! You asked to hear first when farmhouse bookings open in Bhopal — `)}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle /> WhatsApp
                </a>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
