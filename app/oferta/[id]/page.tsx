import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MapPin, Moon, Plane, Sun, Utensils } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TravelImage from "@/components/TravelImage";
import { formatPriceCheckedAt, getLinkMatch, homepageFallbackOffers as offers } from "@/lib/offers";
import BeforeYouGo from "@/components/BeforeYouGo";
import FavoriteButton from "@/components/FavoriteButton";
import OfferCard from "@/components/OfferCard";
import SocialShare from "@/components/SocialShare";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import EximLivePrice from "@/components/EximLivePrice";
import CompleteTripSales from "@/components/CompleteTripSales";
import TrackedPartnerLink from "@/components/TrackedPartnerLink";
import { customerOfferReason } from "@/lib/customerOfferCopy";
import OfferAlternativeFinder from "@/components/OfferAlternativeFinder";
import OfferAlternativeJump from "@/components/OfferAlternativeJump";

export async function generateStaticParams(){ return offers.map(o=>({id:String(o.id)})); }
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
  const {id}=await params;
  const o=offers.find(x=>x.id===Number(id));
  if (!o) return {};
  const title = `${o.city} z ${o.departure} — od ${o.price.toLocaleString("pl-PL")} zł/os. | Tripownia`;
  const description = `${o.city}, ${o.nights} nocy, ${o.board}, wylot z ${o.departure}. Ostatnio znaleźliśmy od ${o.price.toLocaleString("pl-PL")} zł/os. Sprawdź aktualną cenę i dostępność.`;
  return {
    title,
    description,
    alternates: { canonical: `/oferta/${o.id}` },
    openGraph: {
      title, description, type: "website", url: `/oferta/${o.id}`,
      images: o.image ? [{ url: o.image, alt: `${o.city}, ${o.country}` }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: o.image ? [o.image] : undefined },
    // Offer IDs are transient product views, not evergreen SEO landing pages.
    // Keep links crawlable so bots can reach stable hubs, but never index a price snapshot.
    robots: { index: false, follow: true },
  };
}

