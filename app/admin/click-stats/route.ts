import { NextRequest, NextResponse } from "next/server";
import { clearClickStats, readClickStats } from "@/lib/clickStats";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const stats = readClickStats(request);
  return NextResponse.json({ stats }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true, stats: { total: 0, byPartner: {}, bySource: {}, byOffer: {}, recent: [] } });
  clearClickStats(response);
  return response;
}
