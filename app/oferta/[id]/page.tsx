import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MapPin, Moon, Plane, Sun, Utensils } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TravelImage from "@/components/TravelImage";
import { formatPriceCheckedAt, getLinkMatch, offers } from "@/lib/offers";
import { partners } from "@/lib/partners";
import BeforeYouGo from "@/components/BeforeYouGo";
import FavoriteButton from "@/components/FavoriteButton";
import OfferCard from "@/components/OfferCard";
import SocialShare from "@/components/SocialShare";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import EskyLivePackagePrice from "@/components/EskyLivePackagePrice";

export async function generateStaticParams(){ return offers.map(o=>({id:String(o.id)})); }
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
  const {id}=await params;
  const o=offers.find(x=>x.id===Number(id));
  if (!o) return {};
  const title = `${o.city} z ${o.departure} — ostatnio znaleźliśmy od ${o.price} zł | Tripownia`;
  const description = `${o.city}, ${o.nights} nocy, ${o.board}. ${o.reason}`;
  return {
    title,
    description,
    alternates: { canonical: `/oferta/${o.id}` },
    openGraph: {
      title, description, type: "website", url: `/oferta/${o.id}`,
      images: o.image ? [{ url: o.image, alt: `${o.city}, ${o.country}` }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: o.image ? [o.image] : undefined },
    robots: o.availabilityStatus === "expired"
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

export default async function OfferPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const o=offers.find(x=>x.id===Number(id));
  if(!o) return notFound();
  const p=partners[o.partner];
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
    }).toString()}`;
  }
  const linkMatch = getLinkMatch(o);
  const isExact = linkMatch === "exact";
  const isParameterized = linkMatch === "parameters";
  const checkedAt = formatPriceCheckedAt(o.priceCheckedAt);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${o.city} — ${o.nights} nocy`,
    description: o.reason,
    image: o.image,
    brand: { "@type": "Brand", name: "Tripownia" },
    offers: {
      "@type": "Offer",
      priceCurrency: "PLN",
      price: o.price,
      availability: o.availabilityStatus === "expired" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: `https://tripownia.pl/oferta/${o.id}`,
    },
  };
  const similar = offers
    .filter(x => x.id !== o.id && x.availabilityStatus !== "expired" && (x.country === o.country || x.category.some(c => o.category.includes(c))))
    .sort((a,b) => Math.abs(a.price - o.price) - Math.abs(b.price - o.price))
    .slice(0,3);
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
          <span className={`badge ${o.tag==='BIERZEMY'?'hot':''}`}>{o.tag}</span>
        </div>
        <div className="detail-copy">
          <div className="eyebrow">{o.flag} {o.country}</div>
          <h1>{o.city}</h1>
          <div className="detail-topline">
            <div className="detail-score"><strong>{o.score}</strong><span>/10 Tripownia poleca</span></div>
            <FavoriteButton offerId={o.id}/>
          </div>
          <div className="detail-price-card">
            {o.partner === "esky" ? (
              <EskyLivePackagePrice offerId={o.id} fallbackPrice={o.price} board={o.board} />
            ) : (
              <>
                <div className="detail-price"><small>ostatnio znaleźliśmy od</small> <strong>{o.price} zł</strong> / os.</div>
                <div className="price-status detail-price-status">
                  {`Sprawdź aktualną cenę u partnera${checkedAt ? ` — ostatni odczyt ${checkedAt}` : ""}. Może być dziś jeszcze taniej.`}
                </div>
              </>
            )}
          </div>
          <p className="detail-lead">{o.reason}</p>
          <div className="detail-meta">
            <span><Plane/> <b>{o.departure}</b></span><span><Moon/> <b>{o.nights} nocy</b></span>
            <span><Sun/> <b>{o.weather}</b></span><span><Utensils/> <b>{o.board}</b></span>
            <span><MapPin/> <b>{o.hotel}</b></span><span>📅 <b>{o.dates}</b></span>
          </div>
          <div className="detail-source">Oferta sprawdzana u: <strong>{p.name}</strong></div>
          {o.availabilityStatus === "expired" ? (
            <div className="expired-offer">Ta oferta nie jest już dostępna. Poniżej znajdziesz podobne aktualne okazje.</div>
          ) : (
            <div className="detail-action-box">
              <a className="primary-cta" href={detailAffiliateUrl} target="_blank" rel="sponsored noopener noreferrer">
                {o.partner === "exim" || o.partner === "tui" ? `Zobacz konkretną ofertę w ${p.name}` : o.board.toLocaleLowerCase("pl-PL").includes("śniad") ? `Zobacz aktualne opcje ze śniadaniem w ${p.name}` : `Sprawdź aktualną cenę w ${p.name}`} <ExternalLink size={18}/>
              </a>
              <small className="affiliate-note">{o.partner === "exim" || o.partner === "tui" ? "Tripownia wybiera konkretny produkt z aktualnego feedu partnera i przekazuje jego productUrl bez przebudowywania deeplinku." : o.partner === "esky" && o.board.toLocaleLowerCase("pl-PL").includes("śniad") ? "W eSky pokazujemy wyniki od najniższej ceny. Przy tej propozycji wymaganiem Tripowni jest wariant oznaczony „Śniadanie” — sprawdź to oznaczenie przy wybranym hotelu." : "Link prowadzi przez Tripownię do partnera z zachowaniem afiliacji. Cena i dostępność są potwierdzane po kliknięciu."}</small>
            </div>
          )}
          <SocialShare
            url={`https://tripownia.pl/oferta/${o.id}`}
            title={`${o.city} — okazja Tripownia.pl`}
            text={`${o.city} z ${o.departure} — ${o.nights} nocy. Tripownia ostatnio znalazła od ${o.price} zł/os. — sprawdź, czy teraz jest jeszcze taniej.`}
          />
        </div>
      </section>
      {o.availabilityStatus === "expired" && similar.length > 0 && <section className="similar-offers"><div className="section-heading"><div><div className="kicker">PODOBNE PROPOZYCJE</div><h2>Zobacz aktualne okazje</h2></div></div><div className="cards-grid">{similar.map(item => <OfferCard key={item.id} offer={item}/>)}</div></section>}
      {o.availabilityStatus !== "expired" && <div className="mobile-booking-bar">
        <div><small>Tripownia ostatnio znalazła</small><strong>od {o.price} zł / os.</strong></div>
        <a href={detailAffiliateUrl} target="_blank" rel="sponsored noopener noreferrer">
          Sprawdź, czy jest taniej <ExternalLink size={16}/>
        </a>
      </div>}
      <BeforeYouGo city={o.city} country={o.country} transferIncluded={o.transferIncluded}/>
    </div>
    <SiteFooter/>
  </main>;
}
