"use client";

import { ArrowRight, Database, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useAgo, useNow } from "@/components/booking/useCountdown";
import { Button } from "@/components/ui/button";
import { useFarms } from "@/lib/farms/client";
import { formatPrice } from "@/content/site";
import { prettyRange, todayIST } from "@/lib/booking/dates";
import { displayCode } from "@/lib/booking/messages";
import type { Booking, BookingStatus } from "@/lib/booking/types";
import { cn } from "@/lib/utils";
import { AdminShell } from "./AdminShell";
import { StatusPill } from "./StatusPill";
import { useAdminData } from "./useAdmin";

const TABS: { id: string; label: string; match: (b: Booking) => boolean }[] = [
  { id: "action", label: "Needs you", match: (b) => b.status === "checking" || b.status === "payment_review" },
  { id: "payment", label: "Awaiting payment", match: (b) => b.status === "available" },
  { id: "booked", label: "Booked", match: (b) => b.status === "confirmed" && (b.checkOut ?? b.checkIn) >= todayIST() },
  { id: "closed", label: "Closed", match: (b) => (["unavailable", "expired", "cancelled"] as BookingStatus[]).includes(b.status) || (b.status === "confirmed" && (b.checkOut ?? b.checkIn) < todayIST()) },
  { id: "all", label: "All", match: () => true },
];

function Row({ b }: { b: Booking }) {
  const { get: getFarmhouse } = useFarms();
  const ago = useAgo(b.createdAt);
  const farm = getFarmhouse(b.farmSlug);
  const now = useNow();
  const urgent = b.status === "checking" && now - new Date(b.createdAt).getTime() > 2 * 3600_000;
  return (
    <li>
      <Link href={`/admin/bookings/${b.id}`} className={cn("group grid gap-3 rounded-[var(--radius-card)] border bg-card p-4 transition-shadow hover:shadow-soft sm:grid-cols-[1.2fr_1fr_auto] sm:items-center sm:p-5", urgent ? "border-terra/60" : "border-line")}>
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <StatusPill status={b.status} />
            <span className="eyebrow text-[0.66rem] text-muted">{displayCode(b.code)}</span>
            {urgent && <span className="eyebrow text-[0.66rem] text-terra">Over 2 hrs!</span>}
          </div>
          <p className="truncate font-medium">
            {farm?.name ?? b.farmSlug} · {prettyRange(b.checkIn, b.checkOut, { weekday: true })}
          </p>
          <p className="truncate text-sm text-muted">
            {b.guests} guests{b.occasion ? ` · ${b.occasion}` : ""}
          </p>
        </div>
        <div className="min-w-0 text-sm">
          <p className="truncate font-medium">{b.name}</p>
          <p className="font-mono text-muted">{b.phone}</p>
        </div>
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <span className="text-right text-sm text-muted">
            {b.quoteTotal ? <span className="block font-mono text-ink">{formatPrice(b.quoteTotal)}</span> : null}
            {ago}
          </span>
          <ArrowRight className="size-5 text-muted transition-transform group-hover:translate-x-1" strokeWidth={1.5} aria-hidden="true" />
        </div>
      </Link>
    </li>
  );
}

export function Inbox() {
  const { data, error, needsLogin, reload } = useAdminData<{ bookings: Booking[]; dbConfigured: boolean }>("/api/admin/bookings", 20_000);
  const [tab, setTab] = useState("action");
  const list = useMemo(() => data?.bookings ?? [], [data]);
  const counts = Object.fromEntries(TABS.map((t) => [t.id, list.filter(t.match).length]));
  const shown = list.filter(TABS.find((t) => t.id === tab)!.match);
  const month = new Date().toISOString().slice(0, 7);
  const stats = [
    { label: "New today", value: list.filter((b) => b.createdAt.slice(0, 10) === new Date().toISOString().slice(0, 10)).length },
    { label: "Need you now", value: counts.action },
    { label: "Booked this month", value: list.filter((b) => b.status === "confirmed" && (b.confirmedAt ?? "").startsWith(month)).length },
    { label: "Advances this month", value: formatPrice(list.filter((b) => b.status === "confirmed" && (b.confirmedAt ?? "").startsWith(month)).reduce((s, b) => s + (b.advance ?? 0), 0)) },
  ];

  return (
    <AdminShell
      needsLogin={needsLogin}
      onLogin={reload}
      banner={
        data && !data.dbConfigured ? (
          <p className="mb-6 flex items-start gap-3 rounded-2xl border border-terra/50 bg-terra/5 p-4">
            <Database className="mt-0.5 size-5 shrink-0 text-terra" strokeWidth={1.5} aria-hidden="true" />
            <span>
              <strong className="font-medium">No database connected.</strong> Guests can&apos;t send requests yet (they&apos;re shown a WhatsApp button instead). Add a Postgres database and set <code className="font-mono">DATABASE_URL</code> — see the README.
            </span>
          </p>
        ) : null
      }
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display display-md">Bookings</h1>
        <Button variant="ghost" size="sm" className="text-muted" onClick={reload}>
          <RefreshCw /> Refresh
        </Button>
      </div>
      <dl className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-[var(--radius-card)] border border-line bg-card p-4">
            <dt className="text-sm text-muted">{s.label}</dt>
            <dd className="display mt-1 text-[2rem] leading-none tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>
      <div role="group" aria-label="Filter bookings" className="no-scrollbar -mx-[var(--gutter)] mb-6 flex gap-2 overflow-x-auto px-[var(--gutter)]">
        {TABS.map((t) => (
          <button key={t.id} type="button" aria-pressed={tab === t.id} onClick={() => setTab(t.id)} className={cn("min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium", tab === t.id ? "border-ink bg-ink text-cream" : "border-line bg-card text-ink")}>
            {t.label} <span className="ml-1 font-mono opacity-70">{counts[t.id]}</span>
          </button>
        ))}
      </div>
      {error && <p className="mb-4 text-terra">{error}</p>}
      {!data ? (
        <p className="text-muted">Loading…</p>
      ) : shown.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-line p-10 text-center text-muted">{tab === "action" ? "Nothing waiting on you. 🌾" : "Nothing here."}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((b) => (
            <Row key={b.id} b={b} />
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
