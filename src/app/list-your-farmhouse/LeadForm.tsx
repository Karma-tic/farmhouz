"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { Field, fieldBase } from "@/components/enquiry/EnquiryForm";
import { Button } from "@/components/ui/button";
import { getCity } from "@/content/cities";
import { leadSchema, type LeadInput } from "@/lib/booking/schema";
import { cn } from "@/lib/utils";

export function LeadForm() {
  const uid = useId();
  const id = (n: string) => `${uid}-${n}`;
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput>({ resolver: zodResolver(leadSchema), mode: "onTouched", defaultValues: { name: "", phone: "", farmName: "", area: "", photosLink: "", notes: "", company: "" } });

  if (done)
    return (
      <div role="status" className="flex flex-col items-start justify-center gap-4">
        <span className="grid size-14 place-items-center rounded-full bg-sage text-cream">
          <Check className="size-7" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <p className="display display-md">Thank you!</p>
        <p className="text-muted">We&apos;ll call you soon to plan a visit.</p>
      </div>
    );

  return (
    <form
      noValidate
      className="grid grid-cols-2 gap-x-4 gap-y-5"
      onSubmit={handleSubmit(async (data) => {
        setErr("");
        const res = await fetch("/api/owner-leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
        if (res.ok && json.ok) setDone(true);
        else setErr(json.error ?? "Something went wrong. Please try again.");
      })}
    >
      <Field label="Your name" id={id("n")} error={errors.name?.message} className="col-span-2 sm:col-span-1">
        <input id={id("n")} autoComplete="name" className={fieldBase} aria-invalid={!!errors.name} {...register("name")} />
      </Field>
      <Field label="Phone" id={id("p")} error={errors.phone?.message} className="col-span-2 sm:col-span-1">
        <input id={id("p")} type="tel" inputMode="tel" autoComplete="tel-national" className={cn(fieldBase, "font-mono")} aria-invalid={!!errors.phone} {...register("phone")} />
      </Field>
      <Field label="Farmhouse name" id={id("f")} error={errors.farmName?.message} className="col-span-2 sm:col-span-1">
        <input id={id("f")} className={fieldBase} aria-invalid={!!errors.farmName} {...register("farmName")} />
      </Field>
      <Field label="Area" id={id("a")} className="col-span-2 sm:col-span-1">
        <input id={id("a")} className={fieldBase} list={id("areas")} placeholder="Kerwa, Kolar Road…" {...register("area")} />
        <datalist id={id("areas")}>
          {getCity("bhopal")?.areas.map((a) => (
            <option key={a.slug} value={a.name} />
          ))}
        </datalist>
      </Field>
      <Field label="Guests it can host" id={id("g")} error={errors.guests?.message} className="col-span-2 sm:col-span-1">
        <input id={id("g")} type="number" inputMode="numeric" className={cn(fieldBase, "font-mono")} {...register("guests", { setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)) })} />
      </Field>
      <div className="col-span-2 flex items-end sm:col-span-1">
        <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-line bg-card px-4">
          <input type="checkbox" className="size-5 accent-[var(--sage)]" {...register("hasPool")} /> It has a pool
        </label>
      </div>
      <Field label="Photos link (optional)" id={id("ph")} error={errors.photosLink?.message} hint="Google Drive, Instagram or a website" className="col-span-2">
        <input id={id("ph")} type="url" className={fieldBase} placeholder="https://" {...register("photosLink")} />
      </Field>
      <Field label="Anything else? (optional)" id={id("no")} className="col-span-2">
        <textarea id={id("no")} rows={3} className={cn(fieldBase, "py-3")} {...register("notes")} />
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
        {isSubmitting && <Loader2 className="animate-spin" />} Send application
      </Button>
    </form>
  );
}
