import { NextRequest, NextResponse } from "next/server";
import snapshot from "@/data/live-offers-snapshot.json";
import { filterCatalog, paginate, parseCatalogQuery } from "@/lib/searchRules";
import { isTravelDestinationAllowed } from "@/lib/travelSafety";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  let query;
  try { query = parseCatalogQuery(request.nextUrl.searchParams); }
  catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Nieprawidłowe zapytanie." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  const { filters, page, pageSize } = query;
  const rows = Array.isArray(snapshot.offers) ? snapshot.offers : [];
  const active = filterCatalog(rows).filter(o => isTravelDestinationAllowed(o.city, o.country));
  const result = paginate(filterCatalog(active, filters), page, pageSize);
  const checkedAt = snapshot.checkedAt;
  const stale = !checkedAt || !Number.isFinite(Date.parse(checkedAt)) || Date.now() - Date.parse(checkedAt) > 86400000;
  return NextResponse.json({ ok: true, ...result, catalogSize: active.length, storedSize: rows.length,
    catalogCheckedAt: checkedAt, catalogSnapshotAt: snapshot.snapshotAt, stale, filters, broadened: false,
    scope: "imported-catalog", notice: "Przeszukujemy zapisany katalog Tripowni, nie cały asortyment dostawców. Cena i dostępność do potwierdzenia u partnera.",
  }, { headers: { "Cache-Control": "no-store" } });
}
