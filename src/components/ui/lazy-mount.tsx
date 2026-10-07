"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Mounts children only once the placeholder comes within `margin` of the viewport,
 * so heavy below-the-fold code (calendar, form, validation) stays out of the
 * initial JS. The placeholder reserves `minHeight` to avoid layout shift.
 */
export function LazyMount({ children, minHeight, margin = "900px" }: { children: React.ReactNode; minHeight: number | string; margin?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setShow(true), { rootMargin: `${margin} 0px` });
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  if (show) return <>{children}</>;
  return <div ref={ref} style={{ minHeight }} aria-busy="true" />;
}
