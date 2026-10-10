"use client";

import { Check, Copy, Loader2, Smartphone, Timer } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Field, fieldBase } from "@/components/enquiry/EnquiryForm";
import { Button } from "@/components/ui/button";
import { formatPrice, site } from "@/content/site";
import { displayCode } from "@/lib/booking/messages";
import type { PublicBooking } from "@/lib/booking/types";
import { cn } from "@/lib/utils";
import { useCountdown } from "./useCountdown";

function upiLink(b: PublicBooking) {
  const p = new URLSearchParams({ pa: site.booking.upiId, pn: site.booking.payeeName, am: String(b.advance ?? 0), cu: "INR", tn: `${site.name} ${displayCode(b.code)}` });
  return `upi://pay?${p.toString()}`;
}

/** Quote, hold countdown, UPI QR / app link, and the "I've paid" form. */
export function PaymentStep({ booking, onUpdate }: { booking: PublicBooking; onUpdate: (b: PublicBooking) => void }) {
  const uid = useId();
  const [qr, setQr] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [utr, setUtr] = useState("");
  const [payer, setPayer] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const left = useCountdown(booking.holdUntil);
  const balance = (booking.quoteTotal ?? 0) - (booking.advance ?? 0);
  const link = upiLink(booking);

  useEffect(() => {
    let alive = true;
    import("qrcode").then((q) =>
      q.toString(link, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: getComputedStyle(document.documentElement).getPropertyValue("--on-wheat").trim() || "black", light: "#0000" } }).then((svg) => alive && setQr(svg)),
    );
    return () => {
      alive = false;
    };
  }, [link]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const res = await fetch(`/api/bookings/${booking.code}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "payment", utr: utr.replace(/\s/g, ""), payerName: payer }) });
      const json = (await res.json()) as { ok: boolean; booking?: PublicBooking; error?: string; errors?: Record<string, string[]> };
      if (!res.ok || !json.booking) setErr(json.errors?.utr?.[0] ?? json.error ?? "Couldn't save that. Try again.");
      else onUpdate(json.booking);
    } catch {
      setErr("We couldn't reach the server. Check your connection.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col gap-4">
        <dl className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-card">
          {[
            ["Total for your booking", formatPrice(booking.quoteTotal)],
            [`Advance to pay now (${site.booking.advancePercent}%)`, formatPrice(booking.advance)],
            ["Balance at check-in", formatPrice(balance)],
          ].map(([k, v], i) => (
            <div key={k} className={cn("flex items-center justify-between gap-4 px-5 py-4", i > 0 && "border-t border-line", i === 1 && "bg-wheat/15")}>
              <dt className={i === 1 ? "font-medium" : "text-muted"}>{k}</dt>
              <dd className={cn("font-mono tabular-nums", i === 1 ? "text-xl font-medium" : "")}>{v}</dd>
            </div>
          ))}
        </dl>
        {left && (
          <p className={cn("flex items-center gap-3 rounded-2xl border p-4", left.ms < 3 * 3600_000 ? "border-terra/50 bg-terra/5" : "border-line bg-card")}>
            <Timer className="size-5 shrink-0 text-terra" strokeWidth={1.5} aria-hidden="true" />
            <span>
              Your dates are held for <span className="font-mono font-medium tabular-nums">{left.text}</span>
              <span className="block text-sm text-muted">After that they may go to someone else.</span>
            </span>
          </p>
        )}
        {booking.guestNote && <p className="rounded-2xl border border-dashed border-line bg-cream/60 p-4 text-[0.95rem]">&ldquo;{booking.guestNote}&rdquo; — {site.name}</p>}
      </div>

      <div className="rounded-[var(--radius-card)] border border-line bg-card p-5 sm:p-6">
        <p className="eyebrow mb-4 text-sage">Pay the advance by UPI</p>
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <div className="hidden w-40 shrink-0 rounded-2xl border border-line bg-cream p-2 sm:block" aria-label={`UPI QR code to pay ${formatPrice(booking.advance)} to ${site.booking.payeeName}`} role="img">
            {qr ? <div className="[&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: qr }} /> : <div className="aspect-square animate-pulse rounded-xl bg-line/40" />}
          </div>
          <div className="flex w-full flex-col gap-3">
            <p className="hidden text-sm text-muted sm:block">Scan with any UPI app — PhonePe, GPay, Paytm, BHIM.</p>
            <Button asChild size="lg" className="sm:hidden">
              <a href={link}>
                <Smartphone /> Pay {formatPrice(booking.advance)} in your UPI app
              </a>
            </Button>
            <div className="flex items-center justify-between gap-2 rounded-2xl border border-line px-4 py-2.5">
              <span>
                <span className="eyebrow block text-[0.66rem] text-muted">UPI ID</span>
                <span className="font-mono">{site.booking.upiId}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(site.booking.upiId).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1800);
                  });
                }}
              >
                {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="text-sm text-muted">
              Add <span className="font-mono text-ink">{displayCode(booking.code)}</span> in the note. {site.booking.bankNote}
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 grid gap-4 border-t border-line pt-6" noValidate>
          <p className="font-medium">Paid? Tell us the reference so we can confirm.</p>
          <Field label="UPI reference / UTR number" id={`${uid}-utr`} error={err} hint="12 digits, shown in your app after paying">
            <input id={`${uid}-utr`} value={utr} onChange={(e) => setUtr(e.target.value)} inputMode="text" autoComplete="off" className={cn(fieldBase, "font-mono uppercase tracking-wider")} aria-invalid={!!err} />
          </Field>
          <Field label="Paid from (name on the account, optional)" id={`${uid}-payer`}>
            <input id={`${uid}-payer`} value={payer} onChange={(e) => setPayer(e.target.value)} className={fieldBase} />
          </Field>
          <Button type="submit" size="lg" disabled={busy || !utr.trim()}>
            {busy && <Loader2 className="animate-spin" />} I&apos;ve paid — confirm my booking
          </Button>
        </form>
      </div>
    </div>
  );
}
