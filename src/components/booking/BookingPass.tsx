"use client";

import { CalendarPlus, Clock, MapPin, MessageCircle, Navigation, Phone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getArea } from "@/content/cities";
import { getFarmhouse } from "@/content/farmhouses";
import { formatPrice, site, whatsappLink } from "@/content/site";
import { addDays, prettyRange } from "@/lib/booking/dates";
import { displayCode } from "@/lib/booking/messages";
import type { PublicBooking } from "@/lib/booking/types";

function icsFor(b: PublicBooking, farmName: string) {
  const d = (s: string) => s.replace(/-/g, "");
  const end = b.checkOut ?? addDays(b.checkIn, 1);
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Farmhouze//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${b.code}@farmhouze`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART;VALUE=DATE:${d(b.checkIn)}`,
    `DTEND;VALUE=DATE:${d(end)}`,
    `SUMMARY:${farmName} · ${site.name} ${displayCode(b.code)}`,
    `LOCATION:${(b.pass?.exactAddress ?? "").replace(/[,;]/g, "\\$&")}`,
    `DESCRIPTION:Check-in ${b.pass?.checkInTime} · Caretaker ${b.pass?.caretakerName} ${b.pass?.caretakerPhone} · ${b.pass?.mapsUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
}

/** The "ticket" a guest gets once booked: exact address, caretaker, times, balance. */
export function BookingPass({ booking }: { booking: PublicBooking }) {
  const farm = getFarmhouse(booking.farmSlug);
  const area = farm ? getArea(farm.city, farm.area) : undefined;
  const p = booking.pass;
  if (!p || !farm) return null;
  const balance = (booking.quoteTotal ?? 0) - (booking.advance ?? 0);
  return (
    <div className="theme-day relative mx-auto max-w-2xl overflow-hidden rounded-[28px] bg-card text-ink shadow-lift">
      <div className="relative bg-wheat/25 px-6 pb-6 pt-7 sm:px-8">
        <p className="eyebrow text-sage">Booking pass · {displayCode(booking.code)}</p>
        <h2 className="display mt-2 text-[clamp(2.2rem,6vw,3.2rem)] leading-none">{farm.name}</h2>
        <p className="mt-2 text-muted">
          {area?.name} · {prettyRange(booking.checkIn, booking.checkOut, { weekday: true })}
        </p>
      </div>
      {/* perforation */}
      <div aria-hidden="true" className="relative h-6">
        <span className="absolute -left-3 top-0 size-6 rounded-full bg-night" />
        <span className="absolute -right-3 top-0 size-6 rounded-full bg-night" />
        <span className="absolute inset-x-6 top-3 border-t-2 border-dashed border-line" />
      </div>
      <div className="grid gap-5 px-6 pb-7 sm:grid-cols-2 sm:px-8">
        <div className="flex gap-3 sm:col-span-2">
          <MapPin className="mt-1 size-5 shrink-0 text-sage" strokeWidth={1.5} aria-hidden="true" />
          <div>
            <p className="eyebrow text-muted">Address</p>
            <p className="mt-1 font-medium">{p.exactAddress}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Clock className="mt-1 size-5 shrink-0 text-sage" strokeWidth={1.5} aria-hidden="true" />
          <div>
            <p className="eyebrow text-muted">{booking.checkOut ? "Check-in · check-out" : "Day visit"}</p>
            <p className="mt-1 font-medium">
              {p.checkInTime} · {p.checkOutTime}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Users className="mt-1 size-5 shrink-0 text-sage" strokeWidth={1.5} aria-hidden="true" />
          <div>
            <p className="eyebrow text-muted">Guests</p>
            <p className="mt-1 font-medium">{booking.guests}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Phone className="mt-1 size-5 shrink-0 text-sage" strokeWidth={1.5} aria-hidden="true" />
          <div>
            <p className="eyebrow text-muted">Caretaker</p>
            <a href={`tel:${p.caretakerPhone.replace(/\s/g, "")}`} className="link-draw mt-1 inline-block font-medium">
              {p.caretakerName} · {p.caretakerPhone}
            </a>
          </div>
        </div>
        <div className="flex gap-3">
          <span className="mt-1 grid size-5 shrink-0 place-items-center font-mono text-sm text-sage" aria-hidden="true">
            ₹
          </span>
          <div>
            <p className="eyebrow text-muted">Paid · balance at check-in</p>
            <p className="mt-1 font-mono">
              {formatPrice(booking.advance)} · {formatPrice(balance)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button asChild variant="sage">
            <a href={p.mapsUrl} target="_blank" rel="noopener noreferrer">
              <Navigation /> Directions
            </a>
          </Button>
          <Button
            variant="outline"
            className="text-ink"
            onClick={() => {
              const a = document.createElement("a");
              a.href = icsFor(booking, farm.name);
              a.download = `${farm.slug}-${booking.checkIn}.ics`;
              a.click();
            }}
          >
            <CalendarPlus /> Add to calendar
          </Button>
          <Button asChild variant="ghost" className="text-ink">
            <a href={whatsappLink(`Hi ${site.name}, question about my booking ${displayCode(booking.code)}`)} target="_blank" rel="noopener noreferrer">
              <MessageCircle /> Need help?
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
