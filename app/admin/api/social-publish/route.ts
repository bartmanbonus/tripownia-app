import { NextRequest, NextResponse } from "next/server";
import { offers } from "@/lib/offers";
import { publishFacebook, publishInstagram } from "@/lib/social-automation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      offerId?: number;
      text?: string;
      approved?: boolean;
      channels?: Array<"facebook" | "instagram">;
    };

    if (body.approved !== true) {
      return NextResponse.json({ ok: false, error: "Post nie został zatwierdzony." }, { status: 400 });
    }

    const text = String(body.text || "").trim();
    if (!text || text.length < 20) {
      return NextResponse.json({ ok: false, error: "Treść posta jest pusta lub zbyt krótka." }, { status: 400 });
    }

    const offer = offers.find((item) => item.id === Number(body.offerId));
    if (!offer || offer.availabilityStatus === "expired") {
      return NextResponse.json({ ok: false, error: "Oferta nie istnieje lub wygasła." }, { status: 404 });
    }

    const channels = Array.isArray(body.channels) && body.channels.length
      ? Array.from(new Set(body.channels))
      : ["facebook", "instagram"] as const;

    const jobs = channels.map((channel) =>
      channel === "facebook"
        ? publishFacebook(offer, text)
        : publishInstagram(offer, text)
    );
    const results = await Promise.all(jobs);
    const ok = results.some((result) => result.ok);

    return NextResponse.json({
      ok,
      offer: { id: offer.id, city: offer.city, price: offer.price },
      results,
    }, { status: ok ? 200 : 502 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
