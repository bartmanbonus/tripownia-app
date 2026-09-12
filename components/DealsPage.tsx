"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw, Search, Sparkles } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import { offers, isOfferExpired } from "@/lib/offers";
import { isTravelDestinationAllowed } from "@/lib/travelSafety";

function normalize(value:string){return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim()}
function directionKey(offer:any){
  const text=normalize(`${offer.city||""} ${offer.country||""}`);
  const groups:Array<[RegExp,string]>=[
    [/zanzibar|kiwengwa|matemwe|nungwi|kendwa|paje|jambiani/,"zanzibar"],
    [/durres|golem|riwiera albanska|albania/,"riwiera-albanska"],
    [/malta|mellieha|sliema|st julian|bugibba|qawra|valletta/,"malta"],
    [/teneryf|tenerife|costa adeje|playa de las americas|puerto de la cruz/,"teneryfa"],
    [/fuerteventura|corralejo|costa calma|morro jable|caleta de fuste/,"fuerteventura"],
    [/djerba|midoun|zarzis/,"djerba"],
    [/hurghada|makadi bay|soma bay|sahl hasheesh/,"hurghada"],
    [/marsa alam|port ghalib|el quseir/,"marsa-alam"],
    [/rodos|rhodes|faliraki|kolymbia|lindos/,"rodos"],
    [/kreta|crete|heraklion|hersonissos|malia|rethymno|chania/,"kreta"],
    [/majorka|mallorca|palma de mallorca|alcudia|magaluf/,"majorka"],
    [/cypr|cyprus|pafos|paphos|larnaka|ayia napa|protaras/,"cypr"],
  ];
  for(const [pattern,key] of groups)if(pattern.test(text))return key;
  return normalize(String(offer.city||offer.country||offer.id));
}
function cheapestUnique(rows:any[]){
  const best=new Map<string,any>();
  rows.filter((o:any)=>o&&Number(o.price)>0&&!isOfferExpired(o)&&isTravelDestinationAllowed(String(o.city||""),String(o.country||""))).forEach((o:any)=>{
    const key=directionKey(o);const current=best.get(key);
    if(!current||Number(o.price)<Number(current.price))best.set(key,o);
  });
  return Array.from(best.values()).sort((a:any,b:any)=>Number(a.price)-Number(b.price)).slice(0,20);
}

export default function DealsPage(){
  const fallback=useMemo(()=>cheapestUnique(offers as any[]),[]);
  const [rows,setRows]=useState<any[]>(fallback);
  const [status,setStatus]=useState<"loading"|"live"|"fallback">("loading");
  const [checkedAt,setCheckedAt]=useState<string>("");

  async function refresh(){
    setStatus("loading");
    try{
      const response=await fetch("/api/today-offers?mode=search&broad=1",{cache:"no-store"});
      const data=await response.json();
      if(!response.ok||data?.ok===false)throw new Error("feed");
      const live=cheapestUnique(Array.isArray(data?.offers)?data.offers:[]);
      if(!live.length)throw new Error("empty");
      setRows(live);setCheckedAt(String(data?.checkedAt||new Date().toISOString()));setStatus("live");
    }catch{
      setRows(fallback);setCheckedAt("");setStatus("fallback");
    }
  }

  useEffect(()=>{void refresh()},[]);
  const checkedLabel=checkedAt?new Intl.DateTimeFormat("pl-PL",{dateStyle:"short",timeStyle:"short",timeZone:"Europe/Warsaw"}).format(new Date(checkedAt)):"";

  return <main>
    <SiteHeader/>
    <section className="shell hub-page deals-hub-page">
      <div className="deals-hub-hero">
        <div>
          <div className="kicker">DZISIEJSZE OKAZJE</div>
          <h1>20 kierunków, które dziś mają sens.</h1>
          <p className="hub-lead">Bez ściany podobnych hoteli. Dla każdego kierunku zostawiamy najtańszą poprawną propozycję, żeby szybciej zobaczyć, dokąd naprawdę warto polecieć.</p>
        </div>
        <div className="deals-hub-actions">
          <Link className="primary-cta" href="/#wyszukiwarka"><Search size={17}/> Wyszukaj po swojemu</Link>
          <button className="secondary-cta" type="button" onClick={()=>void refresh()} disabled={status==="loading"}><RefreshCw size={16}/>{status==="loading"?"Odświeżamy…":"Odśwież ceny"}</button>
        </div>
      </div>

      <div className="deals-trust-bar">
        <span><Sparkles size={15}/><strong>{rows.length} różnych kierunków</strong></span>
        <span>{status==="live"?`Aktualny feed${checkedLabel?` · ${checkedLabel}`:""}`:"Inspiracje zapasowe · cenę potwierdzisz przed rezerwacją"}</span>
      </div>

      <div className="cards-grid deals-premium-grid">{rows.map((offer:any)=><OfferCard key={offer.id} offer={offer}/>)}</div>
      <div className="deals-end-cta"><div><strong>Nie widzisz swojego kierunku?</strong><span>Ustaw lotnisko, budżet, długość pobytu i wyżywienie — Tripownia poszuka szerzej.</span></div><Link href="/#wyszukiwarka">Przejdź do wyszukiwarki <ArrowRight size={16}/></Link></div>
    </section>
    <SiteFooter/>
  </main>;
}
