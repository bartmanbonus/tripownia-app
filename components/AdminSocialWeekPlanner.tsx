"use client";

import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, ExternalLink, Send } from "lucide-react";
import { getSocialDailyPlan } from "@/lib/social-selection";
import styles from "./AdminSocialWeekPlanner.module.css";

type Status = "proposal" | "approved" | "published";

function pad(value:number){ return String(value).padStart(2,"0"); }
function key(date:Date){ return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`; }
function dateFromKey(value:string){ const [y,m,d]=value.split("-").map(Number); return new Date(y,m-1,d,12); }
function monday(date:Date){ const d=new Date(date); const offset=(d.getDay()+6)%7; d.setDate(d.getDate()-offset); d.setHours(12,0,0,0); return d; }
function addDays(date:Date, amount:number){ const d=new Date(date); d.setDate(d.getDate()+amount); return d; }
function publicOfferUrl(item: ReturnType<typeof getSocialDailyPlan>["items"][number]) {
  const o=item.offer;
  if(o.id>=1_000_000) return item.kind==="flight" ? "https://tripownia.pl/tanie-loty" : "https://tripownia.pl/okazje";
  return `https://tripownia.pl/oferta/${o.id}`;
}
function buildText(item: ReturnType<typeof getSocialDailyPlan>["items"][number]) {
  const o=item.offer;
  const flight=o.category.includes("flight");
  const landing=publicOfferUrl(item);
  if(flight){
    const price=o.price>0 ? `💰 ${o.price} zł/os.\n` : "💰 Cena do sprawdzenia przed publikacją\n";
    return `✈️ ${o.price>0?"PERŁKA LOTNICZA":"LOT DO SPRAWDZENIA"}: ${o.departure} → ${o.city}\n${price}📅 ${o.dates}\n\n${o.reason}\n\n👉 Sprawdź lot: ${landing}`;
  }
  return `${o.flag} ${o.city} od ${o.price} zł/os.\n📅 ${o.dates}\n✈️ Wylot: ${o.departure}\n🏨 ${o.nights} nocy · ${o.hotel}\n🍽️ ${o.board}\n\n${o.reason}\n\n👉 Sprawdź ofertę: ${landing}`;
}

export default function AdminSocialWeekPlanner(){
  const today=useMemo(()=>new Date(),[]);
  const [weekStart,setWeekStart]=useState(()=>monday(today));
  const [selected,setSelected]=useState(()=>key(today));
  const [statuses,setStatuses]=useState<Record<number,Status>>({});
  const [publishing,setPublishing]=useState<number|null>(null);

  const days=useMemo(()=>Array.from({length:7},(_,i)=>addDays(weekStart,i)),[weekStart]);
  const selectedDate=dateFromKey(selected);
  const plan=useMemo(()=>getSocialDailyPlan([],selectedDate),[selected]);

  function moveWeek(amount:number){
    const next=addDays(weekStart,amount*7);
    setWeekStart(next);
    setSelected(key(next));
  }

  async function publish(item: ReturnType<typeof getSocialDailyPlan>["items"][number]){
    if(statuses[item.offer.id]!=="approved") return;
    setPublishing(item.offer.id);
    try{
      const response=await fetch("/admin/api/social-publish",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({offerId:item.offer.id,text:buildText(item),approved:true,channels:["facebook","instagram"]})
      });
      const data=await response.json();
      if(!response.ok||!data.ok) throw new Error(data.error||"Publikacja nie powiodła się");
      setStatuses((current)=>({...current,[item.offer.id]:"published"}));
    }catch(error){ alert(error instanceof Error?error.message:String(error)); }
    finally{ setPublishing(null); }
  }

  return <div className={styles.wrap}>
    <div className={styles.topbar}>
      <div>
        <div className="kicker">TYDZIEŃ PUBLIKACJI</div>
        <h2>Świeże okazje, bez przeładowania</h2>
        <p>Każdy dzień dostaje własny zestaw dopiero po porannym skanie. Przyszłych dni nie wypełniamy starymi cenami.</p>
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
        const p=getSocialDailyPlan([],day);
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
          <h2>{plan.theme}</h2>
          <p>{plan.description}</p>
        </div>
        <div className={styles.ready}>Poranny skan: 07:00</div>
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
              <small>POST {index+1}/5</small>
              <h3>{flight?"✈️ ":item.offer.flag+" "}{item.offer.city}</h3>
              <strong className={styles.price}>{hasPrice?`od ${item.offer.price} zł/os.`:"cena do sprawdzenia"}</strong>
              <p>📅 {item.offer.dates}<br/>✈️ {item.offer.departure}{flight?` → ${item.offer.city}`:` · ${item.offer.nights} nocy`}</p>
              <div className={styles.reason}>{item.priceGem.reason}</div>
              <div className={styles.actions}>
                {status==="proposal" && <button onClick={()=>setStatuses((s)=>({...s,[item.offer.id]:"approved"}))}><Check size={15}/> {manualFlight?"Zatwierdź po sprawdzeniu":"Zatwierdź"}</button>}
                {status==="approved" && <button onClick={()=>publish(item)} disabled={publishing===item.offer.id}><Send size={15}/> {publishing===item.offer.id?"Publikuję…":"Publikuj FB + IG"}</button>}
                {status==="published" && <span>✓ Opublikowano</span>}
                <a href={item.offer.affiliateUrl} target="_blank" rel="sponsored noreferrer">{flight?"Sprawdź lot":"Sprawdź ofertę"} <ExternalLink size={14}/></a>
              </div>
            </div>
          </article>;
        })}
      </div>}
    </section>
  </div>;
}
