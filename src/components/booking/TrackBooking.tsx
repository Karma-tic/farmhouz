"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

/** Footer box: type a booking code (FZ-XXXX-XXXX) to open its tracking page. */
export function TrackBooking() {
  const router = useRouter();
  const id = useId();
  const [v, setV] = useState("");
  const [err, setErr] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const code = v.toUpperCase().replace(/^FZ/, "").replace(/[^0-9A-Z]/g, "");
        if (code.length !== 8) return setErr("Codes look like FZ-7K3M-9QXA");
        router.push(`/booking/${code}`);
      }}
    >
      <label htmlFor={id} className="mb-2 block text-sm text-night-muted">
        Your booking code (it&apos;s in your WhatsApp / email)
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          value={v}
          onChange={(e) => {
            setV(e.target.value);
            setErr("");
          }}
          placeholder="FZ-XXXX-XXXX"
          autoComplete="off"
          className="min-h-11 w-full rounded-full border border-line bg-transparent px-4 font-mono uppercase tracking-wider text-moon placeholder:text-night-muted/70 focus-visible:border-wheat focus-visible:outline-none"
          aria-invalid={!!err}
          aria-describedby={err ? `${id}-err` : undefined}
        />
        <button type="submit" aria-label="Open booking" className="grid size-11 shrink-0 place-items-center rounded-full bg-wheat text-on-wheat">
          <ArrowRight className="size-5" strokeWidth={1.5} />
        </button>
      </div>
      {err && (
        <p id={`${id}-err`} className="mt-2 text-sm text-ember">
          {err}
        </p>
      )}
    </form>
  );
}