export default async function OfferPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const o=offers.find(x=>x.id===Number(id));
  if(!o) return notFound();
  // EXIM: oferty kierunkowe nie powinny kończyć na ogólnej liście.
  // Przechodzimy przez serwer Tripowni, który wybiera najtańszą konkretną ofertę/hotel
  // z preferencją miasta wylotu zapisanej w ofercie.
  let detailAffiliateUrl = o.affiliateUrl;
  if (o.partner === "exim") {
    const qs = new URLSearchParams({
      destination: o.city,
      country: o.country,
      from: o.airportCode || "WAW",
      nights: String(o.nights || ""),
      board: o.board || "",
      return: `/oferta/${o.id}`,
    });
    if (o.destinationUrl) {
      try { qs.set("path", new URL(o.destinationUrl).pathname); } catch {}
    }
    detailAffiliateUrl = `/go/exim-best?${qs.toString()}`;
  } else if (o.partner === "tui") {
    detailAffiliateUrl = `/api/tui-go?${new URLSearchParams({
      destination: o.city,
      country: o.country,
      departure: o.airportCode || "WAW",
      duration: String(o.nights || ""),
      board: o.board || "",
      return: `/oferta/${o.id}`,
    }).toString()}`;
  }
  const linkMatch = getLinkMatch(o);
  const isExact = linkMatch === "exact";
  const isParameterized = linkMatch === "parameters";
  void isExact;
  void isParameterized;
  const checkedAt = formatPriceCheckedAt(o.priceCheckedAt);
  const customerReason = customerOfferReason(o.reason);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${o.city} — ${o.nights} nocy`,
    description: customerReason,
    image: o.image,
    brand: { "@type": "Brand", name: "Tripownia" },
    offers: {
      "@type": "Offer",
      priceCurrency: "PLN",
      ...(o.partner === "exim" ? {} : { price: o.price }),
      availability: o.availabilityStatus === "expired" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: `https://tripownia.pl/oferta/${o.id}`,
    },
  };
  const similar = offers
    .filter(x => x.id !== o.id && x.availabilityStatus !== "expired" && (x.country === o.country || x.category.some(c => o.category.includes(c))))
    .sort((a,b) => Math.abs(a.price - o.price) - Math.abs(b.price - o.price))
    .slice(0,3);
  const comparisonOffers = similar.slice(0, 2);
  return <main>
    <SiteHeader/>
    <BreadcrumbSchema items={[
      { name: "Tripownia", url: "https://tripownia.pl/" },
      { name: "Okazje", url: "https://tripownia.pl/okazje" },
      { name: `${o.city} — ${o.nights} nocy`, url: `https://tripownia.pl/oferta/${o.id}` },
    ]}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    <div className="shell">
      <div className="offer-detail-top"><Link href="/okazje"><ArrowLeft size={17}/> Wróć do okazji</Link></div>
      <section className="detail-hero">
        <div className="detail-image">
          <TravelImage city={o.city} country={o.country} alt={`${o.city}, ${o.country}`} className="detail-photo-img" overrideSrc={o.image}/>
          <span className={`badge ${o.partner !== "exim" && o.tag==='BIERZEMY'?'hot':''}`}>{o.partner === "exim" ? "WYBRANE PRZEZ TRIPOWNIĘ" : o.tag === "BIERZEMY" ? "OKAZJA TRIPOWNI" : o.tag}</span>
        </div>
        <div className="detail-copy">
          <div className="eyebrow">{o.flag} {o.country}</div>
          <h1>{o.city}</h1>
          <div className="detail-topline">
            <div className="detail-score"><strong>{o.score}</strong><span>/10 Tripownia poleca</span></div>
            <FavoriteButton offerId={o.id}/>
          </div>
          <div className="detail-price-card">
            {o.partner === "exim" ? (
              <EximLivePrice destination={o.city} country={o.country} from={o.airportCode} nights={o.nights} board={o.board} fallbackPrice={o.price} />
            ) : (
              <>
                <div className="detail-price"><small>ostatnio znaleźliśmy od</small> <strong>{o.price} zł</strong> / os.</div>
                <div className="price-status detail-price-status">
                  {`Sprawdź aktualną cenę przed rezerwacją${checkedAt ? ` — ostatni odczyt ${checkedAt}` : ""}. Może być dziś jeszcze taniej.`}
                </div>
              </>
            )}
          </div>
          <p className="detail-lead">{customerReason}</p>
          <div className="detail-meta">
            <span><Plane/> <b>{o.departure}</b></span><span><Moon/> <b>{o.nights} nocy</b></span>
            <span><Sun/> <b>{o.weather}</b></span><span><Utensils/> <b>{o.board}</b></span>
            <span><MapPin/> <b>{o.hotel}</b></span><span>📅 <b>{o.dates}</b></span>
          </div>

          <div className="booking-summary" aria-label="Najważniejsze elementy oferty">
            <div><small>Wylot</small><strong>{o.departure}</strong></div>
            <div><small>Termin</small><strong>{o.dates}</strong></div>
            <div><small>Pobyt</small><strong>{o.nights} nocy</strong></div>
            <div><small>Wyżywienie</small><strong>{o.board}</strong></div>
            <div><small>Hotel</small><strong>{o.hotel}</strong></div>
            <div><small>Transfer</small><strong>{o.transferIncluded ? "W cenie oferty" : "Do sprawdzenia"}</strong></div>
          </div>

          <div className="offer-decision-box">
            <small>DLACZEGO WARTO TO SPRAWDZIĆ</small>
            <strong>{customerReason}</strong>
            <span>Przed płatnością sprawdź finalną cenę, bagaż, warunki zmiany lub anulacji i dokładny zakres świadczeń.</span>
          </div>

          <div className="detail-source">Po kliknięciu sprawdzisz finalną cenę, dostępność i warunki rezerwacji.</div>
          {o.availabilityStatus === "expired" ? (
            <div className="expired-offer">Ta oferta nie jest już dostępna. Poniżej znajdziesz podobne aktualne okazje.</div>
          ) : (
            <div className="detail-action-box">
              <TrackedPartnerLink
                className="primary-cta"
                href={detailAffiliateUrl}
                partner={o.partner}
                offerId={o.id}
                destination={o.city}
                price={o.price}
                placement="offer_detail_primary"
                returnContext={{ departure: o.departure, hotel: o.hotel, board: o.board, nights: o.nights }}
              >
                {o.partner === "exim" || o.partner === "tui" ? "Zobacz konkretną ofertę" : "Sprawdź aktualną cenę"} <ExternalLink size={18}/>
              </TrackedPartnerLink>
              <OfferAlternativeJump />
              <small className="booking-note">Cena i dostępność mogą zmienić się do momentu rezerwacji. Sprawdź finalne warunki przed płatnością.</small>
            </div>
          )}
          <SocialShare
            url={`https://tripownia.pl/oferta/${o.id}`}
            title={`${o.city} — okazja Tripownia.pl`}
            text={o.partner === "exim" ? `${o.city} z ${o.departure} — ${o.nights} nocy. Sprawdź aktualną cenę i dostępność wyjazdu.` : `${o.city} z ${o.departure} — ${o.nights} nocy. Tripownia ostatnio znalazła od ${o.price} zł/os. — sprawdź, czy teraz jest jeszcze taniej.`}
          />
        </div>
      </section>
      {o.availabilityStatus !== "expired" && (
        <OfferAlternativeFinder
          city={o.city}
          country={o.country}
          nights={o.nights}
          board={o.board}
          departure={o.departure}
          airportCode={o.airportCode}
          dates={o.dates}
          hotel={o.hotel}
          currentOfferId={o.id}
        />
      )}
      {o.availabilityStatus === "expired" && similar.length > 0 && <section className="similar-offers"><div className="section-heading"><div><div className="kicker">PODOBNE PROPOZYCJE</div><h2>Zobacz aktualne okazje</h2></div></div><div className="cards-grid">{similar.map(item => <OfferCard key={item.id} offer={item}/>)}</div></section>}

      {o.availabilityStatus !== "expired" && comparisonOffers.length > 0 && (
        <section className="similar-offers offer-comparison-section">
          <div className="section-heading">
            <div>
              <div className="kicker">PORÓWNAJ PRZED REZERWACJĄ</div>
              <h2>2 podobne opcje, zanim klikniesz „kupuję”</h2>
              <p>Jeśli różnica w cenie jest niewielka, porównaj też termin, wyżywienie, lotnisko i hotel — nie tylko kwotę.</p>
            </div>
          </div>
          <div className="cards-grid">
            {comparisonOffers.map(item => {
              const delta = Number(o.price) - Number(item.price);
              return <OfferCard
                key={item.id}
                offer={item}
                priceHighlight={delta > 0
                  ? { label: "TAŃSZA ALTERNATYWA", detail: `${delta.toLocaleString("pl-PL")} zł mniej / os.` }
                  : { label: "PODOBNA OPCJA", detail: "Porównaj zakres i termin" }}
              />;
            })}
          </div>
          <div className="offer-comparison-back">
            <Link href="/okazje">Zobacz wszystkie aktualne okazje →</Link>
          </div>
        </section>
      )}

      {o.availabilityStatus !== "expired" && <div className="mobile-booking-bar">
        <div>{o.partner === "exim" ? <><small>Cena od</small><strong>{o.price} zł / os.</strong></> : <><small>Tripownia ostatnio znalazła</small><strong>od {o.price} zł / os.</strong></>}</div>
        <TrackedPartnerLink
          href={detailAffiliateUrl}
          partner={o.partner}
          offerId={o.id}
          destination={o.city}
          price={o.price}
          placement="offer_detail_mobile_bar"
          returnContext={{ departure: o.departure, hotel: o.hotel, board: o.board, nights: o.nights }}
        >
          Sprawdź aktualną cenę <ExternalLink size={16}/>
        </TrackedPartnerLink>
      </div>}
      <CompleteTripSales city={o.city} country={o.country} source="offer_detail" />
      <BeforeYouGo city={o.city} country={o.country} transferIncluded={o.transferIncluded}/>
    </div>
    <SiteFooter/>
  </main>;
}
