"use client";

import { ArrowDown, ArrowLeft, ArrowUp, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useId, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Field, fieldBase } from "@/components/enquiry/EnquiryForm";
import { Button } from "@/components/ui/button";
import { cities, getArea } from "@/content/cities";
import { defaultRules, defaultTimes } from "@/content/farmhouses";
import { site } from "@/content/site";
import type { Farmhouse, Media, Space } from "@/content/types";
import { AMENITIES, OCCASIONS, saveFarmSchema, slugify } from "@/lib/farms/schema";
import type { OwnerInfo } from "@/lib/farms/types";
import { cn } from "@/lib/utils";
import { AdminShell } from "./AdminShell";
import type { AdminFarmRow } from "./FarmsAdmin";
import { uploadPhoto } from "./photo-upload";
import { Unauthorized, adminFetch, useAdminData } from "./useAdmin";

const city = cities[0];
const blankMedia: Media = { src: "", alt: "" };

function blankFarm(): Farmhouse {
  const a = city.areas[0];
  return {
    slug: "",
    name: "",
    sample: false,
    published: false,
    city: city.slug,
    area: a.slug,
    tagline: "",
    description: "",
    highlights: ["", "", "", ""],
    capacity: { bedrooms: 0, sleeps: 0, eventGuests: 50 },
    acres: 0,
    approx: { lat: a.lat, lng: a.lng },
    kmFromCentre: a.kmFromCentre,
    driveTime: a.driveTime,
    price: { dayOut: null, night: null, event: null },
    occasions: ["day-out"],
    amenities: ["parking", "caretaker"],
    spaces: [],
    cover: blankMedia,
    gallery: [],
    times: { ...defaultTimes },
    rules: [...defaultRules],
  };
}
const blankOwner: OwnerInfo = { ownerName: "", ownerWhatsapp: "", caretakerName: "", caretakerPhone: "", exactAddress: "", mapsUrl: "", notes: "" };

/** Loads the farmhouse being edited (or starts a new one), then renders the form. */
export function FarmEditorPage() {
  const slug = useSearchParams().get("slug");
  const { data, needsLogin, reload, error } = useAdminData<{ farms: AdminFarmRow[] }>("/api/admin/farms", 0);
  const row = slug ? data?.farms.find((f) => f.farm.slug === slug) : undefined;
  return (
    <AdminShell needsLogin={needsLogin} onLogin={reload}>
      <Link href="/admin/farms" className="mb-4 inline-flex min-h-10 items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> All farmhouses
      </Link>
      {error && <p className="text-terra">{error}</p>}
      {!data ? (
        <p className="text-muted">Loading…</p>
      ) : slug && !row ? (
        <p className="text-muted">That farmhouse wasn&apos;t found.</p>
      ) : (
        <FarmForm key={slug ?? "new"} initial={row ? { ...row.farm, highlights: [...row.farm.highlights, "", "", "", ""].slice(0, 4) } : blankFarm()} initialOwner={{ ...blankOwner, ...row?.owner }} existingSlug={row?.farm.slug} />
      )}
    </AdminShell>
  );
}

type Errors = Record<string, string>;

