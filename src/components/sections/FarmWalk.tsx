import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getArea } from "@/content/cities";
import { farmhousesIn, fromPrice } from "@/content/farmhouses";
import { formatPrice, site } from "@/content/site";
import { Spaces, type WalkItem } from "./Spaces";

/** Homepage: the pinned walk-through, one handpicked farmhouse per step. */
export function FarmWalk() {
  if (!site.launched) return <OwnersWalk />;
  const items: WalkItem[] = farmhousesIn("bhopal").map((f) => {
    const p = fromPrice(f);
    return {
      id: f.slug,
      name: f.name,
      description: f.tagline,
      kicker: `${getArea(f.city, f.area)?.name} · ${f.driveTime} · from ${formatPrice(p.amount)}/${p.unit}`,
      chips: [`${f.capacity.eventGuests} guests`, `Sleeps ${f.capacity.sleeps}`, f.highlights[0]],
      image: f.cover,
      href: `/${f.city}/${f.slug}`,
    };
  });
  return (
    <Spaces
      id="farmhouses"
      items={items}
      eyebrow="The farmhouses · 10:00 AM"
      title={
        <>
          Walk the farms, <span className="italic-soft text-terra">one at a time.</span>
        </>
      }
      intro={`${items.length} handpicked farmhouses around Bhopal, each visited before it's listed. Pick one — we check it's free with the owner.`}
      action={
        <Button asChild variant="outline" className="self-start text-ink md:self-end">
          <Link href="/bhopal">
            Compare all on a map <ArrowRight />
          </Link>
        </Button>
      }
    />
  );
}

/** Pre-launch: the same pinned walk-through, pitched to farmhouse owners. */
function OwnersWalk() {
  const items: WalkItem[] = site.prelaunch.owners.map((o, i) => ({ ...o, kicker: `Step ${i + 1} of ${site.prelaunch.owners.length}` }));
  return (
    <Spaces
      id="farmhouses"
      items={items}
      eyebrow="For farmhouse owners · 10:00 AM"
      title={
        <>
          Own a farmhouse? <span className="italic-soft text-terra">Let it earn.</span>
        </>
      }
      intro="We're signing Bhopal's best farmhouses now. You host; we find the guests, answer every call and collect the advance."
      action={
        <Button asChild className="self-start md:self-end">
          <Link href="/list-your-farmhouse">
            List your farmhouse <ArrowRight />
          </Link>
        </Button>
      }
    />
  );
}
