import { Eye } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { FarmGallery } from "@/components/farm/FarmGallery";
import { FarmHero } from "@/components/farm/FarmHero";
import { FarmOverview } from "@/components/farm/FarmOverview";
import { FarmRules } from "@/components/farm/FarmRules";
import { Footer } from "@/components/sections/Footer";
import { Location } from "@/components/sections/Location";
import { Packages } from "@/components/sections/Packages";
import { Spaces } from "@/components/sections/Spaces";
import { site } from "@/content/site";
import { isAdmin } from "@/lib/admin-auth";
import { getFarmForPreview } from "@/lib/farms/server";

export const metadata: Metadata = { title: "Preview", robots: { index: false, follow: false } };

export function generateStaticParams() {
  return [{ slug: "_" }];
}

/**
 * Admin-only preview of a farmhouse page — works for drafts and before launch.
 * Visitors who aren't signed in to the admin get a 404.
 */
export default function PreviewPage({ params }: PageProps<"/preview/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-svh" aria-busy="true" />}>
      <Preview params={params} />
    </Suspense>
  );
}

async function Preview({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  if (!(await isAdmin())) notFound();
  const farm = await getFarmForPreview((await params).slug);
  if (!farm) notFound();
  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-ink text-cream">
        <div className="container-x flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
          <span className="flex items-center gap-2">
            <Eye className="size-4" aria-hidden="true" /> Preview — only you can see this.{" "}
            {!farm.published ? "This farmhouse is a draft." : !site.launched ? "It goes public when you launch." : "It's live."}
          </span>
          <Link href={`/admin/farms/edit?slug=${farm.slug}`} className="rounded-full bg-wheat px-4 py-2 font-medium text-on-wheat">
            Back to editor
          </Link>
        </div>
      </div>
      <main id="main">
        <FarmHero farm={farm} />
        <FarmOverview farm={farm} />
        {farm.spaces.length > 0 && <Spaces farm={farm} />}
        <Packages farm={farm} />
        <FarmGallery farm={farm} />
        <FarmRules farm={farm} />
        <Location farm={farm} />
      </main>
      <Footer />
    </>
  );
}
