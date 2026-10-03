import { NextRequest, NextResponse } from "next/server";
import { publishFacebook, publishInstagram } from "@/lib/social-automation";
import { getSocialOfferById } from "@/lib/social-offer-pool";
import { getLinkMatch, isOfferExpired, type Offer } from "@/lib/offers";
import { adminAuthError, verifyAdminRequest } from "@/lib/adminAuthServer";
import { getRecentSocialPublicationEvents, recordSocialPublicationEvents } from "@/lib/socialPublicationStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return adminAuthError(auth);

  const days = Math.max(1, Math.min(30, Number(request.nextUrl.searchParams.get("days") || 7)));
  const history = await getRecentSocialPublicationEvents(auth.token, days);

  return NextResponse.json(
    { ok: history.ok, rows: history.rows },
    {
      status: history.ok ? 200 : 502,
      headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
    }
  );
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return adminAuthError(auth);

  try {
    const body = (await request.json()) as {
      offerId?: number;
      text?: string;
      approved?: boolean;
      channels?: Array<"facebook" | "instagram">;
      linkPlacement?: "post" | "comment";
      offer?: Offer;
    };

    if (body.approved !== true) {
      return NextResponse.json({ ok: false, error: "Post nie został zatwierdzony." }, { status: 400 });
    }

    const text = String(body.text || "").trim();
    if (!text || text.length < 20) {
      return NextResponse.json({ ok: false, error: "Treść posta jest pusta lub zbyt krótka." }, { status: 400 });
    }

    const offerId = Number(body.offerId);
    const suppliedOffer = body.offer && Number(body.offer.id) === offerId ? body.offer : null;
    const offer = getSocialOfferById(offerId) || suppliedOffer;
    if (!offer || isOfferExpired(offer) || getLinkMatch(offer) === "unsafe") {
      return NextResponse.json({ ok: false, error: "Oferta nie istnieje, wygasła lub ma niespójny link." }, { status: 404 });
    }

    const channels = Array.isArray(body.channels) && body.channels.length
      ? Array.from(new Set(body.channels))
      : ["facebook", "instagram"] as const;

    const linkPlacement = body.linkPlacement === "comment" ? "comment" : "post";
    const jobs = channels.map((channel) =>
      channel === "facebook"
        ? publishFacebook(offer, text, linkPlacement)
        : publishInstagram(offer, text)
    );
    const results = await Promise.all(jobs);
    const ok = results.some((result) => result.ok);
    const historySaved = ok
      ? await recordSocialPublicationEvents(auth.token, auth.user.id, offer, linkPlacement, results)
      : false;

    return NextResponse.json({
      ok,
      offer: { id: offer.id, city: offer.city, price: offer.price },
      linkPlacement,
      historySaved,
      results,
    }, { status: ok ? 200 : 502 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
