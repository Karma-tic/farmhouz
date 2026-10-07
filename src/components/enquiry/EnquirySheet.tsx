"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { Dialog } from "radix-ui";
import { useEffect } from "react";
import { setScrollLocked } from "@/components/providers/SmoothScroll";
import { Button } from "@/components/ui/button";
import { site, type Package } from "@/content/site";
import { useEnquiry } from "./EnquiryContext";
import { EnquiryForm } from "./EnquiryForm";

/**
 * Side sheet (bottom sheet on mobile) holding the enquiry form. When opened from a
 * package card, the card photo morphs into the sheet header via a shared layoutId.
 */
export function EnquirySheet() {
  const { open, setOpen, prefill } = useEnquiry();
  const pkg = (site.packages as Package[]).find((p) => p.id === prefill.packageId);
  const image = pkg?.image ?? site.spaces[0].image;

  useEffect(() => setScrollLocked(open), [open]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-[85] bg-night/45 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                data-lenis-prevent
                className="fixed inset-x-0 bottom-0 z-[86] flex max-h-[92svh] flex-col overflow-y-auto rounded-t-[28px] bg-cream text-ink shadow-lift outline-none md:inset-y-3 md:left-auto md:right-3 md:max-h-none md:w-[min(560px,calc(100vw-1.5rem))] md:rounded-[28px]"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="relative aspect-[16/8] shrink-0 overflow-hidden">
                  <motion.div
                    layoutId={prefill.morphId}
                    className="absolute inset-0"
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Image src={image.src} alt="" fill sizes="560px" className="object-cover" />
                  </motion.div>
                  <div aria-hidden="true" className="scrim-bottom absolute inset-0" />
                  <div className="theme-night absolute inset-x-0 bottom-0 p-6">
                    <p className="eyebrow mb-2 text-moon/90">{pkg ? pkg.timing : "Booking enquiry"}</p>
                    <Dialog.Title className="display text-[2.5rem] leading-none text-moon">
                      {prefill.occasion ?? pkg?.name ?? "Plan your stay"}
                    </Dialog.Title>
                  </div>
                  <Dialog.Close asChild>
                    <Button variant="ghost" size="icon" aria-label="Close" className="absolute right-3 top-3 bg-cream/85 text-ink backdrop-blur hover:bg-cream">
                      <X />
                    </Button>
                  </Dialog.Close>
                </div>
                <div className="p-6 pb-8">
                  <EnquiryForm defaultPackage={prefill.packageId} defaultOccasion={prefill.occasion} compact />
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
