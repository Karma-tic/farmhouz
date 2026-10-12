"use client";

import { ArrowLeft, Check, Copy, ExternalLink, Loader2, MessageCircle, Phone, X } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { useCountdown } from "@/components/booking/useCountdown";
import { Field, fieldBase } from "@/components/enquiry/EnquiryForm";
import { Button } from "@/components/ui/button";
import { packagesFor } from "@/content/farmhouses";
import { useFarms } from "@/lib/farms/client";
import type { Farmhouse } from "@/content/types";
import type { OwnerInfo } from "@/lib/farms/types";
import { formatPrice, site } from "@/content/site";
import { addDays, nightsBetween, prettyRange } from "@/lib/booking/dates";
import { displayCode } from "@/lib/booking/messages";
import type { AdminAction } from "@/lib/booking/schema";
import type { Booking, BookingEvent, DateRange } from "@/lib/booking/types";
import { cn } from "@/lib/utils";
import { AdminShell } from "./AdminShell";
import { StatusPill } from "./StatusPill";
import { adminFetch, useAdminData } from "./useAdmin";

type Detail = {
  booking: Booking;
  events: BookingEvent[];
  owner: OwnerInfo;
  suggestions: { dates: DateRange[]; farms: string[] };
  links: { tracking: string; waGuest: string; waOwnerAsk: string; waOwnerConfirm: string };
};

const round100 = (n: number) => Math.round(n / 100) * 100;

function estimateQuote(b: Booking, farm: Farmhouse | undefined) {
  if (!farm) return 0;
  const pkg = packagesFor(farm).find((p) => p.id === b.packageId);
  const nights = nightsBetween(b.checkIn, b.checkOut);
  if (!pkg?.priceFrom) return 0;
  return pkg.pricing === "per-night" ? pkg.priceFrom * Math.max(1, nights) : pkg.priceFrom;
}

function Card({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-[var(--radius-card)] border border-line bg-card p-5 sm:p-6", className)}>
      {title && <h2 className="eyebrow mb-4 text-sage">{title}</h2>}
      {children}
    </section>
  );
}

function Row({ k, v, mono }: { k: string; v: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-line py-2.5 first:border-t-0">
      <dt className="text-sm text-muted">{k}</dt>
      <dd className={cn("text-right", mono && "font-mono")}>{v}</dd>
    </div>
  );
}

export function BookingDetail({ id }: { id: string }) {
  const { data, setData, error, needsLogin, reload } = useAdminData<Detail>(`/api/admin/bookings/${id}`, 30_000);
  const [busy, setBusy] = useState<string | null>(null);
  const [actErr, setActErr] = useState("");

  const act = async (action: AdminAction, key: string) => {
    setBusy(key);
    setActErr("");
    try {
      const d = await adminFetch<Detail>(`/api/admin/bookings/${id}`, { method: "POST", body: JSON.stringify(action) });
      setData(d);
    } catch (e) {
      setActErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <AdminShell needsLogin={needsLogin} onLogin={reload}>
      <Link href="/admin" className="link-draw mb-6 inline-flex items-center gap-2 text-sm text-muted">
        <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden="true" /> All bookings
      </Link>
      {error && <p className="text-terra">{error}</p>}
      {!data ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <DetailBody d={data} busy={busy} act={act} actErr={actErr} />
      )}
    </AdminShell>
  );
}

