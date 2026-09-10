import { dedupeOffers, offerKey } from "./searchRules.ts";
import type { CatalogOffer } from "./searchRules.ts";
export type SourceHealth = { provider: string; requested: number; failed: number };
export function contentSignature(offer: CatalogOffer): string {
  const record = { ...offer } as Record<string, unknown>;
  for (const key of ["priceCheckedAt", "modifiedAt"]) delete record[key];
  return JSON.stringify(Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b))));
}
export async function catalogExport<T extends CatalogOffer>(rows: T[], p: URLSearchParams, sources: SourceHealth[]) {
  const page = Number(p.get("page") || 1), pageSize = Number(p.get("pageSize") || 200);
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 200) return { status: 400, body: { ok: false, error: "Invalid export pagination" } };
  if (sources.some(s => s.failed > 0) || !sources.some(s => s.requested > 0)) return { status: 502, body: { ok: false, sources, error: "Niepełny odczyt źródeł. Poprzedni katalog należy zachować." } };
  const pool = dedupeOffers(rows).sort((a, b) => offerKey(a).localeCompare(offerKey(b)));
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pool.map(contentSignature).join("\n")));
  const version = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
  if (p.has("version") && p.get("version") !== version) return { status: 409, body: { ok: false, error: "Catalog changed during export. Retry entire refresh." } };
  return { status: 200, body: { ok: true, schemaVersion: 2, exportVersion: version, checkedAt: new Date().toISOString(), sources,
    retrievalScope: "configured-search-terms-first-feed-page", providerCatalogComplete: false,
    page, pageSize, totalMatches: pool.length, sourceCount: pool.length,
    destinationCount: new Set(pool.map(o => `${o.city}|${o.country}`)).size,
    offers: pool.slice((page - 1) * pageSize, page * pageSize),
  } };
}
