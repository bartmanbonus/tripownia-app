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

function socialLandingPath(offer: Offer) {
  const isDynamicFeedOffer = offer.id >= 1_000_000;
  const isFlight = offer.category.includes("flight") || offer.hotel === "Tylko lot";

  // Dynamic feed IDs are replaced by the next daily snapshot. Linking them to
  // /oferta/:id would create dead social URLs later. Keep those posts pointed
  // at durable, indexable hubs instead; static catalog offers keep detail URLs.
  if (isDynamicFeedOffer) return isFlight ? "/tanie-loty" : "/okazje";
  return `/oferta/${offer.id}`;
}

export function socialTrackingUrl(offer: Offer, source: "facebook" | "instagram") {
  const url = new URL(socialLandingPath(offer), SITE_URL);
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", "social");
  url.searchParams.set("utm_campaign", offer.category.includes("flight") ? "perelka_lotnicza" : "oferta_dnia");
  url.searchParams.set("utm_content", `${offer.city}-${offer.id}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
  return url.toString();
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

export async function publishFacebook(offer: Offer, approvedText: string): Promise<SocialPublishResult> {
  const pageId = process.env.META_FACEBOOK_PAGE_ID;
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) {
    return { platform: "facebook", ok: false, error: "Brak META_FACEBOOK_PAGE_ID lub META_PAGE_ACCESS_TOKEN" };
  }

  try {
    const data = await graphPost(
      `${pageId}/feed`,
      new URLSearchParams({
        access_token: token,
        message: approvedText,
        link: socialTrackingUrl(offer, "facebook"),
      })
    );
    return { platform: "facebook", ok: true, id: data.id };
  } catch (error) {
    return { platform: "facebook", ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function publishInstagram(offer: Offer, approvedText: string): Promise<SocialPublishResult> {
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
        caption: approvedText,
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
