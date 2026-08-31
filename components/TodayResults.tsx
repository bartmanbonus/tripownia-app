"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, Search, ShieldCheck } from "lucide-react";
import { offers } from "@/lib/offers";
import { partners } from "@/lib/partners";
import { recommendationScore } from "@/lib/offerQuality";

export default function TodayResults(){
 const [city,setCity]=useState("Barcelona");
 const cities=useMemo(()=>Array.from(new Set(offers.map(o=>o.city))).sort((a,b)=>a.localeCompare(b,"pl")),[]);
 const rows=useMemo(()=>offers.filter(o=>o.city===city && o.availabilityStatus!=="expired").sort((a,b)=>a.price-b.price),[city]);
 const cheapest=rows[0];
 const best=rows.slice().sort((a,b)=>recommendationScore(b,"all")-recommendationScore(a,"all"))[0];
 return <section className="section shell today-results" id="dzisiejsze-wyniki">
  <div className="section-heading"><div><div className="kicker">DZISIEJSZA TABELA KIERUNKU</div><h2>Porównaj to, co Tripownia ma teraz w bazie</h2><p className="results-intro">Bez udawania ceny live: pokazujemy zapisane selekcje, źródło i typ linku. Gdy podłączymy źródła cenowe, ta tabela będzie miejscem automatycznej aktualizacji.</p></div></div>
  <div className="destination-picker"><Search size={18}/><label>Wybierz kierunek<select value={city} onChange={e=>setCity(e.target.value)}>{cities.map(c=><option key={c}>{c}</option>)}</select></label></div>
  {rows.length ? <div className="comparison-table">
   <div className="comparison-head"><span>Wariant</span><span>Partner</span><span>Co obejmuje</span><span>Status ceny</span><span>Cena</span><span></span></div>
   {rows.map(o=><div className="comparison-row" key={o.id}>
    <div><strong>{o.city}</strong><small>{o.departure} · {o.nights} noce</small>{o.id===cheapest?.id&&<b className="result-label">NAJTANIEJ W BAZIE</b>}{o.id===best?.id&&o.id!==cheapest?.id&&<b className="result-label best">NAJLEPSZY BALANS</b>}</div>
    <div><strong>{partners[o.partner].name}</strong><small>{o.linkType==="exact"?"konkretny deeplink":"wyniki / kierunek"}</small></div>
    <div className="benefits"><span><CheckCircle2 size={14}/> {o.board}</span>{o.transferIncluded&&<span><CheckCircle2 size={14}/> transfer oznaczony w pakiecie</span>}<span>{o.hotel}</span></div>
    <div><span className={`freshness ${o.priceCheckedAt?"checked":"unknown"}`}><Clock3 size={13}/>{o.priceCheckedAt?`sprawdzono ${o.priceCheckedAt}`:"brak automatycznego odświeżania"}</span></div>
    <div className="comparison-price">od <strong>{o.price} zł</strong><small>/ os.</small></div>
    <Link href={`/oferta/${o.id}`} className="compare-cta">Szczegóły <ArrowRight size={15}/></Link>
   </div>)}
  </div>:<div className="empty-results">Nie mamy jeszcze zapisanej selekcji dla tego kierunku.</div>}
  <div className="data-honesty"><ShieldCheck size={18}/><span><strong>Ważne:</strong> „Najtaniej” oznacza najniższą cenę w aktualnej bazie Tripowni, nie gwarancję najniższej ceny w całym internecie. Po podłączeniu feedów/API będziemy mogli aktualizować to automatycznie.</span></div>
 </section>
}
