import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MapPin, Moon, Plane, Sun, Utensils } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TravelImage from "@/components/TravelImage";
import { offers } from "@/lib/offers";
import { partners } from "@/lib/partners";

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
  return <main>
    <SiteHeader/>
    <div className="shell">
      <div className="offer-detail-top"><Link href="/okazje"><ArrowLeft size={17}/> Wróć do okazji</Link></div>
      <section className="detail-hero">
        <div className="detail-image">
          <TravelImage src={o.image} alt={`${o.city}, ${o.country}`} className="detail-photo-img"/>
          <span className={`badge ${o.tag==='BIERZEMY'?'hot':''}`}>{o.tag}</span>
        </div>
        <div className="detail-copy">
          <div className="eyebrow">{o.flag} {o.country}</div>
          <h1>{o.city}</h1>
          <div className="detail-score"><strong>{o.score}</strong><span>/10 Tripownia Score</span></div>
          <div className="detail-price">od <strong>{o.price} zł</strong> / os.</div>
          <div className="price-status detail-price-status">Cena z zapisanej selekcji Tripowni — nie jest oznaczona jako cena live.</div>
          <p className="detail-lead">{o.reason}</p>
          <div className="detail-meta">
            <span><Plane/> {o.departure}</span><span><Moon/> {o.nights} nocy</span>
            <span><Sun/> {o.weather}</span><span><Utensils/> {o.board}</span><span><MapPin/> {o.hotel}</span>
          </div>
          <div className="detail-source">Źródło ceny: <strong>{p.name}</strong></div>
          {o.availabilityStatus === "expired" ? (
            <div className="expired-offer">Ta oferta wygasła. Wróć do okazji i wybierz aktualną alternatywę.</div>
          ) : (
            <>
              <a className="primary-cta" href={o.affiliateUrl} target="_blank" rel="sponsored noopener noreferrer">
                {o.linkType === "exact" ? `Otwórz ofertę u ${p.name}` : `Sprawdź aktualne wyniki u ${p.name}`} <ExternalLink size={18}/>
              </a>
              <small className="affiliate-note">
                {o.linkType === "exact"
                  ? "Link prowadzi do konkretnej oferty partnera. Cena i dostępność mogą się zmienić."
                  : "Link prowadzi do wyszukiwania lub strony kierunku odpowiadającej rekomendacji. Zapisana cena na Tripowni może różnić się od aktualnej ceny partnera."}
              </small>
            </>
          )}
        </div>
      </section>
    </div>
    <SiteFooter/>
  </main>;
}
