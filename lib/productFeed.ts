import { createHash } from 'node:crypto';

type FeedProduct = { offers?: Array<{ sourceProductId?: string; productUrl?: string }> };
type Page = { products: FeedProduct[]; attempts: number; retries: number };
export type FeedResult = {
  products: FeedProduct[]; partial: boolean; truncated: boolean;
  pages: number; failedPages: number; retries: number; error?: string;
};

/** One bounded queue per server instance, shared by both feeds and simultaneous searches.
 * Next's data cache additionally reuses successful upstream pages across requests. */
export function createProductFeedClient(fetcher: typeof fetch = fetch, now = Date.now,
  sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms)), spacing = 300) {
  let queue: Promise<unknown> = Promise.resolve();
  let nextSlot = 0;
  const cache = new Map<string, { expires: number; page: Page }>();
  const pending = new Map<string, Promise<Page>>();
  const ttl = 5 * 60_000;

  async function pageRequest(url: string, key: string, deadline: number): Promise<Page> {
    const hit = cache.get(key);
    if (hit && hit.expires > now()) return { ...hit.page, attempts: 0, retries: 0 };
    if (pending.has(key)) return pending.get(key)!;
    const task = queue.catch(() => {}).then(async () => {
      let retries = 0;
      for (let attempt = 0; attempt < 3; attempt++) {
        const delay = Math.max(0, nextSlot - now());
        if (now() + delay + 100 >= deadline) throw new Error('feed_deadline');
        if (delay) await sleep(delay);
        let response: Response;
        try {
          response = await fetcher(url, {
            headers: { Accept: 'application/json' },
            next: { revalidate: 300 },
            signal: AbortSignal.timeout(Math.max(1, Math.min(6000, deadline - now()))),
          } as RequestInit);
        } catch { throw new Error('feed_network_or_timeout'); }
        nextSlot = now() + spacing;
        if (response.status === 429 || response.status >= 500) {
          const value = response.headers.get('retry-after');
          const seconds = value === null ? NaN : Number(value);
          const retryAfter = value === null ? 0 : Number.isFinite(seconds) ? seconds * 1000 : Math.max(0, Date.parse(value) - now());
          // Never retry earlier than the provider requests. Long waits return partial data.
          const wait = Math.max(1000 * 2 ** attempt, Number.isFinite(retryAfter) ? retryAfter : 0);
          nextSlot = Math.max(nextSlot, now() + wait);
          if (attempt === 2 || nextSlot + 100 >= deadline) throw new Error(`feed_http_${response.status}`);
          retries++;
          continue;
        }
        if (!response.ok) throw new Error(`feed_http_${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data?.products)) throw new Error('feed_invalid_schema');
        const page = { products: data.products as FeedProduct[], attempts: attempt + 1, retries };
        cache.set(key, { expires: now() + ttl, page });
        while (cache.size > 300) cache.delete(cache.keys().next().value!);
        return page;
      }
      throw new Error('feed_unavailable');
    });
    queue = task.catch(() => {});
    pending.set(key, task);
    try { return await task; } finally { pending.delete(key); }
  }

  return async function read(provider: 'exim' | 'tui', query: string, token: string, maxPages: number, deadline: number, field?: 'Country'): Promise<FeedResult> {
    const result: FeedResult = { products: [], partial: false, truncated: false, pages: 0, failedPages: 0, retries: 0 };
    const seen = new Set<string>();
    for (let page = 0; page < maxPages; page++) {
      const filter = field ? `field=${encodeURIComponent(`${field}=${query}`)}` : `q=${encodeURIComponent(query)}`;
      const url = `https://api.tradedoubler.com/1.0/products.json;fid=${provider === 'exim' ? 103442 : 24864};${filter};orderBy=priceAsc;page=${page};pageSize=100;limit=${100 * (page + 1)}?token=${encodeURIComponent(token)}`;
      // Credentials never appear in diagnostics or cache keys.
      const key = createHash('sha256').update(url).digest('hex');
      try {
        const data = await pageRequest(url, key, deadline);
        result.pages++;
        result.retries += data.retries;
        const signature = createHash('sha256').update(JSON.stringify(data.products)).digest('hex');
        if (data.products.length && seen.has(signature)) {
          result.partial = result.truncated = true;
          result.error = 'feed_repeated_page';
          break;
        }
        seen.add(signature);
        result.products.push(...data.products);
        if (data.products.length < 100) return result;
      } catch (error) {
        result.failedPages++;
        result.partial = true;
        result.error = error instanceof Error && /^(feed_)/.test(error.message) ? error.message : 'feed_invalid_response';
        return result;
      }
    }
    if (result.products.length) result.partial = result.truncated = true;
    return result;
  };
}

export const readProductFeed = createProductFeedClient();
