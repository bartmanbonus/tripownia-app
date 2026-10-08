import { NextRequest, NextResponse } from "next/server";
import { clearClickStats, readClickStats, type ClickStats } from "@/lib/clickStats";
import { getAdminAffiliateRows, type AffiliateAnalyticsRow } from "@/lib/affiliateAnalyticsStore";
import { adminAuthError, verifyAdminRequest } from "@/lib/adminAuthServer";

export const dynamic = "force-dynamic";

type GlobalStats = ClickStats & {
  scope: "global" | "local";
  days: number;
  byDay: Record<string, number>;
  byAttributionSource?: Record<string, number>;
  byLanding?: Record<string, number>;
  googleOrganicByLanding?: Record<string, number>;
  googleOrganicClicks?: number;
  authStatus?: "admin" | "signed_out" | "forbidden" | "unauthorized" | "error";
  truncated?: boolean;
};

function clampDays(value: string | null) {
  const parsed = Number(value || 30);
  if (parsed <= 7) return 7;
  if (parsed <= 30) return 30;
  return 90;
}

function aggregate(rows: AffiliateAnalyticsRow[], days: number, truncated = false): GlobalStats {
  const stats: GlobalStats = {
    total: rows.length,
    byPartner: {},
    bySource: {},
    byOffer: {},
    recent: [],
    byDay: {},
    byAttributionSource: {},
    byLanding: {},
    googleOrganicByLanding: {},
    googleOrganicClicks: 0,
    scope: "global",
    days,
    authStatus: "admin",
    updatedAt: rows[0]?.created_at,
    truncated,
  };

  for (const row of rows) {
    stats.byPartner[row.partner] = (stats.byPartner[row.partner] || 0) + 1;
    stats.bySource[row.source] = (stats.bySource[row.source] || 0) + 1;

    if (row.offer_id) {
      const current = stats.byOffer[row.offer_id] || {
        count: 0,
        partner: row.partner,
        destination: row.destination || "",
      };
      stats.byOffer[row.offer_id] = {
        count: current.count + 1,
        partner: row.partner || current.partner,
        destination: row.destination || current.destination,
      };
    }

    const day = row.created_at.slice(0, 10);
    stats.byDay[day] = (stats.byDay[day] || 0) + 1;

    const attributionSource = (row.utm_source || "direct").toLowerCase();
    stats.byAttributionSource![attributionSource] = (stats.byAttributionSource![attributionSource] || 0) + 1;

    const landing = row.landing || row.page || "(brak)";
    stats.byLanding![landing] = (stats.byLanding![landing] || 0) + 1;

    if (attributionSource === "google" && (row.utm_medium || "").toLowerCase() === "organic") {
      stats.googleOrganicClicks = (stats.googleOrganicClicks || 0) + 1;
      stats.googleOrganicByLanding![landing] = (stats.googleOrganicByLanding![landing] || 0) + 1;
    }
  }

  stats.recent = rows.slice(0, 20).map((row) => ({
    ts: row.created_at,
    partner: row.partner,
    source: row.source,
    offer: row.offer_id,
    destination: row.destination,
    price: row.price === null ? null : String(row.price),
    page: row.page,
    clickId: row.click_id,
  }));

  return stats;
}

function localStats(request: NextRequest, days: number, authStatus: GlobalStats["authStatus"]): GlobalStats {
  const stats = readClickStats(request);
  const byDay: Record<string, number> = {};
  for (const item of stats.recent) {
    const day = item.ts?.slice(0, 10);
    if (day) byDay[day] = (byDay[day] || 0) + 1;
  }
  return { ...stats, scope: "local", days, byDay, authStatus };
}

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return adminAuthError(auth);

  const days = clampDays(request.nextUrl.searchParams.get("days"));
  const result = await getAdminAffiliateRows(auth.token, days);
  if (result.status === 200) {
    return NextResponse.json(
      { stats: aggregate(result.rows, days, result.truncated) },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const authStatus = result.status === 401 ? "unauthorized" : result.status === 403 ? "forbidden" : "error";
  return NextResponse.json(
    { stats: localStats(request, days, authStatus) },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return adminAuthError(auth);

  const response = NextResponse.json({
    ok: true,
    stats: {
      total: 0,
      byPartner: {},
      bySource: {},
      byOffer: {},
      recent: [],
      byDay: {},
      scope: "local",
      days: 30,
    },
  });
  clearClickStats(response);
  return response;
}
