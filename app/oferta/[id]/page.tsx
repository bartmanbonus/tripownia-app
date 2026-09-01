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

export async function generateStaticParams(){ return offers.map(o=>({id:String(o.id)})); }
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
  const {id}=await params;
  const o=offers.find(x=>x.id===Number(id));
  if (!o) return {};
  const title = `${o.city} z ${o.departure} od ${o.price} zł | Tripownia`;
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
  };
}

export default async function OfferPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const o=offers.find(x=>x.id===Number(id));
  if(!o) return notFound();
  const p=partners[o.partner];
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
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    <div className="shell">
      <div className="offer-detail-top"><Link href="/okazje"><ArrowLeft size={17}/> Wróć do okazji</Link></div>
      <section className="detail-hero">
        <div className="detail-image">
          <TravelImage city={o.city} country={o.country} alt={`${o.city}, ${o.country}`} className="detail-photo-img"/>
          <span className={`badge ${o.tag==='BIERZEMY'?'hot':''}`}>{o.tag}</span>
        </div>
        <div className="detail-copy">
          <div className="eyebrow">{o.flag} {o.country}</div>
          <h1>{o.city}</h1>
          <div className="detail-score"><strong>{o.score}</strong><span>/10 Tripownia poleca</span></div>
          <FavoriteButton offerId={o.id}/>
          <div className="detail-price">{isExact ? "od" : "ostatnio od"} <strong>{o.price} zł</strong> / os.</div>
          <div className="price-status detail-price-status">
            {isExact
              ? `Cena dotyczy konkretnej zapisanej oferty.${checkedAt ? ` Ostatnia aktualizacja: ${checkedAt}.` : ""} Aktualną cenę i dostępność potwierdza partner.`
              : isParameterized
                ? `To cena z ostatniej selekcji Tripowni.${checkedAt ? ` Ostatnia aktualizacja: ${checkedAt}.` : ""} Link otwiera wyszukiwanie z możliwie zbliżonymi parametrami, a aktualne wyniki mogą się różnić.`
                : `To cena orientacyjna z ostatniej selekcji Tripowni.${checkedAt ? ` Ostatnia aktualizacja: ${checkedAt}.` : ""} Link otwiera stronę kierunku, a nie dokładnie tę samą ofertę.`}
          </div>
          <p className="detail-lead">{o.reason}</p>
          <div className="detail-meta">
            <span><Plane/> {o.departure}</span><span><Moon/> {o.nights} nocy</span>
            <span><Sun/> {o.weather}</span>
            <span><Utensils/> {o.board}</span><span><MapPin/> {o.hotel}</span>
            <span>📅 {o.dates}</span>
          </div>
          <div className="detail-source">Źródło ceny: <strong>{p.name}</strong></div>
          {o.availabilityStatus === "expired" ? (
            <div className="expired-offer">Ta oferta nie jest już dostępna. Poniżej znajdziesz podobne aktualne okazje.</div>
          ) : (
            <>
              <a className="primary-cta" href={o.affiliateUrl} target="_blank" rel="sponsored noopener noreferrer">
                {isExact
                  ? `Sprawdź tę ofertę u ${p.name}`
                  : isParameterized
                    ? `Sprawdź aktualne wyniki u ${p.name}`
                    : `Zobacz aktualne oferty: ${o.city} u ${p.name}`} <ExternalLink size={18}/>
              </a>
              <small className="affiliate-note">
                {isExact
                  ? "Link prowadzi do konkretnej oferty partnera. Cena i dostępność mogą się zmienić."
                  : isParameterized
                    ? "Przekazujemy partnerowi kierunek i dostępne parametry wyszukiwania. Partner pokazuje aktualne hotele i ceny."
                    : "Link prowadzi do aktualnej strony kierunku partnera. Nie obiecujemy, że pierwsza widoczna oferta będzie odpowiadała zapisanej wcześniej cenie lub hotelowi."}
              </small>
            </>
          )}
        </div>
      </section>
      {o.availabilityStatus === "expired" && similar.length > 0 && <section className="similar-offers"><div className="section-heading"><div><div className="kicker">PODOBNE PROPOZYCJE</div><h2>Zobacz aktualne okazje</h2></div></div><div className="cards-grid">{similar.map(item => <OfferCard key={item.id} offer={item}/>)}</div></section>}
      <BeforeYouGo city={o.city} country={o.country} transferIncluded={o.transferIncluded}/>
    </div>
    <SiteFooter/>
  </main>;
}
