import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Moon, Plane, Sun, Utensils } from "lucide-react";
import { offers } from "@/lib/offers";

export default async function OfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offer = offers.find(o => o.id === Number(id));
  if (!offer) notFound();
  return <main>
    <header className="nav shell"><Link className="brand-logo" href="/"><Image src="/tripownia-logo.webp" alt="Tripownia.pl" width={180} height={140}/></Link><Link className="back-link" href="/"><ArrowLeft size={17}/> Wróć do ofert</Link></header>
    <section className="detail-hero shell"><div className="detail-image" style={{backgroundImage:`url(${offer.image})`}}><span className={`badge ${offer.tag==="BIERZEMY"?"hot":""}`}>{offer.tag}</span></div>
      <div className="detail-copy"><div className="eyebrow">{offer.flag} {offer.country} · {offer.dates}</div><h1>{offer.city}</h1><div className="detail-score"><strong>{offer.score}</strong><span>/10 Tripownia Score</span></div><div className="detail-price">od <strong>{offer.price} zł</strong> / os.</div><p className="detail-lead">{offer.reason}</p><div className="detail-meta"><span><Plane/> {offer.departure}</span><span><Moon/> {offer.nights} noce</span><span><Sun/> {offer.weather}</span><span><Utensils/> {offer.board}</span></div><a className="primary-cta" href={offer.affiliateUrl} target="_blank" rel="noreferrer">Sprawdź aktualną cenę <ExternalLink size={18}/></a><small className="affiliate-note">Cena i dostępność mogą się zmienić u partnera.</small></div></section>
    <section className="section shell"><div className="detail-panel"><div><div className="kicker">DLACZEGO TRIPOWNIA TO WYBRAŁA</div><h2>Ta oferta ma sens.</h2><p>{offer.reason}</p></div><div><div className="score-row"><span>Cena</span><strong>9,7/10</strong></div><div className="score-row"><span>Termin</span><strong>9,5/10</strong></div><div className="score-row"><span>Lot</span><strong>9,2/10</strong></div><div className="score-row"><span>Kierunek</span><strong>9,8/10</strong></div></div></div></section>
  </main>
}
