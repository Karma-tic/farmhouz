"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ArrowRight, CalendarDays, Loader2, MessageCircle, Minus, Plus, ShieldCheck } from "lucide-react";
import { Popover } from "radix-ui";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { packagesFor } from "@/content/farmhouses";
import { useFarms } from "@/lib/farms/client";
import { formatPrice, site, whatsappLink } from "@/content/site";
import type { Farmhouse, Package, PackageId } from "@/content/types";
import { nightsBetween } from "@/lib/booking/dates";
import { requestSchema, type RequestData, type RequestInput } from "@/lib/booking/schema";
import { cn } from "@/lib/utils";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { fromIso, loadBooked, toIso, useBooked } from "./useBooked";

export const fieldBase =
  "min-h-12 w-full rounded-2xl border border-line bg-card px-4 text-ink placeholder:text-muted/80 transition-[border-color,box-shadow] duration-[var(--dur-micro)] focus-visible:border-sage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/30 aria-[invalid=true]:border-terra";

export function Field({ label, hint, error, id, children, className }: { label: string; hint?: string; error?: string; id: string; children: React.ReactNode; className?: string }) {
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

const prettyDate = (s?: string) => (s ? format(fromIso(s) as Date, "EEE, d MMM") : "");

function estimate(farm: Farmhouse | undefined, packageId: string | undefined, from?: string, to?: string) {
  if (!farm) return { line: "", price: "₹—" };
  const pkg = packagesFor(farm).find((p) => p.id === packageId);
  const nights = nightsBetween(from, to || undefined);
  const parts = [from ? (nights ? `${nights} night${nights > 1 ? "s" : ""}` : "Day visit") : "", pkg?.name ?? ""].filter(Boolean);
  let price: number | null = null;
  if (pkg?.priceFrom != null) price = pkg.pricing === "per-night" ? pkg.priceFrom * Math.max(1, nights) : pkg.priceFrom;
  return { line: parts.join(" · "), price: formatPrice(price) };
}

function whatsappText(v: Partial<RequestInput>, farm: Farmhouse | undefined) {
  return [`Hi ${site.name}! I'd like to book ${farm?.name ?? "a farmhouse"}.`, `Dates: ${v.from || "__"}${v.to ? ` to ${v.to}` : ""}`, `Guests: ${v.guests ?? "__"}`, v.occasion ? `Occasion: ${v.occasion}` : "", v.name ? `Name: ${v.name}` : ""]
    .filter(Boolean)
    .join("\n");
}

/**
 * "Request to book" — no payment. Creates a booking in "checking" and takes the
 * guest to their live tracking page.
 */
export function EnquiryForm({
  farmSlug,
  range,
  onRangeChange,
  defaultPackage,
  defaultOccasion,
  compact = false,
}: {
  /** Fixed farmhouse; when omitted the guest can pick one */
  farmSlug?: string;
  /** When given, dates are controlled by an external calendar */
  range?: DateRange;
  onRangeChange?: (r: DateRange | undefined) => void;
  defaultPackage?: PackageId;
  defaultOccasion?: string;
  compact?: boolean;
}) {
  const { get: getFarmhouse, inCity: farmhousesIn } = useFarms();
  const uid = useId();
  const id = (n: string) => `${uid}-${n}`;
  const router = useRouter();
  const controlled = onRangeChange !== undefined;
  const [localRange, setLocalRange] = useState<DateRange | undefined>();
  const [calOpen, setCalOpen] = useState(false);
  const [serverError, setServerError] = useState<{ message: string; noDb?: boolean } | null>(null);
  const activeRange = controlled ? range : localRange;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<RequestInput, unknown, RequestData>({
    resolver: zodResolver(requestSchema),
    mode: "onTouched",
    defaultValues: {
      farmSlug: farmSlug ?? "",
      name: "",
      phone: "",
      email: "",
      from: "",
      to: "",
      packageId: defaultPackage ?? "night-stay",
      guests: 10,
      occasion: defaultOccasion ?? "",
      message: "",
      company: "",
    },
  });

  const values = useWatch({ control });
  const farm = values.farmSlug ? getFarmhouse(values.farmSlug) : undefined;
  const pkgs = useMemo(() => (farm ? packagesFor(farm) : []), [farm]);
  const { dates: bookedDates } = useBooked(values.farmSlug || undefined);

  useEffect(() => {
    setValue("from", toIso(activeRange?.from), { shouldValidate: !!activeRange?.from });
    const to = activeRange?.to && toIso(activeRange.to) !== toIso(activeRange.from) ? toIso(activeRange.to) : "";
    setValue("to", to);
  }, [activeRange, setValue]);

  useEffect(() => {
    if (defaultPackage) setValue("packageId", defaultPackage);
    if (defaultOccasion) setValue("occasion", defaultOccasion);
    if (farmSlug) setValue("farmSlug", farmSlug);
  }, [defaultPackage, defaultOccasion, farmSlug, setValue]);

  // keep the chosen package valid for the chosen farmhouse
  useEffect(() => {
    if (pkgs.length && !pkgs.some((p) => p.id === values.packageId)) setValue("packageId", pkgs[0].id);
  }, [pkgs, values.packageId, setValue]);

  const summary = estimate(farm, values.packageId, values.from, values.to);

  const onSubmit = async (data: RequestData) => {
    setServerError(null);
    try {
      const res = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = (await res.json()) as { ok: boolean; code?: string; error?: string; errors?: Record<string, string[]> };
      if (!res.ok || !json.ok) {
        for (const [k, v] of Object.entries(json.errors ?? {})) setError(k as keyof RequestInput, { message: v[0] });
        setServerError({ message: json.error ?? "Something went wrong", noDb: res.status === 503 });
        if (res.status === 409) loadBooked(true);
        return;
      }
      if (json.code) router.push(`/booking/${json.code}?new=1`);
    } catch {
      setServerError({ message: "We couldn't reach the server. Check your connection, or message us on WhatsApp.", noDb: true });
    }
  };

  const setRange = (r: DateRange | undefined) => (controlled ? onRangeChange?.(r) : setLocalRange(r));

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid grid-cols-2 gap-x-4 gap-y-5" aria-label="Request to book">
      {!farmSlug && (
        <Field label="Farmhouse" id={id("farm")} error={errors.farmSlug?.message} className="col-span-2">
          <select id={id("farm")} className={cn(fieldBase, "appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10")} style={{ backgroundImage: "var(--chevron)" }} {...register("farmSlug")}>
            <option value="">Choose a farmhouse…</option>
            {farmhousesIn("bhopal").map((f) => (
              <option key={f.slug} value={f.slug}>
                {f.name} · up to {f.capacity.eventGuests} guests
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label={controlled ? "Dates (pick on the calendar)" : "Dates"} id={id("dates")} error={errors.from?.message ?? errors.to?.message} className="col-span-2">
        {controlled ? (
          <div id={id("dates")} tabIndex={-1} className={cn(fieldBase, "flex items-center gap-3 text-[0.95rem]", errors.from && "border-terra")} aria-live="polite">
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
              <button id={id("dates")} type="button" className={cn(fieldBase, "flex items-center gap-3 text-left text-[0.95rem]", errors.from && "border-terra")} aria-describedby={errors.from ? `${id("dates")}-error` : undefined}>
                <CalendarDays className="size-4 text-sage" strokeWidth={1.5} aria-hidden="true" />
                {values.from ? (
                  <span>
                    {prettyDate(values.from)}
                    {values.to ? ` → ${prettyDate(values.to)}` : " · day visit"}
                  </span>
                ) : (
                  <span className="text-muted">Choose dates</span>
                )}
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content sideOffset={8} align="start" collisionPadding={12} className="z-[95] rounded-[var(--radius-card)] border border-line bg-card p-4 text-ink shadow-lift">
                <AvailabilityCalendar range={localRange} onChange={setRange} booked={bookedDates} months={1} />
                <p className="mt-2 max-w-[300px] text-sm text-muted">Tap one date for a day out, or a check-in and check-out for a stay.</p>
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

      <Field label="Planning" id={id("pkg")} error={errors.packageId?.message} className="col-span-2 sm:col-span-1">
        <select id={id("pkg")} className={cn(fieldBase, "appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10")} style={{ backgroundImage: "var(--chevron)" }} {...register("packageId")}>
          {(pkgs.length ? pkgs : farmhousesIn("bhopal")[0] ? packagesFor(farmhousesIn("bhopal")[0]) : (site.packages as Package[])).map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Guests" id={id("guests")} error={errors.guests?.message} hint={farm ? `Up to ${farm.capacity.eventGuests} for events · sleeps ${farm.capacity.sleeps}` : undefined} className="col-span-2 sm:col-span-1">
        <Controller
          control={control}
          name="guests"
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="icon" className="shrink-0 text-ink" aria-label="Fewer guests" onClick={() => field.onChange(Math.max(1, (Number(field.value) || 1) - 1))}>
                <Minus />
              </Button>
              <input
                id={id("guests")}
                type="number"
                inputMode="numeric"
                min={1}
                className={cn(fieldBase, "text-center font-mono [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none")}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                onBlur={field.onBlur}
                aria-invalid={!!errors.guests}
              />
              <Button type="button" variant="outline" size="icon" className="shrink-0 text-ink" aria-label="More guests" onClick={() => field.onChange((Number(field.value) || 0) + 1)}>
                <Plus />
              </Button>
            </div>
          )}
        />
      </Field>

      <Field label="Your name" id={id("name")} error={errors.name?.message} className="col-span-2 sm:col-span-1">
        <input id={id("name")} autoComplete="name" className={fieldBase} aria-invalid={!!errors.name} {...register("name")} />
      </Field>
      <Field label="Phone (WhatsApp)" id={id("phone")} error={errors.phone?.message} hint="We'll send updates here" className="col-span-2 sm:col-span-1">
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-muted">+91</span>
          <input id={id("phone")} type="tel" inputMode="tel" autoComplete="tel-national" className={cn(fieldBase, "pl-14 font-mono tracking-wide")} aria-invalid={!!errors.phone} {...register("phone")} />
        </div>
      </Field>

      {!compact && (
        <>
          <Field label="Email (optional)" id={id("email")} error={errors.email?.message} className="col-span-2 sm:col-span-1">
            <input id={id("email")} type="email" autoComplete="email" className={fieldBase} aria-invalid={!!errors.email} {...register("email")} />
          </Field>
          <Field label="Occasion (optional)" id={id("occ")} className="col-span-2 sm:col-span-1">
            <input id={id("occ")} className={fieldBase} placeholder="Birthday, haldi, offsite…" list={id("occ-list")} {...register("occasion")} />
            <datalist id={id("occ-list")}>
              {site.occasions.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </Field>
          <Field label="Anything we should know? (optional)" id={id("msg")} error={errors.message?.message} className="col-span-2">
            <textarea id={id("msg")} rows={2} className={cn(fieldBase, "py-3")} placeholder="Food, decor, timings…" {...register("message")} />
          </Field>
        </>
      )}

      {/* honeypot */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("company")}>Company</label>
        <input id={id("company")} tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      {serverError && (
        <div role="alert" className="col-span-2 rounded-2xl border border-terra/40 bg-terra/5 p-4 text-sm">
          <p className="text-ink">{serverError.message}</p>
          {serverError.noDb && (
            <a className="link-draw mt-2 inline-flex items-center gap-2 font-medium text-sage" href={whatsappLink(whatsappText(values, farm))} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-4" strokeWidth={1.5} aria-hidden="true" /> Send this on WhatsApp instead
            </a>
          )}
        </div>
      )}

      <div className="col-span-2 flex flex-col gap-4 rounded-2xl border border-dashed border-line bg-cream/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div aria-live="polite">
          <p className="eyebrow text-sage">{summary.line || "Pick dates & what you're planning"}</p>
          <p className="mt-1 font-mono text-sm uppercase tracking-[0.12em] text-muted">
            from <span className="text-base font-medium text-ink">{summary.price}</span> · exact quote after we check
          </p>
        </div>
        <Button type="submit" size="lg" disabled={isSubmitting || isSubmitSuccessful} data-cursor="Book">
          {isSubmitting || isSubmitSuccessful ? <Loader2 className="animate-spin" /> : null}
          {isSubmitting ? "Sending…" : isSubmitSuccessful ? "Opening your booking…" : "Request to book"}
          {!isSubmitting && !isSubmitSuccessful && <ArrowRight />}
        </Button>
      </div>
      <p className="col-span-2 flex items-start gap-2 text-sm text-muted">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sage" strokeWidth={1.5} aria-hidden="true" />
        <span>
          Free to request — nothing to pay now. We check with the owner and update you within {site.booking.checkWithin}.
        </span>
      </p>
    </form>
  );
}
