import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "fz_admin";
const WEEK = 7 * 24 * 3600;

const secret = () => process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";
export const adminConfigured = () => Boolean(process.env.ADMIN_PASSWORD);

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

function safeEqual(a: string, b: string) {
  const A = Buffer.from(a), B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
}

export function checkPassword(input: string) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const a = createHmac("sha256", "fz").update(input).digest();
  const b = createHmac("sha256", "fz").update(pw).digest();
  return timingSafeEqual(a, b);
}

export function makeSession() {
  const exp = Math.floor(Date.now() / 1000) + WEEK;
  return { value: `${exp}.${sign(String(exp))}`, maxAge: WEEK };
}

export function verifySession(value: string | undefined) {
  if (!value || !secret()) return false;
  const [exp, sig] = value.split(".");
  if (!exp || !sig || Number(exp) * 1000 < Date.now()) return false;
  return safeEqual(sig, sign(exp));
}

/** For route handlers: true when the request carries a valid admin session. */
export async function isAdmin() {
  return verifySession((await cookies()).get(ADMIN_COOKIE)?.value);
}

export const unauthorized = () => Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