function FarmForm({ initial, initialOwner, existingSlug }: { initial: Farmhouse; initialOwner: OwnerInfo; existingSlug?: string }) {
  const router = useRouter();
  const uid = useId();
  const id = (n: string) => `${uid}-${n}`;
  const [f, setF] = useState<Farmhouse>(initial);
  const [o, setO] = useState<OwnerInfo>(initialOwner);
  const [slugTouched, setSlugTouched] = useState(Boolean(existingSlug));
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = <K extends keyof Farmhouse>(k: K, v: Farmhouse[K]) => setF((p) => ({ ...p, [k]: v }));
  const setOwner = (k: keyof OwnerInfo, v: string) => setO((p) => ({ ...p, [k]: v }));
  const num = (v: string) => (v === "" ? 0 : Number(v));
  const price = (v: string) => (v === "" ? null : Math.max(0, Math.round(Number(v))));
  const err = (path: string) => errors[path];

  const upload = async (files: FileList | File[], onEach: (url: string) => void) => {
    const list = Array.from(files);
    setUploading((n) => n + list.length);
    for (const file of list) {
      try {
        onEach(await uploadPhoto(file));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  const onName = (name: string) => setF((p) => ({ ...p, name, slug: slugTouched ? p.slug : slugify(name) }));
  const onArea = (slug: string) => {
    const a = getArea(city.slug, slug);
    setF((p) => ({ ...p, area: slug, ...(a ? { approx: { lat: a.lat, lng: a.lng }, kmFromCentre: a.kmFromCentre, driveTime: a.driveTime } : {}) }));
  };

  const save = async (publish: boolean) => {
    const farm: Farmhouse = { ...f, published: publish, highlights: f.highlights.map((h) => h.trim()).filter(Boolean), rules: f.rules.map((r) => r.trim()).filter(Boolean) };
    const parsed = saveFarmSchema.safeParse({ farm, owner: o, previousSlug: existingSlug });
    if (!parsed.success) {
      const e: Errors = {};
      for (const i of parsed.error.issues) e[i.path.slice(1).join(".")] ??= i.message;
      setErrors(e);
      setTimeout(() => document.querySelector("[aria-invalid=true], form [role=alert]")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
      toast.error(`Please fix ${Object.keys(e).length} field${Object.keys(e).length > 1 ? "s" : ""} (marked in red).`);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await adminFetch("/api/admin/farms", { method: "POST", body: JSON.stringify(parsed.data) });
      toast.success(publish ? `${farm.name} is published${site.launched ? " and live" : " (shows once you launch)"}.` : `${farm.name} saved as a draft.`);
      router.push("/admin/farms");
    } catch (e) {
      if (e instanceof Unauthorized) toast.error("Please sign in again.");
      else toast.error(e instanceof Error ? e.message : "Couldn't save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!existingSlug) return;
    try {
      await adminFetch(`/api/admin/farms?slug=${existingSlug}`, { method: "DELETE" });
      toast.success("Farmhouse deleted.");
      router.push("/admin/farms");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't delete");
      setConfirmDelete(false);
    }
  };

  const moveGallery = (i: number, d: -1 | 1) =>
    setF((p) => {
      const g = [...p.gallery];
      const j = i + d;
      if (j < 0 || j >= g.length) return p;
      [g[i], g[j]] = [g[j], g[i]];
      return { ...p, gallery: g };
    });

  const setSpace = (i: number, patch: Partial<Space>) => setF((p) => ({ ...p, spaces: p.spaces.map((s, k) => (k === i ? { ...s, ...patch } : s)) }));

  return (
    <form
      noValidate
      className="grid gap-6 pb-28"
      onSubmit={(e) => {
        e.preventDefault();
        save(f.published);
      }}
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-1 text-sage">{existingSlug ? (initial.published ? "Published" : "Draft") : "New farmhouse"}</p>
          <h1 className="display display-md">{f.name || "Untitled farmhouse"}</h1>
        </div>
        {existingSlug && (
          <Button asChild variant="outline" className="text-ink">
            <a href={`/preview/${existingSlug}`} target="_blank" rel="noopener noreferrer">
              Preview page
            </a>
          </Button>
        )}
      </header>

      <Section title="Basics" hint="What guests see first.">
        <Field label="Farmhouse name" id={id("name")} error={err("name")} className="sm:col-span-1">
          <input id={id("name")} className={fieldBase} value={f.name} onChange={(e) => onName(e.target.value)} aria-invalid={!!err("name")} placeholder="e.g. Mango Grove" />
        </Field>
        <Field label="Page link" id={id("slug")} error={err("slug")} hint={`farmhouze.in/${f.city}/${f.slug || "…"}`}>
          <input
            id={id("slug")}
            className={cn(fieldBase, "font-mono")}
            value={f.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", slugify(e.target.value));
            }}
            aria-invalid={!!err("slug")}
          />
        </Field>
        <Field label="Area" id={id("area")} error={err("area")}>
          <select id={id("area")} className={fieldBase} value={f.area} onChange={(e) => onArea(e.target.value)}>
            {city.areas.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Drive from New Market" id={id("drive")} error={err("driveTime") || err("kmFromCentre")} hint="Auto-filled from the area — adjust if needed">
          <div className="grid grid-cols-2 gap-2">
            <input id={id("drive")} className={fieldBase} value={f.driveTime} onChange={(e) => set("driveTime", e.target.value)} placeholder="35 min" aria-label="Drive time" />
            <input type="number" inputMode="decimal" className={cn(fieldBase, "font-mono")} value={f.kmFromCentre} onChange={(e) => set("kmFromCentre", num(e.target.value))} aria-label="Kilometres from New Market" />
          </div>
        </Field>
        <Field label="Tagline (one line)" id={id("tag")} error={err("tagline")} className="sm:col-span-2">
          <input id={id("tag")} className={fieldBase} value={f.tagline} onChange={(e) => set("tagline", e.target.value)} maxLength={140} placeholder="A mango orchard with a pool, five minutes from the Kerwa forest." aria-invalid={!!err("tagline")} />
        </Field>
        <Field label="Description" id={id("desc")} error={err("description")} className="sm:col-span-2">
          <textarea id={id("desc")} rows={5} className={cn(fieldBase, "py-3")} value={f.description} onChange={(e) => set("description", e.target.value)} aria-invalid={!!err("description")} />
        </Field>
        <fieldset className="sm:col-span-2">
          <legend className="eyebrow mb-1.5 text-muted">Highlights (up to 4 short ones)</legend>
          <div className="grid gap-2 sm:grid-cols-4">
            {f.highlights.map((h, i) => (
              <input key={i} className={fieldBase} value={h} maxLength={40} onChange={(e) => set("highlights", f.highlights.map((x, k) => (k === i ? e.target.value : x)))} placeholder={["Private pool", "4 AC rooms", "Mango orchard", "Bonfire pit"][i]} aria-label={`Highlight ${i + 1}`} />
            ))}
          </div>
        </fieldset>
      </Section>

      <Section title="Photos" hint="Phone photos are fine — they're resized before upload. Use bright, wide shots in daylight." error={err("cover.src") || err("gallery")}>
        <div className="sm:col-span-2">
          <p className="eyebrow mb-2 text-muted">Cover photo</p>
          <div className="flex flex-wrap items-start gap-4">
            <PhotoTile media={f.cover} onRemove={f.cover.src ? () => set("cover", blankMedia) : undefined} big />
            <UploadButton label={f.cover.src ? "Replace cover" : "Upload cover"} onFiles={(files) => upload([files[0]], (url) => set("cover", { src: url, alt: f.name }))} />
          </div>
        </div>
        <div className="sm:col-span-2">
          <p className="eyebrow mb-2 text-muted">Gallery ({f.gallery.length}) — at least 3 to publish</p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {f.gallery.map((g, i) => (
              <li key={g.src} className="flex flex-col gap-2">
                <PhotoTile media={g} onRemove={() => set("gallery", f.gallery.filter((_, k) => k !== i))} />
                <input className={cn(fieldBase, "min-h-10 text-sm")} value={g.alt} placeholder="What's in the photo?" onChange={(e) => set("gallery", f.gallery.map((x, k) => (k === i ? { ...x, alt: e.target.value } : x)))} aria-label={`Photo ${i + 1} description`} />
                <div className="flex gap-1">
                  <Button type="button" size="sm" variant="ghost" className="text-ink" disabled={i === 0} onClick={() => moveGallery(i, -1)} aria-label="Move earlier">
                    <ArrowUp />
                  </Button>
                  <Button type="button" size="sm" variant="ghost" className="text-ink" disabled={i === f.gallery.length - 1} onClick={() => moveGallery(i, 1)} aria-label="Move later">
                    <ArrowDown />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <UploadButton className="mt-3" multiple label="Add gallery photos" onFiles={(files) => upload(files, (url) => setF((p) => ({ ...p, gallery: [...p.gallery, { src: url, alt: "" }] })))} />
        </div>
        {uploading > 0 && (
          <p role="status" className="flex items-center gap-2 text-sm text-sage sm:col-span-2">
            <Loader2 className="size-4 animate-spin" /> Uploading {uploading} photo{uploading > 1 ? "s" : ""}…
          </p>
        )}
      </Section>

      <Section title="Size & prices" hint="Prices are indicative “from” prices; you send the exact quote for each booking.">
        <NumberField label="Bedrooms" value={f.capacity.bedrooms} onChange={(v) => set("capacity", { ...f.capacity, bedrooms: v })} error={err("capacity.bedrooms")} />
        <NumberField label="Sleeps (overnight guests)" value={f.capacity.sleeps} onChange={(v) => set("capacity", { ...f.capacity, sleeps: v })} error={err("capacity.sleeps")} />
        <NumberField label="Event guests (max)" value={f.capacity.eventGuests} onChange={(v) => set("capacity", { ...f.capacity, eventGuests: v })} error={err("capacity.eventGuests")} />
        <NumberField label="Acres" value={f.acres} step={0.5} onChange={(v) => set("acres", v)} error={err("acres")} />
        <PriceField label="Day out from (₹)" value={f.price.dayOut} onChange={(v) => set("price", { ...f.price, dayOut: price(v) })} />
        <PriceField label="Night stay from (₹ / night)" value={f.price.night} onChange={(v) => set("price", { ...f.price, night: price(v) })} />
        <PriceField label="Event / party from (₹)" value={f.price.event} onChange={(v) => set("price", { ...f.price, event: price(v) })} />
      </Section>

      <Section title="Good for & amenities" error={err("occasions")}>
        <Checks label="Good for" all={OCCASIONS} labels={site.occasionLabels} value={f.occasions} onChange={(v) => set("occasions", v as Farmhouse["occasions"])} />
        <Checks label="Amenities" all={AMENITIES} labels={site.amenityLabels} value={f.amenities} onChange={(v) => set("amenities", v as Farmhouse["amenities"])} />
      </Section>

      <Section title="Spaces" hint="The walk-through on the farmhouse page — pool, lawn, rooms, hall… Up to 6.">
        <ul className="grid gap-4 sm:col-span-2 lg:grid-cols-2">
          {f.spaces.map((s, i) => (
            <li key={s.id} className="grid gap-3 rounded-2xl border border-line p-4">
              <div className="flex items-start gap-3">
                <PhotoTile media={s.image} />
                <div className="flex flex-1 flex-col gap-2">
                  <input className={fieldBase} value={s.name} onChange={(e) => setSpace(i, { name: e.target.value })} placeholder="The Pool" aria-label="Space name" aria-invalid={!!err(`spaces.${i}.name`)} />
                  <UploadButton label={s.image.src ? "Replace photo" : "Add photo"} onFiles={(files) => upload([files[0]], (url) => setSpace(i, { image: { src: url, alt: s.name } }))} />
                </div>
                <Button type="button" size="icon" variant="ghost" className="text-muted" onClick={() => set("spaces", f.spaces.filter((_, k) => k !== i))} aria-label="Remove space">
                  <X />
                </Button>
              </div>
              <textarea rows={2} className={cn(fieldBase, "py-2")} value={s.description} onChange={(e) => setSpace(i, { description: e.target.value })} placeholder="Cool water, sun loungers and a view of the fields." aria-label="Space description" />
              <div className="grid grid-cols-3 gap-2">
                {s.chips.map((c, k) => (
                  <input key={k} className={cn(fieldBase, "min-h-10 text-sm")} value={c} maxLength={24} onChange={(e) => setSpace(i, { chips: s.chips.map((x, j) => (j === k ? e.target.value : x)) as Space["chips"] })} placeholder={["Private", "Loungers", "Kids' end"][k]} aria-label={`Tag ${k + 1}`} />
                ))}
              </div>
              {(err(`spaces.${i}.image.src`) || err(`spaces.${i}.name`)) && <p className="text-sm text-terra">{err(`spaces.${i}.name`) ?? "Add a photo for this space"}</p>}
            </li>
          ))}
        </ul>
        {f.spaces.length < 6 && (
          <Button type="button" variant="outline" className="self-start text-ink sm:col-span-2" onClick={() => set("spaces", [...f.spaces, { id: `space-${Date.now().toString(36)}`, name: "", description: "", chips: ["", "", ""], image: blankMedia }])}>
            <Plus /> Add a space
          </Button>
        )}
      </Section>

      <Section title="Times & house rules">
        <TextField label="Check-in" value={f.times.checkIn} onChange={(v) => set("times", { ...f.times, checkIn: v })} />
        <TextField label="Check-out" value={f.times.checkOut} onChange={(v) => set("times", { ...f.times, checkOut: v })} />
        <TextField label="Day-out hours" value={f.times.dayOut} onChange={(v) => set("times", { ...f.times, dayOut: v })} />
        <TextField label="Music stops at" value={f.times.musicCutoff} onChange={(v) => set("times", { ...f.times, musicCutoff: v })} />
        <Field label="House rules (one per line)" id={id("rules")} className="sm:col-span-2">
          <textarea id={id("rules")} rows={6} className={cn(fieldBase, "py-3")} value={f.rules.join("\n")} onChange={(e) => set("rules", e.target.value.split("\n"))} />
        </Field>
      </Section>

      <Section title="Private — owner & address" hint="Never shown on the website. The address and caretaker go on the guest's booking pass only after the advance is confirmed.">
        <TextField label="Owner's name" value={o.ownerName} onChange={(v) => setOwner("ownerName", v)} />
        <TextField label="Owner's WhatsApp" value={o.ownerWhatsapp} onChange={(v) => setOwner("ownerWhatsapp", v)} mono error={err("ownerWhatsapp")} />
        <TextField label="Caretaker's name" value={o.caretakerName} onChange={(v) => setOwner("caretakerName", v)} />
        <TextField label="Caretaker's phone" value={o.caretakerPhone} onChange={(v) => setOwner("caretakerPhone", v)} mono />
        <TextField label="Exact address" value={o.exactAddress} onChange={(v) => setOwner("exactAddress", v)} wide />
        <TextField label="Google Maps link" value={o.mapsUrl} onChange={(v) => setOwner("mapsUrl", v)} wide error={err("mapsUrl")} />
        <Field label="Your notes (commission, payout, quirks)" id={id("notes")} className="sm:col-span-2">
          <textarea id={id("notes")} rows={3} className={cn(fieldBase, "py-3")} value={o.notes ?? ""} onChange={(e) => setOwner("notes", e.target.value)} />
        </Field>
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/90 backdrop-blur">
        <div className="container-x flex flex-wrap items-center justify-between gap-3 py-3">
          <div>
            {existingSlug &&
              (confirmDelete ? (
                <span className="flex items-center gap-2">
                  <Button type="button" size="sm" variant="ghost" className="text-terra" onClick={remove}>
                    Yes, delete it
                  </Button>
                  <Button type="button" size="sm" variant="ghost" className="text-muted" onClick={() => setConfirmDelete(false)}>
                    Keep
                  </Button>
                </span>
              ) : (
                <Button type="button" size="sm" variant="ghost" className="text-muted" onClick={() => setConfirmDelete(true)}>
                  <Trash2 /> Delete
                </Button>
              ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="text-ink" disabled={saving || uploading > 0} onClick={() => save(false)}>
              {initial.published ? "Unpublish & save" : "Save draft"}
            </Button>
            <Button type="button" disabled={saving || uploading > 0} onClick={() => save(true)}>
              {saving && <Loader2 className="animate-spin" />} {initial.published ? "Save" : "Publish"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------- small parts */
function Section({ title, hint, error, children }: { title: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[var(--radius-card)] border border-line bg-card p-5 md:p-7">
      <h2 className="display mb-1 text-[1.6rem] leading-tight">{title}</h2>
      {hint && <p className="mb-5 text-sm text-muted">{hint}</p>}
      {error && (
        <p role="alert" className="mb-4 text-sm text-terra">
          {error}
        </p>
      )}
      <div className={cn("grid gap-x-4 gap-y-5 sm:grid-cols-2", !hint && "mt-4")}>{children}</div>
    </section>
  );
}

function PhotoTile({ media, onRemove, big }: { media: Media; onRemove?: () => void; big?: boolean }) {
  return (
    <div className={cn("relative shrink-0 overflow-hidden rounded-xl bg-ink/5", big ? "aspect-[16/10] w-64" : "aspect-[4/3] w-full min-w-24 max-w-40")}>
      {media.src ? (
        <Image src={media.src} alt={media.alt} fill sizes="256px" className="object-cover" />
      ) : (
        <span className="grid h-full place-items-center text-muted">
          <ImagePlus className="size-6" strokeWidth={1.5} aria-hidden="true" />
        </span>
      )}
      {onRemove && (
        <button type="button" onClick={onRemove} className="absolute right-1.5 top-1.5 grid size-8 place-items-center rounded-full bg-ink/70 text-cream" aria-label="Remove photo">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

function UploadButton({ label, onFiles, multiple, className }: { label: string; onFiles: (f: FileList) => void; multiple?: boolean; className?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <Button type="button" variant="outline" size="sm" className={cn("text-ink", className)} onClick={() => ref.current?.click()}>
        <ImagePlus /> {label}
      </Button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple={multiple}
        hidden
        onChange={(e) => {
          if (e.target.files?.length) onFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </>
  );
}

function NumberField({ label, value, onChange, error, step = 1 }: { label: string; value: number; onChange: (v: number) => void; error?: string; step?: number }) {
  const uid = useId();
  return (
    <Field label={label} id={uid} error={error}>
      <input id={uid} type="number" inputMode="decimal" min={0} step={step} className={cn(fieldBase, "font-mono")} value={value} onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} aria-invalid={!!error} />
    </Field>
  );
}

function PriceField({ label, value, onChange }: { label: string; value: number | null; onChange: (v: string) => void }) {
  const uid = useId();
  return (
    <Field label={label} id={uid} hint="Leave empty for “on request”">
      <input id={uid} type="number" inputMode="numeric" min={0} step={500} className={cn(fieldBase, "font-mono")} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

function TextField({ label, value, onChange, error, mono, wide }: { label: string; value: string; onChange: (v: string) => void; error?: string; mono?: boolean; wide?: boolean }) {
  const uid = useId();
  return (
    <Field label={label} id={uid} error={error} className={wide ? "sm:col-span-2" : undefined}>
      <input id={uid} className={cn(fieldBase, mono && "font-mono")} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} />
    </Field>
  );
}

function Checks({ label, all, labels, value, onChange }: { label: string; all: readonly string[]; labels: Record<string, string>; value: string[]; onChange: (v: string[]) => void }) {
  const on = useMemo(() => new Set(value), [value]);
  return (
    <fieldset className="sm:col-span-2">
      <legend className="eyebrow mb-2 text-muted">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {all.map((k) => (
          <label key={k} className={cn("flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm", on.has(k) ? "border-sage bg-sage/10" : "border-line")}>
            <input type="checkbox" className="size-4 accent-[var(--sage)]" checked={on.has(k)} onChange={(e) => onChange(e.target.checked ? [...value, k] : value.filter((x) => x !== k))} />
            {labels[k] ?? k}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
