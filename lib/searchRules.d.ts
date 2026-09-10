export type CatalogOffer = Record<string, any>;
export type CatalogFilters = { q?: string; from?: string; nights?: string; board?: string; weekend?: boolean | string; maxPrice?: number; dateFrom?: string; dateTo?: string };
export function normalizeSearch(value?: string): string;
export function dedupeOffers(rows?: CatalogOffer[]): CatalogOffer[];
export function filterCatalog(rows?: CatalogOffer[], filters?: CatalogFilters): CatalogOffer[];
export function paginate(rows: CatalogOffer[], page?: number, pageSize?: number): { page:number; pageSize:number; totalMatches:number; offers:CatalogOffer[] };
