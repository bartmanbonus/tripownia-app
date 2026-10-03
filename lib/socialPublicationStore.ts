import type { Offer } from "@/lib/offers";
import type { SocialPublishResult } from "@/lib/social-automation";
import { destinationRotationKey } from "@/lib/destination-rotation";

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

export type SocialPublicationEvent = {
  created_at: string;
  platform: "facebook" | "instagram";
  external_id: string | null;
  offer_id: number | null;
  city: string;
  country: string | null;
  destination_key: string;
  hotel: string | null;
  price: number | null;
  link_placement: string | null;
  tracking_url: string | null;
};

export async function recordSocialPublicationEvents(
  accessToken: string,
  userId: string,
  offer: Offer,
  linkPlacement: "post" | "comment",
  results: SocialPublishResult[]
) {
  const rows = results
    .filter((result) => result.ok)
    .map((result) => ({
      platform: result.platform,
      external_id: result.id || null,
      offer_id: offer.id,
      city: offer.city,
      country: offer.country || null,
      destination_key: destinationRotationKey(offer),
      hotel: offer.hotel || null,
      price: offer.price,
      link_placement: result.platform === "facebook" ? linkPlacement : "post",
      tracking_url: result.trackingUrl || null,
      published_by: userId,
    }));

  if (!rows.length) return true;

  const key = supabaseKey();
  const response = await fetch(`${supabaseUrl()}/rest/v1/social_publication_events`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal,resolution=ignore-duplicates",
    },
    body: JSON.stringify(rows),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = (await response.text().catch(() => "")).slice(0, 240);
    console.warn("[social_publication_history_insert]", response.status, detail);
    return false;
  }
  return true;
}

export async function getRecentSocialPublicationEvents(accessToken: string, days = 7) {
  const safeDays = Math.max(1, Math.min(30, Math.floor(days)));
  const since = new Date(Date.now() - safeDays * 86_400_000).toISOString();
  const query = new URLSearchParams({
    select: "created_at,platform,external_id,offer_id,city,country,destination_key,hotel,price,link_placement,tracking_url",
    created_at: `gte.${since}`,
    order: "created_at.desc",
    limit: "300",
  });

  const key = supabaseKey();
  const response = await fetch(`${supabaseUrl()}/rest/v1/social_publication_events?${query.toString()}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = (await response.text().catch(() => "")).slice(0, 240);
    console.warn("[social_publication_history_read]", response.status, detail);
    return { ok: false as const, rows: [] as SocialPublicationEvent[] };
  }

  const rows = await response.json() as SocialPublicationEvent[];
  return { ok: true as const, rows };
}
