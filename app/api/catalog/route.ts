import { NextRequest, NextResponse } from "next/server";
import snapshot from "@/data/live-offers-snapshot.json";
import { filterCatalog, paginate } from "@/lib/searchRules.mjs";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const filters = {
    q: (p.get("q") || "").slice(0, 100),
    from: (p.get("from") || "").slice(0, 100),
    nights: p.get("nights") || "any",
    board: p.get("board") || "any",
    weekend: p.get("weekend") === "1",
    maxPrice: Number(p.get("maxPrice") || 0),
    dateFrom: p.get("dateFrom") || "",
    dateTo: p.get("dateTo") || "",
  };
  const rows = Array.isArray(snapshot.offers) ? snapshot.offers : [];
  const filtered = filterCatalog(rows, filters);
  const result = paginate(filtered, Number(p.get("page") || 1), Number(p.get("pageSize") || 200));
  return NextResponse.json({
    ok: true,
    ...result,
    catalogSize: rows.length,
    catalogCheckedAt: snapshot.checkedAt,
    catalogSnapshotAt: snapshot.snapshotAt,
    filters,
    broadened: false,
    notice: result.totalMatches === 0
      ? "Brak dokładnych dopasowań w aktualnie dostępnej bazie Tripowni. Możesz świadomie poszerzyć kryteria albo przejść do wyszukiwarki partnera."
      : "",
  }, { headers: { "Cache-Control": "no-store" } });
}
