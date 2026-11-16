import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const hits = new Map<string, number[]>();

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 5;
}

async function addToBrevo(email: string, source: string) {
  const key = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_LIST_ID);
  if (!key || !listId) return null;
  const res = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ email, listIds: [listId], updateEnabled: true, attributes: { SOURCE: source } }),
    signal: AbortSignal.timeout(10_000),
  });
  return res.ok;
}

async function addToMailchimp(email: string, source: string) {
  const key = process.env.MAILCHIMP_API_KEY;
  const list = process.env.MAILCHIMP_LIST_ID;
  if (!key || !list) return null;
  const dc = key.split("-")[1];
  if (!dc) return false;
  const hash = createHash("md5").update(email.toLowerCase()).digest("hex");
  const res = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${list}/members/${hash}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      email_address: email,
      status_if_new: process.env.MAILCHIMP_DOUBLE_OPT_IN === "true" ? "pending" : "subscribed",
      tags: [source],
    }),
    signal: AbortSignal.timeout(10_000),
  });
  return res.ok;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) {
    return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });
  }

  let body: { email?: unknown; source?: unknown; website?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: bots fill the hidden field
  if (typeof body.website === "string" && body.website.length > 0) return NextResponse.json({ ok: true });

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const source = typeof body.source === "string" ? body.source.slice(0, 40) : "site";
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  if (process.env.NODE_ENV !== "production" && process.env.NEWSLETTER_PROVIDER === "mock") {
    console.log("[subscribe:mock]", email, source);
    return NextResponse.json({ ok: true });
  }

  try {
    const results = [await addToBrevo(email, source), await addToMailchimp(email, source)];
    const configured = results.filter((r) => r !== null);
    if (configured.length === 0) {
      console.error("[subscribe] no email provider configured");
      return NextResponse.json({ error: "Signups are temporarily unavailable." }, { status: 503 });
    }
    if (!configured.some(Boolean)) {
      return NextResponse.json({ error: "Could not subscribe right now. Please try again later." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[subscribe] provider error", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Could not subscribe right now. Please try again later." }, { status: 502 });
  }
}
