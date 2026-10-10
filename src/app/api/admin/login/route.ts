import { cookies } from "next/headers";
import { bad, readJson } from "@/lib/api";
import { ADMIN_COOKIE, adminConfigured, checkPassword, makeSession } from "@/lib/admin-auth";

export async function POST(req: Request) {
  if (!adminConfigured()) return bad("Set ADMIN_PASSWORD in your environment variables first.", 503);
  const body = (await readJson(req)) as { password?: unknown } | null;
  const pw = typeof body?.password === "string" ? body.password : "";
  if (!checkPassword(pw)) {
    await new Promise((r) => setTimeout(r, 700)); // slow down guessing
    return bad("That password isn't right.", 401);
  }
  const s = makeSession();
  (await cookies()).set(ADMIN_COOKIE, s.value, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: s.maxAge });
  return Response.json({ ok: true });
}
