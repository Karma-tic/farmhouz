"use client";

import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { useSyncExternalStore } from "react";
import { useIsDesktop } from "@/lib/motion/useReducedMotion";
import { cn } from "@/lib/utils";

export function AvailabilityCalendar({
  range,
  onChange,
  booked,
  months,
  className,
}: {
  range: DateRange | undefined;
  onChange: (r: DateRange | undefined) => void;
  booked: Date[];
  months?: number;
  className?: string;
}) {
  const desktop = useIsDesktop();
  // "today" only exists in the browser; render a same-size placeholder before hydration
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  if (!hydrated) {
    return <div className={cn("min-h-[392px] w-full animate-pulse rounded-2xl bg-line/30", className)} aria-hidden="true" />;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (
    <div className={cn("w-full", className)}>
      <DayPicker
        mode="range"
        selected={range}
        onSelect={onChange}
        numberOfMonths={months ?? (desktop ? 2 : 1)}
        startMonth={today}
        disabled={[{ before: today }, ...booked]}
        excludeDisabled
        modifiers={{ booked }}
        modifiersClassNames={{ booked: "rdp-booked" }}
        showOutsideDays={false}
        weekStartsOn={1}
        className="mx-auto"
        classNames={{ months: "rdp-months !max-w-none flex flex-wrap justify-center gap-x-10 gap-y-6" }}
        labels={{
          labelDayButton: (date, mods) =>
            `${date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}${mods.booked ? ", booked" : mods.disabled ? ", unavailable" : ""}${mods.selected ? ", selected" : ""}`,
        }}
      />
      <ul className="eyebrow mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-muted" aria-label="Calendar legend">
        <li className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-sage" aria-hidden="true" /> Your dates
        </li>
        <li className="flex items-center gap-2">
          <span className="text-[0.9rem] line-through" aria-hidden="true">
            14
          </span>{" "}
          Booked
        </li>
      </ul>
    </div>
  );
}
