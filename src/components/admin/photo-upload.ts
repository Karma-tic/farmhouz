"use client";

/**
 * Resizes a photo in the browser (longest side 2000px, WebP or JPEG ~80%) and uploads it.
 * Phone photos of 5–10 MB become ~300–600 KB, which keeps the free storage tier roomy
 * and pages fast.
 */
export async function uploadPhoto(file: File, maxSide = 2000): Promise<string> {
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(`Couldn't read ${file.name}. Use a JPG or PNG photo.`);
  }
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser couldn't process this photo.");
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  const toBlob = (type: string) => new Promise<Blob | null>((r) => canvas.toBlob(r, type, 0.82));
  let blob = await toBlob("image/webp");
  if (!blob || blob.type !== "image/webp") blob = await toBlob("image/jpeg");
  if (!blob) throw new Error("Couldn't compress this photo.");

  const fd = new FormData();
  fd.append("file", new File([blob], `photo.${blob.type === "image/webp" ? "webp" : "jpg"}`, { type: blob.type }));
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const json = (await res.json().catch(() => ({}))) as { ok?: boolean; url?: string; error?: string };
  if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed. Please try again.");
  return json.url;
}
