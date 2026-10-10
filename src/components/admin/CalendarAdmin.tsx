"use client";

import { Loader2 } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { fromIso, loadBooked, toIso } from "@/components/enquiry/useBooked";
import { fieldBase } from "@/components/enquiry/EnquiryForm";
import { Button } from "@/components/ui/button";
import { farmhousesIn } from "@/content/farmhouses";
import { cn } from "@/lib/utils";
import { AdminShell } from "./AdminShell";
import { adminFetch, useAdminData } from "./useAdmin";

type Block = { day: string; reason: string; bookingId: string | null };

/** Block / unblock dates per farmhouse. Booked dates (from confirmed bookings) are locked. */
export function CalendarAdmin() {
  const id = useId();
  const farms = farmhousesIn("bhopal");
  const [farm, setFarm] = useState(farms[0].slug);
  const { data, setData, needsLogin, reload, error } = useAdminData<{ blocks: Block[] }>(`/api/admin/blocks?farm=${farm}`, 0);
  const [pending, setPending] = useState<{ add: Set<string>; remove: Set<string> }>({ add: new Set(), remove: new Set() });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");


  const blocks = useMemo(() => data?.blocks ?? [], [data]);
  const bookingDays = blocks.filter((b) => b.bookingId).map((b) => b.day);
  const manualDays = blocks.filter((b) => !b.bookingId).map((b) => b.day);
  const shownManual = [...manualDays.filter((d) => !pending.remove.has(d)), ...pending.add];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const toggle = (day: Date) => {
    const s = toIso(day);
    if (bookingDays.includes(s)) return setMsg("That day has a confirmed booking — cancel the booking to free it.");
    setMsg("");
    setPending((p) => {
      const add = new Set(p.add), remove = new Set(p.remove);
      if (manualDays.includes(s)) {
        if (remove.has(s)) remove.delete(s);
        else remove.add(s);
      } else if (add.has(s)) add.delete(s);
      else add.add(s);
      return { add, remove };
    });
  };

  const save = async () => {
    setBusy(true);
    try {
      const d = await adminFetch<{ blocks: Block[] }>("/api/admin/blocks", { method: "POST", body: JSON.stringify({ farm, block: [...pending.add], unblock: [...pending.remove] }) });
      setData(d);
      setPending({ add: new Set(), remove: new Set() });
      setMsg("Saved. Guests see these dates as booked.");
      loadBooked(true);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };
  const dirty = pending.add.size + pending.remove.size;

  return (
    <AdminShell needsLogin={needsLogin} onLogin={reload}>
      <h1 className="display display-md mb-2">Calendar</h1>
      <p className="mb-6 text-muted">Tap days to block or unblock them (owner&apos;s own bookings, maintenance…). Guests can&apos;t request blocked days.</p>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label htmlFor={id} className="sr-only">
          Farmhouse
        </label>
        <select id={id} value={farm} onChange={(e) => {
            setFarm(e.target.value);
            setPending({ add: new Set(), remove: new Set() });
            setMsg("");
          }} className={cn(fieldBase, "max-w-xs")}>
          {farms.map((f) => (
            <option key={f.slug} value={f.slug}>
              {f.name}
            </option>
          ))}
        </select>
        <Button onClick={save} disabled={!dirty || busy} variant="sage">
          {busy && <Loader2 className="animate-spin" />} Save {dirty ? `(${dirty})` : ""}
        </Button>
        {msg && (
          <p className="text-sm text-muted" role="status">
            {msg}
          </p>
        )}
      </div>
      {error && <p className="text-terra">{error}</p>}
      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line bg-card p-4 sm:p-6">
        <DayPicker
          mode="single"
          onDayClick={toggle}
          numberOfMonths={3}
          startMonth={today}
          disabled={{ before: today }}
          weekStartsOn={1}
          modifiers={{ manual: shownManual.map((d) => fromIso(d) as Date), booking: bookingDays.map((d) => fromIso(d) as Date) }}
          modifiersClassNames={{ manual: "fz-day-manual", booking: "fz-day-booking" }}
          classNames={{ months: "rdp-months !max-w-none flex flex-wrap gap-x-10 gap-y-6" }}
        />
        <ul className="eyebrow mt-4 flex flex-wrap gap-5 text-muted">
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-terra" aria-hidden="true" /> Blocked by you
          </li>
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-sage" aria-hidden="true" /> Confirmed booking
          </li>
        </ul>
      </div>
    </AdminShell>
  );
}
