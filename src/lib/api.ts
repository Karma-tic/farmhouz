import "server-only";
import { DatabaseNotConfigured } from "@/lib/db";

/** Origin used in links we send (tracking pages, admin links). */
export function originOf(req: Request) {
  return process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

export const bad = (error: string, status = 400, extra: object = {}) => Response.json({ ok: false, error, ...extra }, { status });

/** Turns unexpected errors into JSON, with a friendly message when the database isn't connected yet. */
export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof DatabaseNotConfigured)
      return bad("Online booking isn't switched on yet — please message us on WhatsApp and we'll book it for you.", 503, { code: "NO_DB" });
    console.error("[api]", e);
    return bad("Something went wrong on our side. Please try again, or message us on WhatsApp.", 500);
  }
}
