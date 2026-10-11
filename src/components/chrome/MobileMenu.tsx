"use client";

import { ArrowRight, Menu, MessageCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Dialog } from "radix-ui";
import { useState } from "react";
import { defaultWhatsappText, navItems, site, whatsappLink } from "@/content/site";
import { Button } from "@/components/ui/button";
import { handleHashLink } from "./scrollLink";

/** Full-screen sheet with big Fraunces links and a photo that crossfades per link. */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(navItems()[0].label);
  const photo = site.navPhotos[active] ?? site.occasions[0].image.src;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="ghost" size="icon" className="text-ink lg:hidden" aria-label="Open menu">
          <Menu />
        </Button>
      </Dialog.Trigger>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                className="fixed inset-0 z-[80] flex flex-col bg-cream text-ink"
                initial={{ clipPath: "inset(0 0 100% 0)" }}
                animate={{ clipPath: "inset(0 0 0% 0)" }}
                exit={{ clipPath: "inset(0 0 100% 0)" }}
                transition={{ duration: 0.6, ease: [0.87, 0, 0.13, 1] }}
              >
                <Dialog.Title className="sr-only">Menu</Dialog.Title>
                <div className="container-x flex h-[var(--header-h)] items-center justify-between">
                  <span className="eyebrow text-muted">Menu</span>
                  <Dialog.Close asChild>
                    <Button variant="ghost" size="icon" aria-label="Close menu">
                      <X />
                    </Button>
                  </Dialog.Close>
                </div>

                <div className="container-x relative flex flex-1 flex-col justify-between gap-6 overflow-y-auto pb-8">
                  <div className="relative mb-2 aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-card)]">
                    <AnimatePresence initial={false}>
                      <motion.div
                        key={photo}
                        className="absolute inset-0"
                        initial={{ opacity: 0, scale: 1.04 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Image src={photo} alt="" fill sizes="100vw" className="object-cover" />
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <nav aria-label="Mobile">
                    <ul className="flex flex-col">
                      {navItems().map((l, i) => (
                        <motion.li
                          key={l.label}
                          initial={{ opacity: 0, y: 24 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <Link
                            href={l.href}
                            onClick={(e) => handleHashLink(e, l.href, () => setOpen(false))}
                            onPointerEnter={() => setActive(l.label)}
                            onFocus={() => setActive(l.label)}
                            className="display flex items-baseline justify-between border-b border-line py-3 text-[2.4rem] leading-none"
                          >
                            {l.label}
                            <ArrowRight className="size-5 text-muted" strokeWidth={1.5} aria-hidden="true" />
                          </Link>
                        </motion.li>
                      ))}
                    </ul>
                  </nav>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button asChild size="lg" className="flex-1">
                      <Link href="/#book" onClick={(e) => handleHashLink(e, "/#book", () => setOpen(false))}>
                        {site.launched ? "Check availability" : "Get early access"}
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="flex-1">
                      <a href={whatsappLink(defaultWhatsappText)} target="_blank" rel="noopener noreferrer">
                        <MessageCircle /> WhatsApp us
                      </a>
                    </Button>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
