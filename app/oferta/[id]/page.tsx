import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MapPin, Moon, Plane, Sun, Utensils } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TravelImage from "@/components/TravelImage";
import { getLinkMatch, offers } from "@/lib/offers";
import { partners } from "@/lib/partners";
import BeforeYouGo from "@/components/BeforeYouGo";

export async function generateStaticParams(){ return offers.map(o=>({id:String(o.id)})); }
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
  const {id}=await params;
  const o=offers.find(x=>x.id===Number(id));
  return o?{title:`${o.city} z ${o.departure} | Tripownia`,description:o.reason}:{};
}

export default async function OfferPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const o=offers.find(x=>x.id===Number(id));
  if(!o) notFound();
  const p=partners[o.partner];
  const linkMatch = getLinkMatch(o);
  const isExact = linkMatch === "exact";
  const isParameterized = linkMatch === "parameters";
  return <main>
    <SiteHeader/>
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
          <div className="detail-price">{isExact ? "od" : "ostatnio od"} <strong>{o.price} zł</strong> / os.</div>
          <div className="price-status detail-price-status">
            {isExact
              ? "Cena dotyczy konkretnej zapisanej oferty. Aktualną cenę i dostępność potwierdza partner."
              : isParameterized
                ? "To cena z ostatniej selekcji Tripowni. Link otwiera wyszukiwanie z możliwie zbliżonymi parametrami, a aktualne wyniki mogą się różnić."
                : "To cena orientacyjna z ostatniej selekcji Tripowni. Link otwiera stronę kierunku, a nie dokładnie tę samą ofertę."}
          </div>
          <p className="detail-lead">{o.reason}</p>
          <div className="detail-meta">
            <span><Plane/> {o.departure}</span><span><Moon/> {o.nights} nocy</span>
            <span><Sun/> {o.weather}</span>
            {isExact && <><span><Utensils/> {o.board}</span><span><MapPin/> {o.hotel}</span></>}
            {!isExact && <span><MapPin/> {o.city}</span>}
          </div>
          <div className="detail-source">Źródło ceny: <strong>{p.name}</strong></div>
          {o.availabilityStatus === "expired" ? (
            <div className="expired-offer">Ta oferta wygasła. Wróć do okazji i wybierz aktualną alternatywę.</div>
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
      <BeforeYouGo city={o.city} country={o.country} transferIncluded={o.transferIncluded}/>
    </div>
    <SiteFooter/>
  </main>;
}
