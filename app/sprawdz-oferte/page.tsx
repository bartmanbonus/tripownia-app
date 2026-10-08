import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferJourney from "@/components/OfferJourney";
import OfferHeroImage from "@/components/OfferHeroImage";
import TrackedPartnerLink from "@/components/TrackedPartnerLink";
import { partnerFromUrl } from "@/lib/affiliateJourney";

export const metadata: Metadata = { title: "Sprawdź wybraną ofertę", robots: { index: false, follow: true } };
const labels: Record<string, string> = { aviasales: "Aviasales", esky: "eSky", exim: "EXIM Tours", tui: "TUI", kiwi: "Kiwi.com", booking: "Booking.com", wakacje: "Wakacje.pl", getyourguide: "GetYourGuide", seeplaces: "SeePlaces", holidaypark: "Holiday Park", fonia: "Fonia", parklot: "Parklot", rentacar: "GetRentacar", kiwitaxi: "Kiwitaxi", gettransfer: "GetTransfer" };
export default async function PartnerReview({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const read = (key: string, max = 220) => (Array.isArray(query[key]) ? query[key][0] : query[key] || "").trim().slice(0, max);
  const target = read("target", 8192);
  const partner = partnerFromUrl(target);
  if (!partner) redirect("/okazje");
  const destination = read("destination");
  const city = destination.split(",")[0].trim();
  const country = destination.split(",").slice(1).join(",").trim();
  const priceValue = Number(read("price"));
  const price = Number.isFinite(priceValue) && priceValue > 0 && priceValue < 100000 ? priceValue : 0;
  const offer = read("offer");
  const source = read("source") || "site_offer";
  const params = new URLSearchParams({ target, partner, source: `${source}:detail`, offer, destination, page: "/sprawdz-oferte" });
  if (price) params.set("price", String(price));
  for (const key of ["utmSource", "utmMedium", "utmCampaign", "utmContent", "landing"]) {
    const value = read(key); if (value) params.set(key, value);
  }
  const href = `/go/live?${params.toString()}`;
  return <main className="offer-journey-page">
    <SiteHeader />
    <div className="shell">
      <div className="offer-detail-top"><Link href="/okazje">← Zobacz okazje</Link></div>
      <OfferJourney offerId={offer} destination={destination} partner={partner} price={price || undefined} source={source} />
      <section className="detail-hero partner-review">
        {city ? <OfferHeroImage city={city} country={country} /> : <div className="partner-review-visual" aria-hidden="true"><span>TRIPOWNIA</span><strong>Twój kolejny<br />wyjazd</strong><p>Wybierz. Sprawdź. Ruszaj.</p></div>}
        <div className="detail-copy">
          <div className="eyebrow">WYBRANE W TRIPOWNI</div>
          <h1>{destination || "Sprawdź dostępne opcje"}</h1>
          <p className="detail-lead">Przejdziesz do {labels[partner]}, zachowując wybrany link i jego parametry.</p>
          <div className="detail-price-card"><div className="detail-price"><small>{price ? "Cena zapisana przy propozycji" : "Cena i dostępność"}</small><strong>{price ? `${price.toLocaleString("pl-PL")} zł` : "Do sprawdzenia"}</strong></div><p>Ostateczną cenę, termin i zakres oferty zobaczysz u partnera przed rezerwacją.</p></div>
          <div className="detail-action-box"><TrackedPartnerLink href={href} partner={partner} offerId={offer} destination={destination} price={price} placement={`${source}:detail`} className="primary-cta">Przejdź do {labels[partner]} →</TrackedPartnerLink><small>Po sprawdzeniu oferty możesz wrócić przyciskiem „Wstecz” do Tripowni.</small></div>
          <p className="affiliate-note">Rezerwację i płatność obsługuje {labels[partner]}. Tripownia może otrzymać prowizję za rezerwację.</p>
        </div>
      </section>
    </div>
    <SiteFooter />
  </main>;
}
