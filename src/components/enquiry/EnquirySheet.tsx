"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Dialog } from "radix-ui";
import { useEffect } from "react";
import { setScrollLocked } from "@/components/providers/SmoothScroll";
import { Button } from "@/components/ui/button";
import { packagesFor } from "@/content/farmhouses";
import { useFarms } from "@/lib/farms/client";
import { site } from "@/content/site";
import type { Package } from "@/content/types";
import { useEnquiry } from "./EnquiryContext";

const WaitlistForm = dynamic(() => import("./WaitlistForm").then((m) => m.WaitlistForm), {
  ssr: false,
  loading: () => <div className="min-h-[360px]" aria-busy="true" />,
});

const EnquiryForm = dynamic(() => import("./EnquiryForm").then((m) => m.EnquiryForm), {
  ssr: false,
  loading: () => <div className="min-h-[560px]" aria-busy="true" />,
});

/**
 * "Request to book" sheet (bottom sheet on mobile). Opened from package cards
 * (the card photo morphs into the header), occasions and sticky bars.
 */
export function EnquirySheet() {
  const { get: getFarmhouse } = useFarms();
  const { open, setOpen, prefill } = useEnquiry();
  const farm = prefill.farmSlug ? getFarmhouse(prefill.farmSlug) : undefined;
  const pkg = (farm ? packagesFor(farm) : (site.packages as Package[])).find((p) => p.id === prefill.packageId);
  const image = pkg?.image ?? farm?.cover ?? site.occasions[0].image;

  useEffect(() => setScrollLocked(open), [open]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div className="fixed inset-0 z-[85] bg-night/45 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                data-lenis-prevent
                className="fixed inset-x-0 bottom-0 z-[86] flex max-h-[92svh] flex-col overflow-y-auto rounded-t-[28px] bg-cream text-ink shadow-lift outline-none md:inset-y-3 md:left-auto md:right-3 md:max-h-none md:w-[min(580px,calc(100vw-1.5rem))] md:rounded-[28px]"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="relative aspect-[16/8] shrink-0 overflow-hidden">
                  <motion.div layoutId={prefill.morphId} className="absolute inset-0" transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                    <Image src={image.src} alt="" fill sizes="580px" className="object-cover" />
                  </motion.div>
                  <div aria-hidden="true" className="scrim-bottom absolute inset-0" />
                  <div className="theme-night absolute inset-x-0 bottom-0 p-6">
                    <p className="eyebrow mb-2 text-moon/90">{!site.launched ? "Launching soon in Bhopal" : farm ? `${farm.name}${pkg ? ` · ${pkg.timing}` : ""}` : "Request to book"}</p>
                    <Dialog.Title className="display text-[2.4rem] leading-none text-moon">{!site.launched ? "Get early access" : (prefill.occasion ?? pkg?.name ?? (farm ? "Request to book" : "Find your farmhouse"))}</Dialog.Title>
                  </div>
                  <Dialog.Close asChild>
                    <Button variant="ghost" size="icon" aria-label="Close" className="absolute right-3 top-3 bg-cream/85 text-ink backdrop-blur hover:bg-cream">
                      <X />
                    </Button>
                  </Dialog.Close>
                </div>
                <div className="p-6 pb-8">
                  {site.launched ? (
                    <EnquiryForm farmSlug={prefill.farmSlug} defaultPackage={prefill.packageId} defaultOccasion={prefill.occasion} compact />
                  ) : (
                    <WaitlistForm defaultOccasion={prefill.occasion ?? pkg?.name} compact />
                  )}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
