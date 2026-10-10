import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferJourney from "@/components/OfferJourney";
import OfferHeroImage from "@/components/OfferHeroImage";
import TrackedPartnerLink from "@/components/TrackedPartnerLink";
import { partnerFromUrl } from "@/lib/affiliateJourney";
import { affiliateLinkContext, openAffiliateLink, sealAffiliateLink } from "@/lib/affiliateLinkToken";

export const runtime = "nodejs";
export const metadata: Metadata = { title: "Sprawdź wybraną ofertę", robots: { index: false, follow: false } };
const labels: Record<string, string> = {
  aviasales: "Aviasales", esky: "eSky", exim: "EXIM Tours", tui: "TUI",
  kiwi: "Kiwi.com", booking: "Booking.com", wakacje: "Wakacje.pl",
  getyourguide: "GetYourGuide", seeplaces: "SeePlaces", holidaypark: "Holiday Park",
  fonia: "Fonia", parklot: "Parklot", rentacar: "GetRentacar",
  kiwitaxi: "Kiwitaxi", gettransfer: "GetTransfer", airhelp: "AirHelp", zwrotzalot: "ZwrotZaLot",
};

export default async function PartnerReview({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const read = (name: string, max = 220) =>
    (Array.isArray(query[name]) ? query[name][0] : query[name] || "").trim().slice(0, max);

  // One-time legacy cleanup: never serve a review with a plaintext affiliate target
  // in the browser address bar, including bookmarked or externally shared links.
  const legacyTarget = read("target", 8192);
  if (legacyTarget) {
    const partner = partnerFromUrl(legacyTarget);
    if (!partner) redirect("/okazje");
    const sourceContext: Record<string, string> = {};
    for (const [name, value] of Object.entries(query)) {
      if (name === "target" || name === "partner" || name === "ref") continue;
      if (typeof value === "string") sourceContext[name] = value;
    }
    const ref = sealAffiliateLink({
      mode: "review",
      partner,
      target: legacyTarget,
      context: affiliateLinkContext(sourceContext),
    });
    redirect(`/sprawdz-oferte?ref=${ref}`);
  }

  const payload = openAffiliateLink(read("ref", 12000));
  if (!payload || payload.mode !== "review") redirect("/okazje");
  const { partner, target, context } = payload;
  const destination = context.destination || "";
  const city = destination.split(",")[0].trim();
  const country = destination.split(",").slice(1).join(",").trim();
  const priceValue = Number(context.price);
  const price = Number.isFinite(priceValue) && priceValue > 0 && priceValue < 100000 ? priceValue : 0;
  const offer = context.offer || "";
  const source = context.source || "site_offer";
  const exitRef = sealAffiliateLink({
    mode: "exit",
    partner,
    target,
    context: {
      ...context,
      source: `${source}:detail`,
      destination,
      offer,
      price: price ? String(price) : "",
      page: "/sprawdz-oferte",
    },
  });

  return <main className="offer-journey-page">
    <SiteHeader />
    <div className="shell">
      <div className="offer-detail-top"><Link href="/okazje">← Zobacz okazje</Link></div>
      <OfferJourney offerId={offer} destination={destination} partner={partner} price={price || undefined} source={source} />
      <section className="detail-hero partner-review">
        {city
          ? <OfferHeroImage city={city} country={country} />
          : <div className="partner-review-visual" aria-hidden="true"><span>TRIPOWNIA</span><strong>Twój kolejny<br />wyjazd</strong><p>Wybierz. Sprawdź. Ruszaj.</p></div>}
        <div className="detail-copy">
          <div className="eyebrow">WYBRANE W TRIPOWNI</div>
          <h1>{destination || "Sprawdź dostępne opcje"}</h1>
          <p className="detail-lead">Przejdziesz do {labels[partner]}, aby sprawdzić aktualną cenę i dostępność.</p>
          <div className="detail-price-card">
            <div className="detail-price"><small>{price ? "Cena zapisana przy propozycji" : "Cena i dostępność"}</small><strong>{price ? `${price.toLocaleString("pl-PL")} zł` : "Do sprawdzenia"}</strong></div>
            <p>Ostateczną cenę, termin i zakres oferty zobaczysz u partnera przed rezerwacją.</p>
          </div>
          <div className="detail-action-box">
            <TrackedPartnerLink href={`/go/${exitRef}`} partner={partner} offerId={offer} destination={destination} price={price} placement={`${source}:detail`} className="primary-cta">
              Sprawdź aktualną cenę →
            </TrackedPartnerLink>
            <small>Po sprawdzeniu oferty możesz wrócić przyciskiem „Wstecz” do Tripowni.</small>
          </div>
          <p className="affiliate-note">Rezerwację i płatność obsługuje partner. Tripownia może otrzymać prowizję za rezerwację.</p>
        </div>
      </section>
    </div>
    <SiteFooter />
  </main>;
}
