"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarDays, Check, Loader2, MessageCircle, Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Popover } from "radix-ui";
import { useEffect, useId, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatPrice, site, whatsappLink, type Package, type PackageId } from "@/content/site";
import { enquirySchema, nightsBetween, type Enquiry, type EnquiryInput } from "@/lib/enquiry/schema";
import { cn } from "@/lib/utils";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { LeafConfetti } from "./LeafConfetti";
import { fromIso, toIso, useBooked } from "./useBooked";

const packages = site.packages as Package[];

const fieldBase =
  "min-h-12 w-full rounded-2xl border border-line bg-card px-4 text-ink placeholder:text-muted/80 transition-[border-color,box-shadow] duration-[var(--dur-micro)] focus-visible:border-sage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/30 aria-[invalid=true]:border-terra";

function Field({
  label,
  hint,
  error,
  id,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="eyebrow text-muted">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-terra">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function summaryText(v: Partial<EnquiryInput>) {
  const pkg = packages.find((p) => p.id === v.packageId);
  const nights = nightsBetween(v.from, v.to || undefined);
  const parts: string[] = [];
  if (v.from) parts.push(nights ? `${nights} night${nights > 1 ? "s" : ""}` : "Day visit");
  if (pkg) parts.push(pkg.name);
  let price: number | null = null;
  if (pkg?.priceFrom != null) price = pkg.pricing === "per-night" ? pkg.priceFrom * Math.max(1, nights) : pkg.priceFrom;
  return { line: parts.join(" · "), price: formatPrice(price) };
}

function whatsappText(v: Partial<EnquiryInput>) {
  const pkg = packages.find((p) => p.id === v.packageId);
  return [
    `Hi ${site.name}! I'd like to book.`,
    `Name: ${v.name ?? ""}`,
    `Dates: ${v.from ?? "__"}${v.to ? ` to ${v.to}` : ""}`,
    `Package: ${pkg?.name ?? "__"}`,
    `Guests: ${v.guests ?? "__"}`,
    v.occasion ? `Occasion: ${v.occasion}` : "",
    v.message ? `Note: ${v.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

const prettyDate = (s?: string) => (s ? format(fromIso(s) as Date, "EEE, d MMM") : "");

export function EnquiryForm({
  range,
  onRangeChange,
  defaultPackage,
  defaultOccasion,
  compact = false,
}: {
  /** When given, dates are controlled by an external calendar (the Booking section). */
  range?: DateRange;
  onRangeChange?: (r: DateRange | undefined) => void;
  defaultPackage?: PackageId;
  defaultOccasion?: string;
  compact?: boolean;
}) {
  const uid = useId();
  const id = (n: string) => `${uid}-${n}`;
  const controlled = onRangeChange !== undefined;
  const { dates: bookedDates } = useBooked();
  const [localRange, setLocalRange] = useState<DateRange | undefined>();
  const [sent, setSent] = useState<Enquiry | null>(null);
  const [calOpen, setCalOpen] = useState(false);
  const activeRange = controlled ? range : localRange;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryInput, unknown, Enquiry>({
    resolver: zodResolver(enquirySchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      phone: "",
      from: "",
      to: "",
      packageId: defaultPackage ?? "night-stay",
      guests: 10,
      occasion: defaultOccasion ?? "",
      message: "",
      company: "",
    },
  });

  // keep RHF in sync with whichever calendar is driving the dates
  useEffect(() => {
    setValue("from", toIso(activeRange?.from), { shouldValidate: !!activeRange?.from });
    const to = activeRange?.to && toIso(activeRange.to) !== toIso(activeRange.from) ? toIso(activeRange.to) : "";
    setValue("to", to);
  }, [activeRange, setValue]);

  useEffect(() => {
    if (defaultPackage) setValue("packageId", defaultPackage);
    if (defaultOccasion) setValue("occasion", defaultOccasion);
  }, [defaultPackage, defaultOccasion, setValue]);

  const values = useWatch({ control });
  const summary = summaryText(values);

  const onSubmit = async (data: Enquiry) => {
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Something went wrong");
      setSent(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't send. Please try WhatsApp.");
    }
  };

  const setRange = (r: DateRange | undefined) => (controlled ? onRangeChange?.(r) : setLocalRange(r));

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex min-h-[420px] flex-col items-start justify-center gap-5 py-6"
            role="status"
          >
            <LeafConfetti />
            <span className="grid size-14 place-items-center rounded-full bg-sage text-cream">
              <Check className="size-7" strokeWidth={1.5} aria-hidden="true" />
            </span>
            <h3 className="display display-md">Thank you, {sent.name.split(" ")[0]}.</h3>
            <p className="max-w-sm text-muted">
              {site.contact.responseTime} on <span className="font-mono text-ink">{sent.phone}</span> with a final quote.
            </p>
            <p className="eyebrow text-sage">{summaryText(sent).line}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <a href={whatsappLink(whatsappText(sent))} target="_blank" rel="noopener noreferrer">
                  <MessageCircle /> Also send on WhatsApp
                </a>
              </Button>
              <Button variant="ghost" onClick={() => setSent(null)}>
                New enquiry
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            exit={{ opacity: 0, y: -12 }}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="grid grid-cols-2 gap-x-4 gap-y-5"
            aria-label="Booking enquiry"
          >
            <Field label="Your name" id={id("name")} error={errors.name?.message} className="col-span-2 sm:col-span-1">
              <input
                id={id("name")}
                autoComplete="name"
                className={fieldBase}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? `${id("name")}-error` : undefined}
                {...register("name")}
              />
            </Field>
            <Field
              label="Phone"
              id={id("phone")}
              error={errors.phone?.message}
              hint="10-digit mobile, e.g. 98765 43210"
              className="col-span-2 sm:col-span-1"
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-muted">+91</span>
                <input
                  id={id("phone")}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  className={cn(fieldBase, "pl-14 font-mono tracking-wide")}
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? `${id("phone")}-error` : `${id("phone")}-hint`}
                  {...register("phone")}
                />
              </div>
            </Field>

            {/* Dates */}
            <Field
              label={controlled ? "Dates (pick on the calendar)" : "Dates"}
              id={id("dates")}
              error={errors.from?.message ?? errors.to?.message}
              className="col-span-2"
            >
              {controlled ? (
                <div
                  id={id("dates")}
                  tabIndex={-1}
                  className={cn(fieldBase, "flex items-center gap-3 text-[0.95rem]", errors.from && "border-terra")}
                  aria-live="polite"
                >
                  <CalendarDays className="size-4 text-sage" strokeWidth={1.5} aria-hidden="true" />
                  {values.from ? (
                    <span>
                      {prettyDate(values.from)}
                      {values.to ? ` → ${prettyDate(values.to)}` : " · pick check-out, or leave for a day visit"}
                    </span>
                  ) : (
                    <span className="text-muted">Select check-in on the calendar</span>
                  )}
                </div>
              ) : (
                <Popover.Root open={calOpen} onOpenChange={setCalOpen}>
                  <Popover.Trigger asChild>
                    <button
                      id={id("dates")}
                      type="button"
                      className={cn(fieldBase, "flex items-center gap-3 text-left text-[0.95rem]")}
                      aria-invalid={!!errors.from}
                    >
                      <CalendarDays className="size-4 text-sage" strokeWidth={1.5} aria-hidden="true" />
                      {values.from ? (
                        <span>
                          {prettyDate(values.from)}
                          {values.to ? ` → ${prettyDate(values.to)}` : ""}
                        </span>
                      ) : (
                        <span className="text-muted">Choose dates</span>
                      )}
                    </button>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content
                      sideOffset={8}
                      align="start"
                      collisionPadding={12}
                      className="z-[95] rounded-[var(--radius-card)] border border-line bg-card p-4 text-ink shadow-lift"
                    >
                      <AvailabilityCalendar range={localRange} onChange={setRange} booked={bookedDates} months={1} />
                      <div className="mt-3 flex justify-end">
                        <Button size="sm" variant="sage" onClick={() => setCalOpen(false)}>
                          Done
                        </Button>
                      </div>
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              )}
            </Field>

            <Field label="Package" id={id("pkg")} error={errors.packageId?.message} className="col-span-2 sm:col-span-1">
              <select id={id("pkg")} className={cn(fieldBase, "appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10")} style={{ backgroundImage: "var(--chevron)" }} {...register("packageId")}>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Guests" id={id("guests")} error={errors.guests?.message} className="col-span-2 sm:col-span-1">
              <Controller
                control={control}
                name="guests"
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0 text-ink"
                      aria-label="Fewer guests"
                      onClick={() => field.onChange(Math.max(1, (Number(field.value) || 1) - 1))}
                    >
                      <Minus />
                    </Button>
                    <input
                      id={id("guests")}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={500}
                      className={cn(fieldBase, "text-center font-mono [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none")}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                      onBlur={field.onBlur}
                      aria-invalid={!!errors.guests}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0 text-ink"
                      aria-label="More guests"
                      onClick={() => field.onChange(Math.min(500, (Number(field.value) || 0) + 1))}
                    >
                      <Plus />
                    </Button>
                  </div>
                )}
              />
            </Field>

            <Field label="Occasion (optional)" id={id("occ")} className="col-span-2">
              <input id={id("occ")} className={fieldBase} placeholder="Birthday, haldi, team offsite…" list={id("occ-list")} {...register("occasion")} />
              <datalist id={id("occ-list")}>
                {site.celebrations.items.map((c) => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </Field>

            {!compact && (
              <Field label="Message (optional)" id={id("msg")} error={errors.message?.message} className="col-span-2">
                <textarea id={id("msg")} rows={3} className={cn(fieldBase, "py-3")} placeholder="Anything we should know? Food, decor, timings…" {...register("message")} />
              </Field>
            )}

            {/* honeypot */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor={id("company")}>Company</label>
              <input id={id("company")} tabIndex={-1} autoComplete="off" {...register("company")} />
            </div>

            <div className="col-span-2 flex flex-col gap-4 rounded-2xl border border-dashed border-line bg-cream/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div aria-live="polite">
                <p className="eyebrow text-sage">{summary.line || "Pick dates & a package"}</p>
                <p className="mt-1 font-mono text-sm uppercase tracking-[0.12em] text-muted">
                  from <span className="text-base font-medium text-ink">{summary.price}</span> · final quote on call
                </p>
              </div>
              <Button type="submit" size="lg" disabled={isSubmitting} data-cursor="Book">
                {isSubmitting ? <Loader2 className="animate-spin" /> : null}
                {isSubmitting ? "Sending…" : "Send enquiry"}
              </Button>
            </div>
            <p className="col-span-2 text-sm text-muted">
              No account, no payment online. Prefer chatting?{" "}
              <a className="link-draw text-sage underline-offset-4" href={whatsappLink(whatsappText(values))} target="_blank" rel="noopener noreferrer">
                Send this on WhatsApp
              </a>
              .
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
