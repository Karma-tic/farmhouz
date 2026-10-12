"use client";

import { ArrowRight, Hourglass, Loader2, MessageCircle, PhoneCall, RotateCcw, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { LeafConfetti } from "@/components/enquiry/LeafConfetti";
import { Button } from "@/components/ui/button";
import { getArea } from "@/content/cities";
import { useFarms } from "@/lib/farms/client";
import { site, whatsappLink } from "@/content/site";
import { prettyRange } from "@/lib/booking/dates";
import { displayCode } from "@/lib/booking/messages";
import type { BookingStatus, PublicBooking } from "@/lib/booking/types";
import { cn } from "@/lib/utils";
import { Alternatives } from "./Alternatives";
import { BookingPass } from "./BookingPass";
import { DayPath } from "./DayPath";
import { PaymentStep } from "./PaymentStep";
import { useAgo } from "./useCountdown";

/** Each status lights the page at a different time of day. */
const DAYLIGHT: Record<BookingStatus, number> = {
  checking: 0.2,
  available: 0.52,
  payment_review: 0.64,
  confirmed: 1,
  unavailable: 0.42,
  expired: 0.6,
  cancelled: 0.3,
};
const PROGRESS: Record<BookingStatus, number> = {
  checking: 1,
  available: 2,
  payment_review: 2.6,
  confirmed: 3,
  unavailable: 1,
  expired: 2,
  cancelled: 0,
};
const HEADLINE: Record<BookingStatus, [string, string]> = {
  checking: ["We're checking", "with the owner."],
  available: ["It's free!", "Lock your dates."],
  payment_review: ["Verifying", "your payment."],
  confirmed: ["You're booked.", "See you at the farm."],
  unavailable: ["Those dates", "are taken."],
  expired: ["The hold", "has lapsed."],
  cancelled: ["This booking", "is cancelled."],
};
const POLL = new Set<BookingStatus>(["checking", "payment_review", "available"]);

function Ringing() {
  return (
    <div aria-hidden="true" className="relative mx-auto h-28 w-full max-w-sm">
      <svg viewBox="0 0 320 110" className="h-full w-full">
        <path d="M60 70 Q160 -10 260 70" fill="none" stroke="var(--line)" strokeWidth="2" strokeDasharray="3 7" />
        <circle r="5" fill="var(--wheat)">
          <animateMotion dur="2.4s" repeatCount="indefinite" path="M60 70 Q160 -10 260 70" keyPoints="0;1;0" keyTimes="0;0.5;1" calcMode="spline" keySplines=".4 0 .2 1;.4 0 .2 1" />
        </circle>
        <g transform="translate(60 78)">
          <circle r="22" fill="var(--card)" stroke="var(--line)" />
          <text y="5" textAnchor="middle" fontSize="11" className="font-mono" fill="var(--muted)">
            YOU
          </text>
        </g>
        <g transform="translate(260 78)">
          <circle r="22" fill="var(--card)" stroke="var(--line)" />
          <circle r="22" fill="none" stroke="var(--sage)" strokeWidth="2" opacity=".6">
            <animate attributeName="r" values="22;34" dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values=".6;0" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <text y="5" textAnchor="middle" fontSize="10" className="font-mono" fill="var(--muted)">
            OWNER
          </text>
        </g>
        <g transform="translate(160 40)">
          <rect x="-34" y="-14" width="68" height="28" rx="14" fill="var(--ink)" />
          <text y="5" textAnchor="middle" fontSize="11" className="font-mono" fill="var(--cream)" letterSpacing="1">
            FARMHOUZE
          </text>
        </g>
      </svg>
    </div>
  );
}

const EVENT_LABEL: Record<string, string> = {
  requested: "Request sent",
  marked_available: "Owner confirmed it's free · quote sent",
  marked_unavailable: "Owner said those dates are taken",
  payment_submitted: "You shared your payment reference",
  payment_not_found: "We couldn't find the payment yet",
  confirmed: "Booked! Pass issued",
  switched_dates: "You picked new dates",
  switched_farmhouse: "You switched farmhouse",
  rechecking: "We're checking again",
  cancelled: "Cancelled",
  withdrawn: "You withdrew the request",
};

export function Tracker({ params }: { params: Promise<{ code: string }> }) {
  const { get: getFarmhouse } = useFarms();
  const { code } = use(params);
  const search = useSearchParams();
  const fresh = search.get("new") === "1";
  const [b, setBooking] = useState<PublicBooking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const prevStatus = useRef<BookingStatus | null>(null);
  const [celebrate, setCelebrate] = useState(fresh);
  /** apply a new snapshot; celebrate when it flips to booked */
  const setB = useCallback((nb: PublicBooking) => {
    if (prevStatus.current && prevStatus.current !== "confirmed" && nb.status === "confirmed") setCelebrate(true);
    prevStatus.current = nb.status;
    setBooking(nb);
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/bookings/${code}`, { cache: "no-store" });
      const json = (await res.json()) as { ok: boolean; booking?: PublicBooking; error?: string };
      if (!res.ok || !json.booking) setError(json.error ?? "We couldn't load this booking.");
      else {
        setError(null);
        setB(json.booking);
      }
    } catch {
      setError("We couldn't reach the server. We'll keep trying.");
    }
  }, [code, setB]);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  // poll while something is happening on our side; refresh when the tab comes back
  useEffect(() => {
    if (!b || !POLL.has(b.status)) return;
    const t = setInterval(load, b.status === "available" ? 60_000 : 20_000);
    const vis = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", vis);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [b, load]);

  // light the whole page by the booking's time of day
  useEffect(() => {
    const root = document.documentElement;
    if (b) {
      root.dataset.daylightFixed = String(DAYLIGHT[b.status]);
      window.dispatchEvent(new Event("fz:daylight"));
    }
    return () => {
      delete root.dataset.daylightFixed;
      window.dispatchEvent(new Event("fz:daylight"));
    };
  }, [b]);

  const ago = useAgo(b?.createdAt ?? new Date().toISOString());

  if (error && !b)
    return (
      <div className="container-x flex min-h-[70svh] flex-col items-start justify-center gap-5 pt-[var(--header-h)]">
        <p className="eyebrow text-sage">Booking {code}</p>
        <h1 className="display display-lg max-w-[16ch]">We can&apos;t find that booking.</h1>
        <p className="max-w-md text-muted">{error}</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <a href={whatsappLink(`Hi ${site.name}, I can't open my booking ${code}`)} target="_blank" rel="noopener noreferrer">
              <MessageCircle /> WhatsApp us
            </a>
          </Button>
          <Button asChild variant="outline" className="text-ink">
            <Link href="/bhopal">Find a farmhouse</Link>
          </Button>
        </div>
      </div>
    );

  if (!b)
    return (
      <div className="container-x grid min-h-[70svh] place-items-center pt-[var(--header-h)]" aria-busy="true">
        <Loader2 className="size-8 animate-spin text-sage" aria-label="Loading your booking" />
      </div>
    );

  const farm = getFarmhouse(b.farmSlug);
  const area = farm ? getArea(farm.city, farm.area) : undefined;
  const night = b.status === "confirmed";
  const [h1, h2] = HEADLINE[b.status];

  const withdraw = async () => {
    setBusy(true);
    const res = await fetch(`/api/bookings/${b.code}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "cancel" }) });
    const json = (await res.json()) as { booking?: PublicBooking };
    if (json.booking) setB(json.booking);
    setBusy(false);
  };

  return (
    <div className={cn("relative pb-24 pt-[calc(var(--header-h)+2rem)]", night && "theme-night")}>
      {night && <NightSky />}
      {celebrate && (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[60svh]">
          <LeafConfetti />
        </div>
      )}
      <div className="container-x relative">
        {/* header */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sage">
              <span>Booking {displayCode(b.code)}</span>
              <span aria-hidden="true">·</span>
              <span>requested {ago}</span>
            </p>
            <h1 className="display display-lg max-w-[14ch]" aria-live="polite">
              {h1} <span className={cn("italic-soft", night ? "text-wheat" : "text-terra")}>{h2}</span>
            </h1>
          </div>
          {farm && (
            <Link href={`/${farm.city}/${farm.slug}`} className={cn("flex items-center gap-4 rounded-[var(--radius-card)] border p-3 pr-5", night ? "border-line bg-card/40" : "border-line bg-card/80")}>
              <span className="relative block size-16 shrink-0 overflow-hidden rounded-2xl">
                <Image src={farm.cover.src} alt="" fill sizes="64px" className="object-cover" />
              </span>
              <span>
                <span className="display block text-[1.4rem] leading-none">{farm.name}</span>
                <span className="mt-1 block text-sm text-muted">
                  {area?.name} · {prettyRange(b.checkIn, b.checkOut)} · {b.guests} guests
                </span>
              </span>
            </Link>
          )}
        </div>

        {fresh && b.status === "checking" && (
          <p role="status" className="mb-8 rounded-2xl border border-sage/40 bg-sage/10 p-4">
            <strong className="font-medium">Request sent!</strong> Save this page — it updates by itself. We&apos;ll also WhatsApp you on <span className="font-mono">{b.phoneMasked}</span>.
          </p>
        )}

        {/* journey (compact: titles only) */}
        <div className={cn("mb-10 rounded-[28px] border px-5 py-6 sm:px-10", night ? "border-line bg-card/30" : "border-line bg-card/70 backdrop-blur")}>
          <DayPath progress={PROGRESS[b.status]} pulse={b.status === "checking" || b.status === "payment_review"} tone={night ? "night" : "auto"} labels={site.steps.map(({ id, time, title }) => ({ id, time, title }))} />
        </div>

        {/* current step */}
        <section aria-labelledby="step-title" className="mb-12">
          {b.status === "checking" && (
            <div className="grid items-center gap-8 rounded-[28px] border border-line bg-card p-6 sm:p-10 lg:grid-cols-[1fr_1fr]">
              <div>
                <h2 id="step-title" className="display display-md mb-3">
                  We&apos;re on the phone with {farm?.name ?? "the owner"}.
                </h2>
                <p className="mb-5 text-muted">
                  Usually within {site.booking.checkWithin} ({site.contact.hours}). This page updates by itself — no need to refresh.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" className="text-ink">
                    <a href={whatsappLink(`Hi ${site.name}! About my request ${displayCode(b.code)}: `)} target="_blank" rel="noopener noreferrer">
                      <MessageCircle /> Message us
                    </a>
                  </Button>
                  <WithdrawButton busy={busy} onConfirm={withdraw} />
                </div>
              </div>
              <Ringing />
            </div>
          )}

          {b.status === "available" && (
            <div>
              <h2 id="step-title" className="display display-md mb-2">
                Good news — {farm?.name} is free.
              </h2>
              <p className="mb-6 text-muted">Pay the advance to lock your dates. You&apos;ll get your booking pass as soon as we see it.</p>
              <PaymentStep booking={b} onUpdate={setB} />
            </div>
          )}

          {b.status === "payment_review" && (
            <div className="grid items-center gap-6 rounded-[28px] border border-line bg-card p-6 sm:p-10 md:grid-cols-[auto_1fr]">
              <span className="grid size-16 place-items-center rounded-full bg-wheat/25 text-terra">
                <Hourglass className="size-7 motion-safe:animate-[spin_3s_ease-in-out_infinite]" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <div>
                <h2 id="step-title" className="display display-md mb-2">
                  Thanks! Matching your payment.
                </h2>
                <p className="text-muted">
                  Reference <span className="font-mono text-ink">{b.paymentUtr}</span>. We check every payment by hand — usually within an hour. Your booking pass appears right here.
                </p>
              </div>
            </div>
          )}

          {b.status === "confirmed" && (
            <div>
              <h2 id="step-title" className="sr-only">
                Your booking pass
              </h2>
              <BookingPass booking={b} />
              <p className="mx-auto mt-6 max-w-2xl text-center text-night-muted">
                Bring a government ID for every adult staying over. Questions on the day? Call the caretaker or WhatsApp us.
              </p>
            </div>
          )}

          {(b.status === "unavailable" || b.status === "expired") && (
            <div className="rounded-[28px] border border-line bg-card p-6 sm:p-10">
              <h2 id="step-title" className="display display-md mb-2">
                {b.status === "unavailable" ? "Let's find you another option." : "Want those dates back?"}
              </h2>
              <p className="mb-6 text-muted">
                {b.status === "unavailable"
                  ? "Tap any option below and we'll check it straight away — it takes one tap."
                  : "The 24-hour hold ended before we received the advance. Tap below and we'll check if they're still free."}
              </p>
              {b.guestNote && <p className="mb-6 rounded-2xl border border-dashed border-line bg-cream/60 p-4">&ldquo;{b.guestNote}&rdquo; — {site.name}</p>}
              {b.status === "expired" && <CheckAgain booking={b} onUpdate={setB} />}
              <Alternatives booking={b} onUpdate={setB} />
            </div>
          )}

          {b.status === "cancelled" && (
            <div className="rounded-[28px] border border-line bg-card p-6 sm:p-10">
              <h2 id="step-title" className="display display-md mb-2">
                {b.guestNote ?? "This booking was cancelled."}
              </h2>
              <p className="mb-6 text-muted">Plans change. Whenever you&apos;re ready, there are more farmhouses waiting.</p>
              <Button asChild>
                <Link href="/bhopal">
                  Find a farmhouse <ArrowRight />
                </Link>
              </Button>
            </div>
          )}
        </section>

        {/* timeline */}
        <section aria-labelledby="timeline-title" className="mx-auto max-w-2xl">
          <h2 id="timeline-title" className="eyebrow mb-4 text-muted">
            What&apos;s happened
          </h2>
          <ol className="relative border-l border-line pl-6">
            {[...b.timeline].reverse().map((e, i) => (
              <li key={`${e.type}-${e.at}-${i}`} className="relative pb-5">
                <span aria-hidden="true" className={cn("absolute -left-[31px] top-1.5 size-3 rounded-full border-2", i === 0 ? "border-wheat bg-wheat" : "border-line bg-card")} />
                <p className={i === 0 ? "font-medium" : "text-muted"}>{EVENT_LABEL[e.type] ?? e.type}</p>
                <p className="eyebrow text-[0.68rem] text-muted">{new Date(e.at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 flex items-center gap-2 text-sm text-muted">
            <PhoneCall className="size-4" strokeWidth={1.5} aria-hidden="true" /> Questions? WhatsApp us with your code {displayCode(b.code)}.
          </p>
        </section>
      </div>
    </div>
  );
}

function WithdrawButton({ busy, onConfirm }: { busy: boolean; onConfirm: () => void }) {
  const [ask, setAsk] = useState(false);
  if (!ask)
    return (
      <Button variant="ghost" className="text-muted" onClick={() => setAsk(true)}>
        <X /> Withdraw request
      </Button>
    );
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-terra/40 px-2 py-1">
      <span className="pl-2 text-sm">Withdraw this request?</span>
      <Button
        size="sm"
        variant="ghost"
        className="text-terra"
        disabled={busy}
        onClick={onConfirm}
      >
        Yes
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setAsk(false)}>
        No
      </Button>
    </span>
  );
}

function CheckAgain({ booking, onUpdate }: { booking: PublicBooking; onUpdate: (b: PublicBooking) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <div className="mb-8">
      <Button
        size="lg"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setErr("");
          const res = await fetch(`/api/bookings/${booking.code}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "switch", from: booking.checkIn, to: booking.checkOut }) });
          const json = (await res.json()) as { booking?: PublicBooking; error?: string };
          if (json.booking) onUpdate(json.booking);
          else setErr(json.error ?? "Couldn't do that.");
          setBusy(false);
        }}
      >
        {busy ? <Loader2 className="animate-spin" /> : <RotateCcw />} Check {prettyRange(booking.checkIn, booking.checkOut)} again
      </Button>
      {err && <p className="mt-2 text-sm text-terra">{err}</p>}
    </div>
  );
}

function NightSky() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-x-0 bottom-[-40%] mx-auto aspect-square w-[min(140vw,1400px)] rounded-full"
        style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--ember) 40%, transparent), transparent 70%)", animation: "firelight 4s ease-in-out infinite" }}
      />
    </div>
  );
}
