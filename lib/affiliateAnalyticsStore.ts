const DEFAULT_SUPABASE_URL = "https://wgbzccgcfhnouakswyvj.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_5S3oW5eD0MTLArG0gZANIw_ORJiqQQl";

function supabaseUrl() {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, "");
}

function supabaseKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || DEFAULT_SUPABASE_KEY;
}

function asPrice(value?: string | null) {
  if (!value) return null;
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1_000_000 ? parsed : null;
}

export type AffiliateClickEvent = {
  clickId: string;
  partner: string;
  source: string;
  offer?: string | null;
  destination?: string | null;
  price?: string | null;
  page?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  landing?: string | null;
};

export async function recordGlobalAffiliateClick(event: AffiliateClickEvent) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1_200);

  try {
    const key = supabaseKey();
    const response = await fetch(`${supabaseUrl()}/rest/v1/affiliate_click_events`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        click_id: event.clickId,
        partner: event.partner,
        source: event.source,
        offer_id: event.offer || null,
        destination: event.destination || null,
        price: asPrice(event.price),
        page: event.page || null,
        utm_source: event.utmSource || null,
        utm_medium: event.utmMedium || null,
        utm_campaign: event.utmCampaign || null,
        utm_content: event.utmContent || null,
        landing: event.landing || null,
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    // A repeated clickId is idempotent from the analytics perspective.
    if (!response.ok && response.status !== 409) {
      const detail = (await response.text().catch(() => "")).slice(0, 240);
      console.warn("[affiliate_analytics_store]", response.status, detail);
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[affiliate_analytics_store]", error instanceof Error ? error.message : error);
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export type AffiliateAnalyticsRow = {
  created_at: string;
  click_id: string;
  partner: string;
  source: string;
  offer_id: string | null;
  destination: string | null;
  price: number | null;
  page: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
};

export async function getAdminAffiliateRows(accessToken: string, days: number) {
  const key = supabaseKey();

  const userResponse = await fetch(`${supabaseUrl()}/auth/v1/user`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!userResponse.ok) {
    return { status: 401 as const, rows: [] as AffiliateAnalyticsRow[] };
  }

  const user = await userResponse.json() as { app_metadata?: Record<string, unknown> };
  if (user.app_metadata?.role !== "admin") {
    return { status: 403 as const, rows: [] as AffiliateAnalyticsRow[] };
  }

  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const query = new URLSearchParams({
    select: "created_at,click_id,partner,source,offer_id,destination,price,page,utm_source,utm_medium,utm_campaign",
    created_at: `gte.${since}`,
    order: "created_at.desc",
  });

  const pageSize = 1000;
  const maxRows = 50_000;
  const rows: AffiliateAnalyticsRow[] = [];
  let truncated = false;

  for (let offset = 0; offset < maxRows; offset += pageSize) {
    const response = await fetch(`${supabaseUrl()}/rest/v1/affiliate_click_events?${query.toString()}`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${accessToken}`,
        Range: `${offset}-${offset + pageSize - 1}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = (await response.text().catch(() => "")).slice(0, 240);
      console.warn("[affiliate_analytics_admin]", response.status, detail);
      return { status: response.status as number, rows: [] as AffiliateAnalyticsRow[], truncated: false };
    }

    const page = await response.json() as AffiliateAnalyticsRow[];
    rows.push(...page);
    if (page.length < pageSize) break;
    if (offset + pageSize >= maxRows) truncated = true;
  }

  return { status: 200 as const, rows, truncated };
}
