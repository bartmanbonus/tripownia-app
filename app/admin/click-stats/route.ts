import { NextRequest, NextResponse } from "next/server";
import { clearClickStats, readClickStats } from "@/lib/clickStats";
import { adminAuthError, verifyAdminRequest } from "@/lib/adminAuthServer";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return adminAuthError(auth);
  const stats = readClickStats(request);
  return NextResponse.json({ stats }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return adminAuthError(auth);
  const response = NextResponse.json({ ok: true, stats: { total: 0, byPartner: {}, bySource: {}, byOffer: {}, recent: [] } });
  clearClickStats(response);
  return response;
}
