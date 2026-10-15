"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, MessageCircle } from "lucide-react";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { site, whatsappLink } from "@/content/site";
import { SOURCES, waitlistSchema, type WaitlistInput } from "@/lib/booking/schema";
import { cn } from "@/lib/utils";
import { Field, fieldBase } from "./EnquiryForm";

const OCCASIONS = [...new Set([...Object.values(site.occasionLabels), "Just exploring"])];

/** Pre-launch: guests leave their number and plans; we WhatsApp them when bookings open. */
export function WaitlistForm({ defaultOccasion, compact }: { defaultOccasion?: string; compact?: boolean }) {
  const uid = useId();
  const id = (n: string) => `${uid}-${n}`;
  const [done, setDone] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const occasions = defaultOccasion && !OCCASIONS.includes(defaultOccasion) ? [defaultOccasion, ...OCCASIONS] : OCCASIONS;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WaitlistInput>({
    resolver: zodResolver(waitlistSchema),
    mode: "onTouched",
    defaultValues: { name: "", phone: "", occasion: defaultOccasion ?? "", when: "", notes: "", source: "", company: "" },
  });

  if (done)
    return (
      <div role="status" className="flex flex-col items-start gap-4 py-4">
        <span className="grid size-14 place-items-center rounded-full bg-sage text-cream">
          <Check className="size-7" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <p className="display display-md">You&apos;re on the list, {done}.</p>
        <p className="max-w-[44ch] text-muted">
          We&apos;ll WhatsApp you as soon as bookings open — before we announce it anywhere else. Planning something soon? Message us and we&apos;ll try to help right away.
        </p>
        <Button asChild variant="outline" className="text-ink">
          <a href={whatsappLink("Hi Farmhouze! I just joined the waitlist. I'm planning: ")} target="_blank" rel="noopener noreferrer">
            <MessageCircle /> WhatsApp us
          </a>
        </Button>
      </div>
    );

  return (
    <form
      noValidate
      className="grid grid-cols-2 gap-x-4 gap-y-5"
      onSubmit={handleSubmit(async (data) => {
        setErr("");
        const res = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, ref: new URLSearchParams(window.location.search).get("ref")?.slice(0, 60) ?? "" }) });
        const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
        if (res.ok && json.ok) setDone(data.name.split(" ")[0]);
        else setErr(json.error ?? "Something went wrong. Please try again, or WhatsApp us.");
      })}
    >
      <Field label="Your name" id={id("n")} error={errors.name?.message} className="col-span-2 sm:col-span-1">
        <input id={id("n")} autoComplete="name" className={fieldBase} aria-invalid={!!errors.name} {...register("name")} />
      </Field>
      <Field label="WhatsApp number" id={id("p")} error={errors.phone?.message} className="col-span-2 sm:col-span-1">
        <input id={id("p")} type="tel" inputMode="tel" autoComplete="tel-national" className={cn(fieldBase, "font-mono")} aria-invalid={!!errors.phone} {...register("phone")} />
      </Field>
      <Field label="What are you planning?" id={id("o")} className="col-span-2 sm:col-span-1">
        <select id={id("o")} className={fieldBase} {...register("occasion")}>
          <option value="">Choose one</option>
          {occasions.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>
      <Field label="Roughly when?" id={id("w")} className="col-span-2 sm:col-span-1">
        <input id={id("w")} className={fieldBase} placeholder="e.g. 14 Dec, or any weekend in Jan" {...register("when")} />
      </Field>
      {!compact && (
        <Field label="Guests (optional)" id={id("g")} error={errors.guests?.message} className="col-span-2 sm:col-span-1">
          <input id={id("g")} type="number" inputMode="numeric" className={cn(fieldBase, "font-mono")} {...register("guests", { setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)) })} />
        </Field>
      )}
      <Field label="Anything else? (optional)" id={id("x")} className={cn("col-span-2", !compact && "sm:col-span-1")}>
        <input id={id("x")} className={fieldBase} placeholder="Pool, area, budget…" {...register("notes")} />
      </Field>
      <Field label="How did you hear about us?" id={id("src")} className="col-span-2">
        <select id={id("src")} className={fieldBase} {...register("source")}>
          <option value="">Choose one (optional)</option>
          {SOURCES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </Field>
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <input tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>
      {err && (
        <p role="alert" className="col-span-2 text-sm text-terra">
          {err}
        </p>
      )}
      <Button type="submit" size="lg" className="col-span-2 sm:col-span-1" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" />} Get early access
      </Button>
      <p className="col-span-2 self-center text-sm text-muted sm:col-span-1">Free. We only message you about bookings opening.</p>
    </form>
  );
}
