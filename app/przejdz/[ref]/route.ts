import { NextRequest, NextResponse } from "next/server";
import { GET as followTrackedPartnerLink } from "@/app/go/live/route";
import { resolveAffiliateLink } from "@/lib/affiliateLinkToken";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const payload = openAffiliateLink(ref);
  if (!payload || payload.mode !== "exit") {
    return NextResponse.redirect(new URL("/okazje", request.url), 307);
  }

  // Reuse the existing partner allowlist, attribution and click recording logic.
  // Do not issue an intermediate HTTP redirect with the plaintext affiliate URL.
  const internal = new URL("/go/live", request.url);
  internal.searchParams.set("target", payload.target);
  internal.searchParams.set("partner", payload.partner);
  for (const [key, value] of Object.entries(payload.context)) internal.searchParams.set(key, value);
  const response = await followTrackedPartnerLink(new NextRequest(internal, { headers: request.headers }));
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("Cache-Control", "no-store");
  return response;
}
