import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MapPin, Moon, Plane, Sun, Utensils } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { offers } from "@/lib/offers";
import { partners } from "@/lib/partners";

export async function generateStaticParams(){ return offers.map(o=>({id:String(o.id)})); }
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{ const {id}=await params; const o=offers.find(x=>x.id===Number(id)); return o?{title:`${o.city} od ${o.price} zł | Tripownia`,description:o.reason}:{}; }
export default async function OfferPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params; const o=offers.find(x=>x.id===Number(id)); if(!o) notFound(); const p=partners[o.partner];
 return <main><SiteHeader/><div className="shell"><div className="offer-detail-top"><Link href="/okazje"><ArrowLeft size={17}/> Wróć do okazji</Link></div><section className="detail-hero"><div className="detail-image" style={{backgroundImage:`url(${o.image})`}}><span className={`badge ${o.tag==='BIERZEMY'?'hot':''}`}>{o.tag}</span></div><div className="detail-copy"><div className="eyebrow">{o.flag} {o.country}</div><h1>{o.city}</h1><div className="detail-score"><strong>{o.score}</strong><span>/10 Tripownia Score</span></div><div className="detail-price">od <strong>{o.price} zł</strong> / os.</div><p className="detail-lead">{o.reason}</p><div className="detail-meta"><span><Plane/> {o.departure}</span><span><Moon/> {o.nights} nocy</span><span><Sun/> {o.weather}</span><span><Utensils/> {o.board}</span><span><MapPin/> {o.hotel}</span></div><div className="detail-source"><strong>Rekomendacja Tripownia.pl</strong> · partner: {p.name}</div><a className="primary-cta" href={o.affiliateUrl} target="_blank" rel="sponsored noopener noreferrer">Zobacz aktualne wyniki dla {o.city} w {p.name} <ExternalLink size={18}/></a><small className="affiliate-note">To jest wyszukiwanie kierunku u partnera. Partner może pokazać inną cenę, termin, hotel lub lotnisko niż w selekcji Tripowni. Dokładny przycisk „Przejdź do tej oferty” pokażemy tylko wtedy, gdy mamy deeplink do konkretnego pakietu.</small></div></section><section className="detail-panel"><div><div className="kicker">DLACZEGO BIERZEMY</div><h2>Najpierw kontekst, potem rezerwacja.</h2><p>{o.reason} Tripownia zatrzymuje Cię na stronie, żebyś przed przejściem do partnera mógł sprawdzić kierunek, podobne opcje i dodatki do podróży.</p></div><div><h3>Dobierz do wyjazdu</h3><div className="detail-internal-addons"><Link href="/parkingi">🚗 Parking przy lotnisku</Link><Link href="/atrakcje">🎟 Atrakcje na miejscu</Link><Link href="/esim">📱 eSIM / internet</Link><Link href={`/kierunki`}>🌍 Zobacz kierunki</Link></div></div></section></div><SiteFooter/></main>;
}