function DetailBody({ d, busy, act, actErr }: { d: Detail; busy: string | null; act: (a: AdminAction, key: string) => void; actErr: string }) {
  const { get: getFarmhouse } = useFarms();
  const b = d.booking;
  const farm = getFarmhouse(b.farmSlug);
  const [copied, setCopied] = useState(false);
  const hold = useCountdown(b.status === "available" ? b.holdUntil : null);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusPill status={b.status} />
            <span className="eyebrow text-muted">{displayCode(b.code)}</span>
          </div>
          <h1 className="display display-md">{farm?.name ?? b.farmSlug}</h1>
          <p className="mt-1 text-muted">
            {prettyRange(b.checkIn, b.checkOut, { weekday: true })} · {b.guests} guests{b.occasion ? ` · ${b.occasion}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="sage">
            <a href={d.links.waGuest} target="_blank" rel="noopener noreferrer">
              <MessageCircle /> WhatsApp guest
            </a>
          </Button>
          <Button
            variant="outline"
            className="text-ink"
            onClick={() =>
              navigator.clipboard?.writeText(d.links.tracking).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              })
            }
          >
            {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy guest link"}
          </Button>
          <Button asChild variant="ghost" className="text-ink">
            <a href={d.links.tracking} target="_blank" rel="noopener noreferrer">
              <ExternalLink /> Guest view
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <div className="flex flex-col gap-6">
          <Card title="Guest">
            <dl>
              <Row k="Name" v={b.name} />
              <Row
                k="Phone"
                v={
                  <a className="link-draw" href={`tel:${b.phone.replace(/\s/g, "")}`}>
                    {b.phone}
                  </a>
                }
                mono
              />
              {b.email && <Row k="Email" v={b.email} />}
              <Row k="Planning" v={farm ? packagesFor(farm).find((p) => p.id === b.packageId)?.name ?? b.packageId : b.packageId} />
              {b.message && <Row k="Note" v={<span className="whitespace-pre-wrap">{b.message}</span>} />}
            </dl>
          </Card>

          <Card title="Owner (private)">
            <dl className="mb-4">
              <Row k="Owner" v={d.owner.ownerName} />
              <Row k="Caretaker" v={`${d.owner.caretakerName} · ${d.owner.caretakerPhone}`} />
              <Row k="Address" v={d.owner.exactAddress} />
              {d.owner.notes && <Row k="Notes" v={d.owner.notes} />}
            </dl>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline" className="text-ink">
                <a href={d.links.waOwnerAsk} target="_blank" rel="noopener noreferrer">
                  <MessageCircle /> Ask owner if free
                </a>
              </Button>
              {b.status === "confirmed" && (
                <Button asChild size="sm" variant="outline" className="text-ink">
                  <a href={d.links.waOwnerConfirm} target="_blank" rel="noopener noreferrer">
                    <MessageCircle /> Send booking to owner
                  </a>
                </Button>
              )}
              <Button asChild size="sm" variant="ghost" className="text-ink">
                <a href={`tel:${d.owner.caretakerPhone.replace(/\s/g, "")}`}>
                  <Phone /> Call caretaker
                </a>
              </Button>
            </div>
          </Card>

          {(b.quoteTotal != null || b.paymentUtr) && (
            <Card title="Money">
              <dl>
                <Row k="Quote" v={formatPrice(b.quoteTotal)} mono />
                <Row k="Advance" v={formatPrice(b.advance)} mono />
                <Row k="Balance at check-in" v={formatPrice((b.quoteTotal ?? 0) - (b.advance ?? 0))} mono />
                {hold && <Row k="Hold ends in" v={hold.done ? "Lapsed" : hold.text} mono />}
                {b.paymentUtr && <Row k="UTR from guest" v={b.paymentUtr} mono />}
                {b.paymentName && <Row k="Paid from" v={b.paymentName} />}
              </dl>
            </Card>
          )}

          <NotesCard b={b} busy={busy} act={act} />

          <Card title="Timeline">
            <ol className="relative border-l border-line pl-5">
              {d.events.map((e) => (
                <li key={e.id} className="pb-4">
                  <p className="text-sm">
                    <span className="font-medium">{e.type.replace(/_/g, " ")}</span> <span className="text-muted">· {e.actor}</span>
                  </p>
                  <p className="eyebrow text-[0.66rem] text-muted">{new Date(e.at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          {actErr && (
            <p role="alert" className="rounded-2xl border border-terra/50 bg-terra/5 p-4 text-terra">
              {actErr}
            </p>
          )}
          {(b.status === "checking" || b.status === "expired") && <CheckingActions d={d} busy={busy} act={act} />}
          {b.status === "available" && (
            <Card title="Waiting for the guest to pay">
              <p className="mb-4 text-muted">
                They see the quote, UPI QR and a countdown. Nudge them on WhatsApp if the hold is running out.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="sage">
                  <a href={d.links.waGuest} target="_blank" rel="noopener noreferrer">
                    <MessageCircle /> Send payment reminder
                  </a>
                </Button>
                <Button variant="outline" className="text-ink" disabled={!!busy} onClick={() => act({ action: "confirm", guestNote: "" }, "confirm")}>
                  {busy === "confirm" ? <Loader2 className="animate-spin" /> : <Check />} Paid (no UTR) — confirm
                </Button>
              </div>
              <div className="mt-6 border-t border-line pt-6">
                <UnavailableForm d={d} busy={busy} act={act} label="Owner backed out → not available" />
              </div>
            </Card>
          )}
          {b.status === "payment_review" && <PaymentReview d={d} busy={busy} act={act} />}
          {b.status === "confirmed" && (
            <Card title="Booked">
              <p className="mb-4 text-muted">The guest can see their pass with the exact address. Send the details to the owner so they block the dates on their side.</p>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="sage">
                  <a href={d.links.waOwnerConfirm} target="_blank" rel="noopener noreferrer">
                    <MessageCircle /> Send booking to owner
                  </a>
                </Button>
                <Button asChild variant="outline" className="text-ink">
                  <a href={d.links.waGuest} target="_blank" rel="noopener noreferrer">
                    <MessageCircle /> Send pass to guest
                  </a>
                </Button>
              </div>
            </Card>
          )}
          {(b.status === "unavailable" || b.status === "cancelled") && (
            <Card title={b.status === "unavailable" ? "Offered alternatives" : "Cancelled"}>
              <p className="mb-4 text-muted">
                {b.status === "unavailable" ? "The guest can switch to a suggested date or farmhouse with one tap — it comes back here as a new check." : (b.guestNote ?? "No reason given.")}
              </p>
              <Button variant="outline" className="text-ink" disabled={!!busy} onClick={() => act({ action: "recheck" }, "recheck")}>
                {busy === "recheck" && <Loader2 className="animate-spin" />} Re-open as &ldquo;checking&rdquo;
              </Button>
            </Card>
          )}
          {!["cancelled"].includes(b.status) && <CancelCard busy={busy} act={act} confirmed={b.status === "confirmed"} />}
        </div>
      </div>
    </div>
  );
}

function CheckingActions({ d, busy, act }: { d: Detail; busy: string | null; act: (a: AdminAction, key: string) => void }) {
  const [mode, setMode] = useState<"available" | "unavailable" | null>(null);
  return (
    <Card title={d.booking.status === "expired" ? "Hold lapsed — check again?" : "1 · Ask the owner  ·  2 · Tell the guest"}>
      <ol className="mb-5 flex flex-col gap-3 text-[0.95rem]">
        <li className="flex gap-3">
          <span className="eyebrow pt-0.5 text-sage">01</span>
          <span>
            Message or call the owner.{" "}
            <a className="link-draw font-medium text-sage" href={d.links.waOwnerAsk} target="_blank" rel="noopener noreferrer">
              Open prefilled WhatsApp →
            </a>
          </span>
        </li>
        <li className="flex gap-3">
          <span className="eyebrow pt-0.5 text-sage">02</span>
          <span>Record the answer below. The guest&apos;s page updates instantly (and they get an email if they left one).</span>
        </li>
      </ol>
      <div className="mb-5 grid grid-cols-2 gap-2">
        <Button variant={mode === "available" ? "sage" : "outline"} className={mode === "available" ? "" : "text-ink"} onClick={() => setMode("available")}>
          <Check /> It&apos;s available
        </Button>
        <Button variant={mode === "unavailable" ? "sage" : "outline"} className={mode === "unavailable" ? "" : "text-ink"} onClick={() => setMode("unavailable")}>
          <X /> Not available
        </Button>
      </div>
      {mode === "available" && <AvailableForm d={d} busy={busy} act={act} />}
      {mode === "unavailable" && <UnavailableForm d={d} busy={busy} act={act} />}
    </Card>
  );
}

function AvailableForm({ d, busy, act }: { d: Detail; busy: string | null; act: (a: AdminAction, key: string) => void }) {
  const { get: getFarmhouse } = useFarms();
  const uid = useId();
  const est = estimateQuote(d.booking, getFarmhouse(d.booking.farmSlug));
  const [total, setTotal] = useState(String(d.booking.quoteTotal ?? (est || "")));
  const [advanceOverride, setAdvance] = useState<string | null>(d.booking.advance != null ? String(d.booking.advance) : null);
  const [hours, setHours] = useState(String(site.booking.holdHours));
  const [note, setNote] = useState("");
  const advance = advanceOverride ?? (Number(total) ? String(round100((Number(total) * site.booking.advancePercent) / 100)) : "");
  const valid = Number(total) > 0 && Number(advance) >= 0 && Number(advance) <= Number(total);
  return (
    <form
      className="grid grid-cols-2 gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        act({ action: "available", quoteTotal: Number(total), advance: Number(advance), holdHours: Number(hours), guestNote: note }, "available");
      }}
    >
      <Field label="Total quote (₹)" id={`${uid}-t`} hint={est ? `Listed price: ${formatPrice(est)}` : undefined}>
        <input id={`${uid}-t`} inputMode="numeric" value={total} onChange={(e) => setTotal(e.target.value.replace(/\D/g, ""))} className={cn(fieldBase, "font-mono")} />
      </Field>
      <Field label={`Advance (₹) · ${site.booking.advancePercent}%`} id={`${uid}-a`}>
        <input
          id={`${uid}-a`}
          inputMode="numeric"
          value={advance}
          onChange={(e) => setAdvance(e.target.value.replace(/\D/g, ""))}
          className={cn(fieldBase, "font-mono")}
        />
      </Field>
      <Field label="Hold dates for (hours)" id={`${uid}-h`}>
        <select id={`${uid}-h`} value={hours} onChange={(e) => setHours(e.target.value)} className={fieldBase}>
          {[6, 12, 24, 48, 72].map((h) => (
            <option key={h} value={h}>
              {h} hours
            </option>
          ))}
        </select>
      </Field>
      <div />
      <Field label="Note to guest (optional)" id={`${uid}-n`} className="col-span-2">
        <textarea id={`${uid}-n`} rows={2} value={note} onChange={(e) => setNote(e.target.value)} className={cn(fieldBase, "py-3")} placeholder="e.g. Includes breakfast for 12. Decorator can come at 9 AM." />
      </Field>
      <Button type="submit" size="lg" className="col-span-2" disabled={!valid || !!busy}>
        {busy === "available" && <Loader2 className="animate-spin" />} Send quote & hold dates
      </Button>
    </form>
  );
}

function UnavailableForm({ d, busy, act, label = "Tell the guest it's not available" }: { d: Detail; busy: string | null; act: (a: AdminAction, key: string) => void; label?: string }) {
  const { get: getFarmhouse, inCity: farmhousesIn } = useFarms();
  const uid = useId();
  const b = d.booking;
  const [dates, setDates] = useState<DateRange[]>(d.suggestions.dates.slice(0, 3));
  const [farms, setFarms] = useState<string[]>(d.suggestions.farms);
  const [block, setBlock] = useState(true);
  const [note, setNote] = useState("");
  const [customFrom, setCustomFrom] = useState("");
  const len = nightsBetween(b.checkIn, b.checkOut);
  const toggleDate = (r: DateRange) => setDates((ds) => (ds.some((x) => x.from === r.from) ? ds.filter((x) => x.from !== r.from) : [...ds, r]));
  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        act({ action: "unavailable", altDates: dates, altFarms: farms, blockDates: block, guestNote: note }, "unavailable");
      }}
    >
      <label className="flex items-center gap-3 text-[0.95rem]">
        <input type="checkbox" checked={block} onChange={(e) => setBlock(e.target.checked)} className="size-5 accent-[var(--sage)]" />
        Block {prettyRange(b.checkIn, b.checkOut)} on {getFarmhouse(b.farmSlug)?.name}&apos;s calendar
      </label>
      <fieldset>
        <legend className="eyebrow mb-2 text-muted">Offer these dates instead</legend>
        <div className="flex flex-wrap gap-2">
          {[...d.suggestions.dates, ...dates.filter((x) => !d.suggestions.dates.some((s) => s.from === x.from))].map((r) => {
            const on = dates.some((x) => x.from === r.from);
            return (
              <button key={r.from} type="button" aria-pressed={on} onClick={() => toggleDate(r)} className={cn("min-h-10 rounded-full border px-3 text-sm", on ? "border-sage bg-sage text-cream" : "border-line bg-card")}>
                {prettyRange(r.from, r.to, { weekday: true })}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <label htmlFor={`${uid}-cf`} className="sr-only">
            Add a check-in date
          </label>
          <input id={`${uid}-cf`} type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className={cn(fieldBase, "max-w-[12rem] font-mono text-sm")} />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={!customFrom}
            onClick={() => {
              toggleDate({ from: customFrom, to: b.checkOut ? addDays(customFrom, Math.max(1, len)) : null });
              setCustomFrom("");
            }}
          >
            + Add date
          </Button>
        </div>
      </fieldset>
      <fieldset>
        <legend className="eyebrow mb-2 text-muted">…or similar farmhouses free on their dates</legend>
        <div className="flex flex-wrap gap-2">
          {farmhousesIn("bhopal")
            .filter((f) => f.slug !== b.farmSlug)
            .map((f) => {
              const on = farms.includes(f.slug);
              const suggested = d.suggestions.farms.includes(f.slug);
              return (
                <button
                  key={f.slug}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFarms((fs) => (on ? fs.filter((x) => x !== f.slug) : [...fs, f.slug].slice(0, 4)))}
                  className={cn("min-h-10 rounded-full border px-3 text-sm", on ? "border-sage bg-sage text-cream" : "border-line bg-card", !suggested && !on && "opacity-60")}
                >
                  {f.name}
                  {suggested ? " ✓" : ""}
                </button>
              );
            })}
        </div>
        <p className="mt-1.5 text-xs text-muted">✓ = free on those dates per our calendar and fits {b.guests} guests. Check with the owner if unsure.</p>
      </fieldset>
      <Field label="Note to guest (optional)" id={`${uid}-n`}>
        <textarea id={`${uid}-n`} rows={2} value={note} onChange={(e) => setNote(e.target.value)} className={cn(fieldBase, "py-3")} placeholder="e.g. Sorry! The owner has a family event that weekend." />
      </Field>
      <Button type="submit" size="lg" disabled={!!busy}>
        {busy === "unavailable" && <Loader2 className="animate-spin" />} {label}
      </Button>
    </form>
  );
}

function PaymentReview({ d, busy, act }: { d: Detail; busy: string | null; act: (a: AdminAction, key: string) => void }) {
  const uid = useId();
  const [note, setNote] = useState("");
  const [reject, setReject] = useState(false);
  return (
    <Card title="Verify the payment">
      <p className="mb-2 text-muted">Check your bank / UPI app for this reference:</p>
      <p className="mb-5 rounded-2xl bg-wheat/20 px-4 py-3 font-mono text-xl tracking-wider">
        {d.booking.paymentUtr} · {formatPrice(d.booking.advance)}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button size="lg" variant="sage" disabled={!!busy} onClick={() => act({ action: "confirm", guestNote: "" }, "confirm")}>
          {busy === "confirm" ? <Loader2 className="animate-spin" /> : <Check />} Received — confirm booking
        </Button>
        <Button size="lg" variant="outline" className="text-ink" onClick={() => setReject((r) => !r)}>
          Can&apos;t find it
        </Button>
      </div>
      {reject && (
        <form
          className="mt-5 grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            act({ action: "reject_payment", guestNote: note }, "reject");
          }}
        >
          <Field label="Tell the guest what to check" id={`${uid}-n`}>
            <textarea id={`${uid}-n`} rows={2} value={note} onChange={(e) => setNote(e.target.value)} className={cn(fieldBase, "py-3")} placeholder="We couldn't find a payment with that reference. Could you check the UTR in your app?" />
          </Field>
          <Button type="submit" disabled={note.trim().length < 3 || !!busy}>
            {busy === "reject" && <Loader2 className="animate-spin" />} Send back to guest
          </Button>
        </form>
      )}
    </Card>
  );
}

function NotesCard({ b, busy, act }: { b: Booking; busy: string | null; act: (a: AdminAction, key: string) => void }) {
  const uid = useId();
  const [v, setV] = useState(b.adminNote ?? "");
  return (
    <Card title="Private notes">
      <label htmlFor={uid} className="sr-only">
        Private notes
      </label>
      <textarea id={uid} rows={3} value={v} onChange={(e) => setV(e.target.value)} className={cn(fieldBase, "py-3")} placeholder="Only you see this." />
      <Button size="sm" variant="ghost" className="mt-2 text-ink" disabled={v === (b.adminNote ?? "") || !!busy} onClick={() => act({ action: "note", adminNote: v }, "note")}>
        {busy === "note" && <Loader2 className="animate-spin" />} Save note
      </Button>
    </Card>
  );
}

function CancelCard({ busy, act, confirmed }: { busy: string | null; act: (a: AdminAction, key: string) => void; confirmed: boolean }) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-line p-5">
      {!open ? (
        <Button variant="ghost" size="sm" className="text-muted" onClick={() => setOpen(true)}>
          <X /> Cancel this booking
        </Button>
      ) : (
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            act({ action: "cancel", guestNote: note }, "cancel");
          }}
        >
          {confirmed && <p className="text-sm text-terra">This booking is paid. Cancelling frees the dates — handle any refund separately.</p>}
          <Field label="Message to the guest" id={uid}>
            <textarea id={uid} rows={2} value={note} onChange={(e) => setNote(e.target.value)} className={cn(fieldBase, "py-3")} />
          </Field>
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="bg-terra text-cream hover:bg-terra" disabled={!!busy}>
              {busy === "cancel" && <Loader2 className="animate-spin" />} Yes, cancel
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Keep it
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
