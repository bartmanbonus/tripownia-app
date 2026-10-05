"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, ExternalLink, Send } from "lucide-react";
import { getSocialDailyPlan } from "@/lib/social-selection";
import styles from "./AdminSocialWeekPlanner.module.css";
import { adminFetch } from "@/lib/adminClient";
import { findSocialOfferForCatalogOffer } from "@/lib/socialOffers";
import type { Offer } from "@/lib/offers";
import { destinationRotationKey } from "@/lib/destination-rotation";
import { isPromotableOffer } from "@/lib/offerValuePolicy";

type Status = "proposal" | "approved" | "published";

function pad(value:number){ return String(value).padStart(2,"0"); }
function key(date:Date){ return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`; }
function dateFromKey(value:string){ const [y,m,d]=value.split("-").map(Number); return new Date(y,m-1,d,12); }
function monday(date:Date){ const d=new Date(date); const offset=(d.getDay()+6)%7; d.setDate(d.getDate()-offset); d.setHours(12,0,0,0); return d; }
function addDays(date:Date, amount:number){ const d=new Date(date); d.setDate(d.getDate()+amount); return d; }
function normalizeHistoryValue(value:string){
  return value.toLocaleLowerCase("pl").replace(/ł/g,"l").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}
function offerDestinationKey(offer:Offer){
  return destinationRotationKey(offer);
}
function offerHotelKey(offer:Offer){
  return normalizeHistoryValue(offer.hotel||"");
}
function publicOfferUrl(
  item: ReturnType<typeof getSocialDailyPlan>["items"][number],
  placement: "post"|"comment" = "post"
) {
  const o=item.offer;
  const curated=findSocialOfferForCatalogOffer({
    affiliateUrl:o.affiliateUrl,
    city:o.city,
    hotel:o.hotel,
    price:o.price,
  });
  const path=curated
    ? `/o/${curated.slug}`
    : o.id>=1_000_000
      ? item.kind==="flight" ? "/tanie-loty" : "/okazje"
      : `/oferta/${o.id}`;
  const url=new URL(path,"https://tripownia.pl");
  url.searchParams.set("utm_source","facebook");
  url.searchParams.set("utm_medium","social");
  url.searchParams.set("utm_campaign",item.kind==="flight" ? "perelka_lotnicza" : "oferta_dnia");
  url.searchParams.set("utm_content",`${o.city}-${o.id}-${placement}`.toLowerCase().replace(/[^a-z0-9]+/g,"-"));
  return url.toString();
}
function buildText(
  item: ReturnType<typeof getSocialDailyPlan>["items"][number],
  placement: "post"|"comment" = "post"
) {
  const o=item.offer;
  const landing=publicOfferUrl(item,placement);
  const price=o.price>0 ? `${o.price.toLocaleString("pl-PL")} zł/os.` : "sprawdź aktualną cenę";
  const postCta = placement === "comment"
    ? "👇 Link do konkretnej oferty w pierwszym komentarzu."
    : `👉 Sprawdź konkretną ofertę: ${landing}`;
  const tags = item.kind === "city" ? "#Tripownia #CityBreak #TaniePodróże" : item.kind === "flight" ? "#Tripownia #TanieLoty #Podróże" : "#Tripownia #Wakacje #Podróże";
  const followCta = "❤️ Obserwuj Tripownię — codziennie łapiemy takie konkretne ceny.";

  if(item.kind === "flight"){
    const hook=o.price>0 ? `${o.flag || "✈️"} ${o.city.toUpperCase()} — lot od ${o.price.toLocaleString("pl-PL")} zł 🔥` : `${o.flag || "✈️"} ${o.city.toUpperCase()} — dziś warto sprawdzić ceny lotów ✈️`;
    return `${hook}\n\nWylot: ${o.departure}\nTermin: ${o.dates}\n\n${o.reason}\n\n${postCta}\n\n${followCta}\n\n${tags}`;
  }

  if(item.kind === "city"){
    return `${o.flag || "✈️"} ${o.city.toUpperCase()} za ${price} 🔥\n\n✈️ ${o.departure}\n📅 ${o.dates}\n🏨 ${o.nights} nocy · ${o.hotel}\n🍽️ ${o.board}\n\n${o.reason}\n\n${postCta}\n\n${followCta}\n\n${tags}`;
  }

  if(item.kind === "seasonal"){
    return `Gdy w Polsce robi się chłodniej, ${o.city} wygląda coraz lepiej. ☀️\n\nCena: ${price}\nWylot: ${o.departure}\nTermin: ${o.dates}\nHotel: ${o.hotel}\n\n${o.reason}\n\n${postCta}\n\n${followCta}\n\n${tags}`;
  }

  return `${o.flag || "✈️"} ${o.city.toUpperCase()} za ${price} 🔥\n\n✈️ Wylot: ${o.departure}\n📅 ${o.dates}\n🏨 ${o.nights} nocy · ${o.hotel}\n🍽️ ${o.board}\n\n${o.reason}\n\n${postCta}\n\n${followCta}\n\n${tags}`;
}

export default function AdminSocialWeekPlanner(){
  const today=useMemo(()=>new Date(),[]);
  const [weekStart,setWeekStart]=useState(()=>monday(today));
  const [selected,setSelected]=useState(()=>key(today));
  const [statuses,setStatuses]=useState<Record<number,Status>>({});
  const [publishing,setPublishing]=useState<number|null>(null);
  const [linkPlacement,setLinkPlacement]=useState<"post"|"comment">("comment");
  const [liveOffers,setLiveOffers]=useState<Offer[]>([]);
  const [liveLoading,setLiveLoading]=useState(true);
  const [liveError,setLiveError]=useState("");
  const [recentDestinationKeys,setRecentDestinationKeys]=useState<string[]>([]);
  const [recentHotelKeys,setRecentHotelKeys]=useState<string[]>([]);

  useEffect(()=>{
    let active=true;
    setLiveLoading(true);
    Promise.all([
      fetch("/api/today-offers?mode=search&broad=1&fast=1",{cache:"no-store"}),
      adminFetch("/api/admin/social-publish?days=7"),
    ])
      .then(async([liveResponse,historyResponse])=>{
        const [liveData,historyData]=await Promise.all([liveResponse.json(),historyResponse.json()]);
        if(!liveResponse.ok||!liveData?.ok) throw new Error(liveData?.error||"Nie udało się pobrać dzisiejszych ofert");
        if(!historyResponse.ok||!historyData?.ok) throw new Error(historyData?.error||"Nie udało się pobrać historii publikacji");
        if(active){
          const verifiedOffers=(Array.isArray(liveData.offers)?liveData.offers:[]).filter((offer:Offer)=>isPromotableOffer(offer));
          setLiveOffers(verifiedOffers);
          const rows=Array.isArray(historyData.rows)?historyData.rows:[];
          setRecentDestinationKeys(Array.from(new Set(rows.map((row:{destination_key?:string})=>String(row.destination_key||"")).filter(Boolean))));
          setRecentHotelKeys(Array.from(new Set(rows.map((row:{hotel?:string})=>normalizeHistoryValue(String(row.hotel||""))).filter(Boolean))));
          setLiveError("");
        }
      })
      .catch((error)=>{
        if(active) setLiveError(error instanceof Error?error.message:String(error));
      })
      .finally(()=>{ if(active) setLiveLoading(false); });
    return ()=>{ active=false; };
  },[]);

  const eligibleLiveOffers=useMemo(()=>liveOffers.filter((offer)=>{
    const destinationKey=offerDestinationKey(offer);
    const hotelKey=offerHotelKey(offer);
    return !recentDestinationKeys.includes(destinationKey) && (!hotelKey || !recentHotelKeys.includes(hotelKey));
  }),[liveOffers,recentDestinationKeys,recentHotelKeys]);

  const days=useMemo(()=>Array.from({length:7},(_,i)=>addDays(weekStart,i)),[weekStart]);
  const selectedDate=dateFromKey(selected);
  const plan=useMemo(()=>getSocialDailyPlan(eligibleLiveOffers,selectedDate),[selected,eligibleLiveOffers]);

  function moveWeek(amount:number){
    const next=addDays(weekStart,amount*7);
    setWeekStart(next);
    setSelected(key(next));
  }

  async function publish(item: ReturnType<typeof getSocialDailyPlan>["items"][number]){
    if(statuses[item.offer.id]!=="approved") return;
    setPublishing(item.offer.id);
    try{
      const response=await adminFetch("/api/admin/social-publish",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({offerId:item.offer.id,offer:item.offer,text:buildText(item,linkPlacement),approved:true,channels:["facebook","instagram"],linkPlacement})
      });
      const data=await response.json();
      if(!response.ok||!data.ok) throw new Error(data.error||"Publikacja nie powiodła się");
      setStatuses((current)=>({...current,[item.offer.id]:"published"}));
      setRecentDestinationKeys((current)=>Array.from(new Set([...current,offerDestinationKey(item.offer)])));
      const hotelKey=offerHotelKey(item.offer);
      if(hotelKey) setRecentHotelKeys((current)=>Array.from(new Set([...current,hotelKey])));
    }catch(error){ alert(error instanceof Error?error.message:String(error)); }
    finally{ setPublishing(null); }
  }

  return <div className={styles.wrap}>
    <div className={styles.topbar}>
      <div>
        <div className="kicker">TYDZIEŃ PUBLIKACJI</div>
        <h2>2 feedy + 3 Story na dziś</h2>
        <p>Dwa najmocniejsze klikowo tematy trafiają do feedu, a trzy kolejne zostają kandydatami do Story. Bez powtórek kierunku i hotelu z ostatnich 7 dni.</p>
      </div>
      <div className={styles.nav}>
        <button onClick={()=>moveWeek(-1)} aria-label="Poprzedni tydzień"><ChevronLeft size={17}/></button>
        <strong>{new Intl.DateTimeFormat("pl-PL",{day:"numeric",month:"short"}).format(days[0])} – {new Intl.DateTimeFormat("pl-PL",{day:"numeric",month:"short",year:"numeric"}).format(days[6])}</strong>
        <button onClick={()=>moveWeek(1)} aria-label="Następny tydzień"><ChevronRight size={17}/></button>
      </div>
    </div>

    <div className={styles.days}>
      {days.map((day)=>{
        const dayKey=key(day);
        const p=getSocialDailyPlan(dayKey===key(today)?eligibleLiveOffers:[],day);
        const active=dayKey===selected;
        return <button key={dayKey} onClick={()=>setSelected(dayKey)} className={`${styles.day} ${active?styles.active:""}`}>
          <span>{new Intl.DateTimeFormat("pl-PL",{weekday:"short"}).format(day)}</span>
          <strong>{day.getDate()}</strong>
          <small>{p.items.length ? `${p.items.length} świeżych` : "czeka na skan"}</small>
        </button>;
      })}
    </div>

    <section className={styles.dayPanel}>
      <div className={styles.dayHead}>
        <div>
          <div className="kicker">{plan.dayName.toLocaleUpperCase("pl")} · {selected}</div>
          {selected===key(today) && liveLoading && <p style={{margin:"6px 0 0"}}>Pobieram świeże oferty…</p>}
          {selected===key(today) && liveError && <p style={{margin:"6px 0 0"}}>Live feed: {liveError}</p>}
          <h2>{plan.theme}</h2>
          <p>{plan.description}</p>
          {selected===key(today) && <p style={{margin:"6px 0 0",fontSize:12}}>Wykluczono {Math.max(0,liveOffers.length-eligibleLiveOffers.length)} ofert przez historię kierunku/hotelu z ostatnich 7 dni.</p>}
        </div>
        <div>
          <div className={styles.ready}>Poranny skan: 07:00</div>
          <label style={{display:"grid",gap:4,marginTop:8,fontSize:12,fontWeight:700}}>
            Link na Facebooku
            <select value={linkPlacement} onChange={(event)=>setLinkPlacement(event.target.value==="comment"?"comment":"post")} style={{padding:"7px 9px",border:"1px solid #dfe3e8",borderRadius:10,background:"#fff"}}>
              <option value="comment">W 1. komentarzu — domyślnie</option>
              <option value="post">W poście — test</option>
            </select>
          </label>
        </div>
      </div>

      {!plan.items.length ? <div className={styles.empty}>Brak zaplanowanych ofert. Ten dzień zostanie uzupełniony po swoim porannym skanie.</div> :
      <div className={styles.offers}>
        {plan.items.map((item,index)=>{
          const status=statuses[item.offer.id]||"proposal";
          const flight=item.kind==="flight";
          const hasPrice=item.offer.price>0;
          const manualFlight=flight&&!hasPrice;
          return <article key={item.offer.id} className={styles.card}>
            <div className={styles.image} style={{backgroundImage:`url(${item.offer.image})`}}>
              <span className={styles.time}>{item.time}</span>
              <span className={`${styles.badge} ${flight?styles.flight:""}`}>{item.label}</span>
            </div>
            <div className={styles.body}>
              <small>{index<2 ? `FEED ${index+1}/2` : `STORY ${index-1}/3`}</small>
              <h3>{flight ? hasPrice ? `✈️ ${item.offer.city} — mocna cena` : `✈️ ${item.offer.city} na radarze` : `${item.offer.flag} ${item.offer.city}`}</h3>
              <strong className={styles.price}>{flight && hasPrice ? `od ${item.offer.price} zł` : hasPrice ? `od ${item.offer.price} zł/os.` : "sprawdź ceny lotów"}</strong>
              <p>📅 {item.offer.dates}<br/>✈️ {item.offer.departure}{flight?` → ${item.offer.city}`:` · ${item.offer.nights} nocy`}</p>
              <div className={styles.reason}>{item.priceGem.reason}</div>
              {index<2 && <details style={{marginTop:10}}><summary style={{cursor:"pointer",fontWeight:800}}>Podgląd treści posta</summary><pre style={{whiteSpace:"pre-wrap",fontFamily:"inherit",fontSize:12,lineHeight:1.5,margin:"8px 0 0"}}>{buildText(item,linkPlacement)}</pre></details>}
              <div className={styles.actions}>
                {index<2 && status==="proposal" && <button onClick={()=>setStatuses((s)=>({...s,[item.offer.id]:"approved"}))}><Check size={15}/> {manualFlight?"Zatwierdź po sprawdzeniu":"Zatwierdź feed"}</button>}
                {index<2 && status==="approved" && <button onClick={()=>publish(item)} disabled={publishing===item.offer.id}><Send size={15}/> {publishing===item.offer.id?"Publikuję…":"Publikuj FB + IG"}</button>}
                {index<2 && status==="published" && <span>✓ Opublikowano</span>}
                {index>=2 && <span>Story — kandydat do przygotowania</span>}
                <a href={item.offer.affiliateUrl} target="_blank" rel="sponsored noreferrer">{flight?"Sprawdź lot":"Sprawdź ofertę"} <ExternalLink size={14}/></a>
              </div>
            </div>
          </article>;
        })}
      </div>}
    </section>
  </div>;
}
