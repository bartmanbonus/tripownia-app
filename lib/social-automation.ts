import type { Offer } from "@/lib/offers";
import { findSocialOfferForCatalogOffer } from "@/lib/socialOffers";

export type SocialPublishResult = {
  platform: "facebook" | "instagram";
  ok: boolean;
  id?: string;
  trackingUrl?: string;
  error?: string;
};

const SITE_URL = "https://tripownia.pl";
const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v26.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

function absoluteImageUrl(image: string) {
  if (/^https?:\/\//i.test(image)) return image;
  return `${SITE_URL}${image.startsWith("/") ? image : `/${image}`}`;
}

function socialCardImageUrl(offer: Offer, format: "feed" | "story" | "tiktok" = "feed") {
  const curated = findSocialOfferForCatalogOffer({
    affiliateUrl: offer.affiliateUrl,
    city: offer.city,
    hotel: offer.hotel,
    price: offer.price,
  });
  if (!curated) return absoluteImageUrl(offer.image);
  if (curated.slug === "bari-alberobello-669" && format === "feed") {
    return `${SITE_URL}/social/bari-alberobello-669/preview`;
  }
  return `${SITE_URL}/api/social-card/${curated.slug}?format=${format}`;
}

function socialLandingPath(offer: Offer) {
  const curated = findSocialOfferForCatalogOffer({
    affiliateUrl: offer.affiliateUrl,
    city: offer.city,
    hotel: offer.hotel,
    price: offer.price,
  });
  if (curated) return `/o/${curated.slug}`;

  const isDynamicFeedOffer = offer.id >= 1_000_000;
  const isFlight = offer.category.includes("flight") || offer.hotel === "Tylko lot";

  // Dynamic feed IDs are replaced by the next daily snapshot. Linking them to
  // /oferta/:id would create dead social URLs later. Keep those posts pointed
  // at durable hubs unless a verified /o/<slug> page exists.
  if (isDynamicFeedOffer) return isFlight ? "/tanie-loty" : "/okazje";
  return `/oferta/${offer.id}`;
}

function alignTripowniaLinks(text: string, trackingUrl: string) {
  return text.replace(
    /https:\/\/(?:www\.)?tripownia\.pl\/(?:o\/[^\s]+|oferta\/\d+|okazje|tanie-loty)(?:\?[^\s]*)?/gi,
    trackingUrl
  );
}

export function socialTrackingUrl(
  offer: Offer,
  source: "facebook" | "instagram",
  placement: "post" | "comment" = "post"
) {
  const url = new URL(socialLandingPath(offer), SITE_URL);
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", "social");
  url.searchParams.set("utm_campaign", offer.category.includes("flight") ? "perelka_lotnicza" : "oferta_dnia");
  url.searchParams.set("utm_content", `${offer.city}-${offer.id}-${placement}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
  return url.toString();
}

function stripTripowniaLinks(text: string) {
  return text
    .replace(/https:\/\/(?:www\.)?tripownia\.pl\/(?:o\/[^\s]+|oferta\/\d+|okazje|tanie-loty)(?:\?[^\s]*)?/gi, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
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

export async function publishFacebook(
  offer: Offer,
  approvedText: string,
  linkPlacement: "post" | "comment" = "post"
): Promise<SocialPublishResult> {
  const pageId = process.env.META_FACEBOOK_PAGE_ID;
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) {
    return { platform: "facebook", ok: false, error: "Brak META_FACEBOOK_PAGE_ID lub META_PAGE_ACCESS_TOKEN" };
  }

  try {
    const trackingUrl = socialTrackingUrl(offer, "facebook", linkPlacement);
    const params = new URLSearchParams({
      access_token: token,
      message: linkPlacement === "post"
        ? alignTripowniaLinks(approvedText, trackingUrl)
        : stripTripowniaLinks(approvedText),
    });
    if (linkPlacement === "post") params.set("link", trackingUrl);

    const data = await graphPost(`${pageId}/feed`, params);
    if (linkPlacement === "comment" && data.id) {
      await graphPost(
        `${data.id}/comments`,
        new URLSearchParams({ access_token: token, message: trackingUrl })
      );
    }
    return { platform: "facebook", ok: true, id: data.id, trackingUrl };
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
    const trackingUrl = socialTrackingUrl(offer, "instagram");
    const container = await graphPost(
      `${instagramId}/media`,
      new URLSearchParams({
        access_token: token,
        image_url: socialCardImageUrl(offer, "feed"),
        caption: alignTripowniaLinks(approvedText, trackingUrl),
      })
    );
    if (!container.id) throw new Error("Meta API nie zwróciło ID kontenera Instagrama");

    const published = await graphPost(
      `${instagramId}/media_publish`,
      new URLSearchParams({ access_token: token, creation_id: container.id })
    );
    return { platform: "instagram", ok: true, id: published.id, trackingUrl };
  } catch (error) {
    return { platform: "instagram", ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
