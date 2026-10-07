import { cn } from "@/lib/utils";

/** Mark: a rising sun behind a farmhouse roofline. Uses currentColor + wheat. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-7", className)}>
      <circle cx="16" cy="14" r="6" className="fill-wheat" />
      <path d="M3 22 L16 11 L29 22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 26 H26" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="display text-[1.6rem] leading-none tracking-[-0.03em]">Farmhouze</span>
    </span>
  );
}
