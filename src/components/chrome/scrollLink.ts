"use client";

import { scrollToTarget } from "@/components/providers/SmoothScroll";

/**
 * onClick handler for "/#section" links: smooth-scrolls when we're already on the
 * homepage, otherwise lets Next navigate normally.
 */
export function handleHashLink(e: React.MouseEvent<HTMLAnchorElement>, href: string, after?: () => void) {
  const hash = href.split("#")[1];
  if (!hash || window.location.pathname !== "/") return;
  const el = document.getElementById(hash);
  if (!el) return;
  e.preventDefault();
  after?.();
  history.replaceState(null, "", `#${hash}`);
  scrollToTarget(el);
}
