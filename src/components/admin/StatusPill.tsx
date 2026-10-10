import { statusLabel } from "@/lib/booking/messages";
import type { BookingStatus } from "@/lib/booking/types";
import { cn } from "@/lib/utils";

const tone: Record<BookingStatus, string> = {
  checking: "bg-wheat/30 text-ink",
  available: "bg-sage/15 text-sage",
  unavailable: "bg-terra/10 text-terra",
  payment_review: "bg-terra text-cream",
  confirmed: "bg-sage text-cream",
  expired: "bg-line text-muted",
  cancelled: "bg-line text-muted",
};

export function StatusPill({ status, className }: { status: BookingStatus; className?: string }) {
  return <span className={cn("eyebrow inline-flex items-center rounded-full px-2.5 py-1 text-[0.66rem]", tone[status], className)}>{statusLabel[status]}</span>;
}
