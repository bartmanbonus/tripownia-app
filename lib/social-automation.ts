import type { Offer } from "@/lib/offers";

export type SocialPublishResult = {
  platform: "facebook" | "instagram";
  ok: boolean;
  id?: string;
  error?: string;
};

const SITE_URL = "https://tripownia.pl";
const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v26.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

function absoluteImageUrl(image: string) {
  if (/^https?:\/\//i.test(image)) return image;
  return `${SITE_URL}${image.startsWith("/") ? image : `/${image}`}`;
}

function trackingUrl(offer: Offer, source: "facebook" | "instagram") {
  const url = new URL(`/oferta/${offer.id}`, SITE_URL);
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", "social");
  url.searchParams.set("utm_campaign", "oferta_dnia");
  url.searchParams.set("utm_content", `${offer.city}-${offer.id}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
  return url.toString();
}

function compact(value: string | undefined) {
  return (value || "").replace(/\s+/g, " ").trim();
}

export function socialCaption(offer: Offer, source: "facebook" | "instagram") {
  const price = new Intl.NumberFormat("pl-PL").format(offer.price);
  const trip = offer.nights ? `${offer.nights} ${offer.nights === 1 ? "noc" : "nocy"}` : "wyjazd";
  const departure = compact(offer.departure);
  const board = compact(offer.board);
  const dates = compact(offer.dates);
  const reason = compact(offer.reason);
  const url = trackingUrl(offer, source);

  const lines = [
    `${offer.flag || "✈️"} ${offer.city}, ${offer.country} — od ${price} zł/os.`,
    [trip, departure && `wylot: ${departure}`, board].filter(Boolean).join(" • "),
    dates,
    reason,
    `Sprawdź ofertę: ${url}`,
    "",
    "#tripownia #okazjepodroznicze #wakacje #podroze #lastminute",
  ].filter(Boolean);

  return lines.join("\n");
}

async function graphPost(path: string, params: URLSearchParams) {
  const response = await fetch(`${GRAPH_BASE}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as { id?: string; error?: { message?: string } };
  if (!response.ok || data.error) {
    throw new Error(data.error?.message || `Meta API HTTP ${response.status}`);
  }
  return data;
}

export async function publishFacebook(offer: Offer): Promise<SocialPublishResult> {
  const pageId = process.env.META_FACEBOOK_PAGE_ID;
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) {
    return { platform: "facebook", ok: false, error: "Brak META_FACEBOOK_PAGE_ID lub META_PAGE_ACCESS_TOKEN" };
  }

  try {
    const params = new URLSearchParams({
      access_token: token,
      message: socialCaption(offer, "facebook"),
      link: trackingUrl(offer, "facebook"),
    });
    const data = await graphPost(`${pageId}/feed`, params);
    return { platform: "facebook", ok: true, id: data.id };
  } catch (error) {
    return { platform: "facebook", ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function publishInstagram(offer: Offer): Promise<SocialPublishResult> {
  const instagramId = process.env.META_INSTAGRAM_ACCOUNT_ID;
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  if (!instagramId || !token) {
    return { platform: "instagram", ok: false, error: "Brak META_INSTAGRAM_ACCOUNT_ID lub META_PAGE_ACCESS_TOKEN" };
  }

  try {
    const container = await graphPost(
      `${instagramId}/media`,
      new URLSearchParams({
        access_token: token,
        image_url: absoluteImageUrl(offer.image),
        caption: socialCaption(offer, "instagram"),
      })
    );
    if (!container.id) throw new Error("Meta API nie zwróciło ID kontenera Instagrama");

    const published = await graphPost(
      `${instagramId}/media_publish`,
      new URLSearchParams({ access_token: token, creation_id: container.id })
    );
    return { platform: "instagram", ok: true, id: published.id };
  } catch (error) {
    return { platform: "instagram", ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export function pickOfferForToday(offers: Offer[], now = new Date()) {
  if (!offers.length) return null;
  const dayKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  let hash = 2166136261;
  for (const char of dayKey) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  const shortlist = offers.slice(0, Math.min(6, offers.length));
  return shortlist[(hash >>> 0) % shortlist.length] || shortlist[0];
}
