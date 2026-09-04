import { NextRequest, NextResponse } from "next/server";
import { findBestEximOffer } from "@/lib/eximLive";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const p = request.nextUrl.searchParams;
    const result = await findBestEximOffer({
      destination: p.get("destination") || "",
      country: p.get("country") || "",
      from: p.get("from") || "WAW",
      nights: Number(p.get("nights") || 0),
      board: p.get("board") || "",
    });
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[tripownia_exim_live]", error);
    return NextResponse.json({ available: false, checkedAt: new Date().toISOString() }, { status: 200 });
  }
}
