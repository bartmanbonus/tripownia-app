import { NextRequest, NextResponse } from "next/server";
import type { Offer } from "@/lib/offers";
import { pickOfferForToday, publishFacebook, publishInstagram } from "@/lib/social-automation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return request.headers.get("authorization") === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const key = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Warsaw",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const offersUrl = new URL("/api/today-offers", request.nextUrl.origin);
    offersUrl.searchParams.set("mode", "daily");
    offersUrl.searchParams.set("key", key);

    const response = await fetch(offersUrl, {
      cache: "no-store",
      headers: { "user-agent": "Tripownia-Social-Automation/1.0" },
    });

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: `today-offers HTTP ${response.status}` },
        { status: 502 }
      );
    }

    const payload = (await response.json()) as { offers?: Offer[]; ok?: boolean };
    const offers = Array.isArray(payload.offers) ? payload.offers : [];
    const offer = pickOfferForToday(offers);

    if (!offer) {
      return NextResponse.json({ ok: false, error: "Brak ofert do publikacji" }, { status: 404 });
    }

    const [facebook, instagram] = await Promise.all([
      publishFacebook(offer),
      publishInstagram(offer),
    ]);

    const ok = facebook.ok || instagram.ok;
    return NextResponse.json({
      ok,
      key,
      offer: {
        id: offer.id,
        city: offer.city,
        country: offer.country,
        price: offer.price,
        dates: offer.dates,
      },
      results: [facebook, instagram],
    }, { status: ok ? 200 : 502 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
