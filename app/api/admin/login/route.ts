import { NextRequest } from "next/server";
import { ADMIN_COOKIE, COOKIE_OPTIONS, adminConfigured, checkPassword, clearAttempts, makeToken, tooManyAttempts } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  if (!adminConfigured()) {
    return Response.json({ error: "Admin is not configured. Set ADMIN_PASSWORD (8+ characters) on the server." }, { status: 503 });
  }
  const ip = req.headers.get("fly-client-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooManyAttempts(ip)) return Response.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });

  let password = "";
  try {
    const body = await req.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {}
  if (!checkPassword(password)) return Response.json({ error: "Wrong password." }, { status: 401 });

  clearAttempts(ip);
  const res = Response.json({ ok: true });
  res.headers.append(
    "Set-Cookie",
    `${ADMIN_COOKIE}=${makeToken()}; Path=/; Max-Age=${COOKIE_OPTIONS.maxAge}; HttpOnly; SameSite=Strict${COOKIE_OPTIONS.secure ? "; Secure" : ""}`
  );
  return res;
}
