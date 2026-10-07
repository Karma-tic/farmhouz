import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import type { Media } from "@/content/site";

/** Small photo link on the homepage whose image morphs into the subpage header. */
export function PageTeaser({ href, label, image, transitionName }: { href: string; label: string; image: Media; transitionName: string }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-4 self-start rounded-full border border-line bg-card/80 py-2 pl-2 pr-5 shadow-soft backdrop-blur md:self-end">
      <ViewTransition name={transitionName} share="morph" default="none">
        <span className="relative block size-12 overflow-hidden rounded-full">
          <Image src={image.src} alt="" fill sizes="48px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
        </span>
      </ViewTransition>
      <span className="font-medium">{label}</span>
      <ArrowUpRight className="size-4 transition-transform duration-[var(--dur-ui)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.5} aria-hidden="true" />
    </Link>
  );
}
