import { NextRequest } from "next/server";
import { connection } from "next/server";
import { ADMIN_COOKIE, verifyToken } from "@/lib/adminAuth";
import { autopostStatus, postOne } from "@/lib/autopost";

const dev = process.env.NODE_ENV !== "production";

function allowed(req: NextRequest) {
  return dev || verifyToken(req.cookies.get(ADMIN_COOKIE)?.value);
}

/** GET: status of the auto-poster (admin only). */
export async function GET(req: NextRequest) {
  await connection();
  if (!allowed(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  return Response.json(autopostStatus(), { headers: { "Cache-Control": "no-store" } });
}

/** POST ?dry=1 -> preview a post without sending; POST -> post one now (admin only). */
export async function POST(req: NextRequest) {
  await connection();
  if (!allowed(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  const dry = req.nextUrl.searchParams.get("dry") === "1";
  const r = await postOne({ dry });
  if ("image" in r && r.image) {
    if (req.nextUrl.searchParams.get("img") === "1") {
      return new Response(new Uint8Array(r.image), { headers: { "Content-Type": "image/jpeg", "Cache-Control": "no-store" } });
    }
    const { image, ...rest } = r;
    void image;
    return Response.json(rest);
  }
  return Response.json(r);
}
