import { dedupeOffers, offerKey } from "../lib/searchRules.ts";
import { contentSignature } from "../lib/catalogExport.ts";
import type { CatalogOffer } from "../lib/searchRules.ts";
type Row = CatalogOffer & { affiliateUrl: string };
type Snapshot = { checkedAt?: string | null; snapshotAt?: string | null; offers?: Row[] };
export function shouldRefresh(event: string, schedule: string, now = new Date()): boolean {
  if (event === "workflow_dispatch") return true;
  if (event !== "schedule") return false;
  if (schedule === "10 12 * * *") return true;
  // Compare the scheduled UTC hour with Warsaw's offset, NOT the runner's start minute.
  const zone = new Intl.DateTimeFormat("en", { timeZone: "Europe/Warsaw", timeZoneName: "shortOffset" }).formatToParts(now).find(p => p.type === "timeZoneName")?.value;
  return schedule === (zone === "GMT+2" ? "10 6 * * *" : "10 7 * * *");
}
export async function collectSnapshot(baseUrl: string, previous: Snapshot, fetcher: typeof fetch = fetch) {
  const rows: Row[] = [];
  let version = "", checkedAt = "", total = -1, destinationCount = 0;
  let sources: unknown[] = [];
  for (let page = 1; page <= 100; page++) {
    const url = new URL("/api/today-offers", baseUrl);
    url.search = new URLSearchParams({ mode: "search", broad: "1", __direct: "1", page: String(page), pageSize: "200", ...(version ? { version } : {}) }).toString();
    const response = await fetcher(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(90000) });
    const data = await response.json();
    if (!response.ok || data.ok !== true || data.schemaVersion !== 2) throw new Error(`Export failed at page ${page} (HTTP ${response.status}). Previous snapshot retained.`);
    if (!Array.isArray(data.sources) || data.sources.some((s: { failed: number }) => s.failed > 0)) throw new Error("Incomplete sources; previous snapshot retained.");
    if (!Array.isArray(data.offers) || data.page !== page || data.pageSize !== 200 || !Number.isSafeInteger(data.totalMatches) || data.totalMatches < 1) throw new Error("Invalid export page.");
    if (!version) {
      version = data.exportVersion; checkedAt = data.checkedAt; total = data.totalMatches;
      destinationCount = data.destinationCount; sources = data.sources;
      if (typeof version !== "string" || !/^[a-f0-9]{64}$/.test(version) || !Number.isFinite(Date.parse(checkedAt))) throw new Error("Missing export version or source timestamp.");
    }
    if (version !== data.exportVersion || total !== data.totalMatches) throw new Error("Catalog changed while paging; retry entire refresh.");
    if (data.offers.length !== Math.min(200, total - rows.length)) throw new Error("Incomplete export page; previous snapshot retained.");
    for (const offer of data.offers) {
      if (!offer || !["number", "string"].includes(typeof offer.id) || !offer.id || !Number.isFinite(offer.price) || offer.price <= 0 || !offer.affiliateUrl) throw new Error("Invalid offer.");
      const link = new URL(offer.affiliateUrl);
      if (!["http:", "https:"].includes(link.protocol) || link.username || link.password) throw new Error("Invalid offer URL.");
      rows.push(offer);
    }
    if (rows.length === total) break;
  }
  if (rows.length !== total) throw new Error("Export exceeds safety limit; previous snapshot retained.");
  const offers = dedupeOffers(rows);
  if (offers.length !== total) throw new Error("Duplicate or changing export pages; previous snapshot retained.");
  const before = new Map((previous.offers || []).map(o => [offerKey(o), o]));
  const added = offers.filter(o => !before.has(offerKey(o))).length;
  const updated = offers.filter(o => { const old = before.get(offerKey(o)); return old && contentSignature(old) !== contentSignature(o); }).length;
  return { ok: true, checkedAt, snapshotAt: new Date().toISOString(), sourceCount: offers.length, destinationCount,
    exportVersion: version, sources, providerCatalogComplete: false, retrievalScope: "configured-search-terms-first-feed-page", added, updated, offers };
}
