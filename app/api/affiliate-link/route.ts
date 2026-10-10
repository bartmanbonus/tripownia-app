import { NextRequest, NextResponse } from "next/server";
import { partnerFromUrl } from "@/lib/affiliateJourney";
import { affiliateLinkContext, sealAffiliateLink } from "@/lib/affiliateLinkToken";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (Number(request.headers.get("content-length") || 0) > 20_000) {
    return NextResponse.json({ error: "invalid_request" }, { status: 413 });
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("not an object");
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const target = typeof body.target === "string" ? body.target : "";
  const mode = body.mode === "exit" ? "exit" : body.mode === "review" ? "review" : body.mode === "offer" ? "offer" : null;
  const partner = partnerFromUrl(target);
  if (!mode || !partner || target.length > 8192
    || (typeof body.partner === "string" && body.partner !== partner)) {
    return NextResponse.json({ error: "invalid_target" }, { status: 400 });
  }

  try {
    const ref = sealAffiliateLink({ mode, partner, target, context: affiliateLinkContext(body.context) });
    const href = mode === "exit" ? `/przejdz/${ref}` : mode === "offer" ? `/okazja?ref=${ref}` : `/sprawdz-oferte?ref=${ref}`;
    return NextResponse.json({ href }, { headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
  } catch {
    return NextResponse.json({ error: "link_unavailable" }, { status: 503 });
  }
}
