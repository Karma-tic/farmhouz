"use client";

import { ExternalLink, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fieldBase } from "@/components/enquiry/EnquiryForm";
import { waNumber } from "@/lib/booking/messages";
import { cn } from "@/lib/utils";
import { AdminShell } from "./AdminShell";
import { adminFetch, useAdminData } from "./useAdmin";

type Lead = { id: string; createdAt: string; name: string; phone: string; farmName: string; area: string | null; guests: number | null; hasPool: boolean | null; photosLink: string | null; notes: string | null; source: string | null; ref: string | null; status: string };
const STATUSES = ["new", "contacted", "visited", "listed", "declined"];

export function LeadsAdmin() {
  const { data, setData, needsLogin, reload, error } = useAdminData<{ leads: Lead[] }>("/api/admin/leads", 60_000);
  const setStatus = async (id: string, status: string) => {
    await adminFetch("/api/admin/leads", { method: "POST", body: JSON.stringify({ id, status }) });
    setData((d) => (d ? { leads: d.leads.map((l) => (l.id === id ? { ...l, status } : l)) } : d));
  };
  return (
    <AdminShell needsLogin={needsLogin} onLogin={reload}>
      <h1 className="display display-md mb-2">Owner leads</h1>
      <p className="mb-6 text-muted">Owners who applied through “List your farmhouse”. Once you&apos;ve visited one, add it under Farmhouses.</p>
      {error && <p className="text-terra">{error}</p>}
      {!data ? (
        <p className="text-muted">Loading…</p>
      ) : data.leads.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-line p-10 text-center text-muted">No applications yet.</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {data.leads.map((l) => (
            <li key={l.id} className="rounded-[var(--radius-card)] border border-line bg-card p-5">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <p className="display text-[1.5rem] leading-tight">{l.farmName}</p>
                  <p className="text-sm text-muted">
                    {l.area ?? "Area?"} · {l.guests ?? "?"} guests{l.hasPool ? " · pool" : ""} · {new Date(l.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </p>
                </div>
                <label className="sr-only" htmlFor={`st-${l.id}`}>
                  Status
                </label>
                <select id={`st-${l.id}`} value={l.status} onChange={(e) => setStatus(l.id, e.target.value)} className={cn(fieldBase, "min-h-10 w-auto py-1 text-sm")}>
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <p className="mb-3">
                {l.name} · <span className="font-mono">{l.phone}</span>
              </p>
              {l.notes && <p className="mb-3 text-sm text-muted">{l.notes}</p>}
              {(l.source || l.ref) && <p className="eyebrow mb-3 text-sage">Heard via {[l.source, l.ref && `link: ${l.ref}`].filter(Boolean).join(" · ")}</p>}
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="sage">
                  <a href={`https://wa.me/${waNumber(l.phone)}?text=${encodeURIComponent(`Hi ${l.name}, this is Farmhouze — thanks for applying to list ${l.farmName}! When could we visit?`)}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle /> WhatsApp
                  </a>
                </Button>
                {l.photosLink && (
                  <Button asChild size="sm" variant="ghost" className="text-ink">
                    <a href={l.photosLink} target="_blank" rel="noopener noreferrer nofollow">
                      <ExternalLink /> Photos
                    </a>
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
