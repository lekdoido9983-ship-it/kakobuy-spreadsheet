import { NextRequest } from "next/server";
import { ADMIN_COOKIE, adminConfigured, verifyToken } from "@/lib/adminAuth";
import { storageWritable } from "@/lib/store";

export async function GET(req: NextRequest) {
  const configured = adminConfigured();
  const authenticated = configured && verifyToken(req.cookies.get(ADMIN_COOKIE)?.value);
  return Response.json(
    { configured, authenticated, writable: authenticated ? storageWritable() : undefined },
    { headers: { "Cache-Control": "no-store" } }
  );
}
