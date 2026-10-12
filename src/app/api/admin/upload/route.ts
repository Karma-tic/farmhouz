import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { bad } from "@/lib/api";
import { isAdmin, unauthorized } from "@/lib/admin-auth";

const MAX = 4 * 1024 * 1024; // photos are resized in the browser first, so this is generous
const TYPES = ["image/webp", "image/jpeg", "image/png", "image/avif"];

/**
 * Admin photo upload. Stored in Vercel Blob (free tier) when connected;
 * during local development it falls back to public/uploads.
 */
export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return bad("No photo received", 400);
  if (!TYPES.includes(file.type)) return bad("Use a JPG, PNG or WebP photo", 415);
  if (file.size > MAX) return bad("That photo is too large (max 4 MB after resizing)", 413);
  const ext = file.type.split("/")[1];
  const name = `farms/${randomUUID()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(name, file, { access: "public", contentType: file.type, cacheControlMaxAge: 31536000 });
    return Response.json({ ok: true, url: blob.url });
  }
  if (!process.env.VERCEL) {
    const dir = path.join(process.cwd(), "public/uploads/farms");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(process.cwd(), "public/uploads", name), Buffer.from(await file.arrayBuffer()));
    return Response.json({ ok: true, url: `/uploads/${name}` });
  }
  return bad("Photo storage isn't connected yet (Vercel → Storage → Blob).", 503);
}
