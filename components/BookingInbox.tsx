"use client";
import { useEffect, useState } from "react";
import { readActiveTrip } from "@/lib/tripArchive";

export type BookingLead = {
 id: string; tripId?: string; partner: string; destination: string; type: "lot"|"hotel"|"atrakcja"|"inne";
 createdAt: string; status: "pending"|"confirmed"; reference?: string; title?: string; date?: string; confirmationUrl?: string;
};
export const BOOKING_LEADS_KEY = "tripownia-booking-leads-v1";
export const BOOKING_LEADS_EVENT = "tripownia-booking-leads-updated";
export function readBookingLeads(): BookingLead[] {
 try { const rows = JSON.parse(localStorage.getItem(BOOKING_LEADS_KEY)||"[]"); return Array.isArray(rows) ? rows.filter((r)=>r && typeof r.id === "string").slice(0,100) : []; } catch { return []; }
}
export function writeBookingLeads(rows:BookingLead[]) {
 localStorage.setItem(BOOKING_LEADS_KEY,JSON.stringify(rows.slice(0,100)));
 window.dispatchEvent(new Event(BOOKING_LEADS_EVENT));
}
export function savePendingBooking(input:{partner:string;destination:string;clickId?:string}) {
 if(typeof window==="undefined") return;
 try {
 const trip=readActiveTrip();
 const place=trip?.offerSnapshot as {city?:string;country?:string}|undefined;
 const normalize=(v:string)=>v.toLocaleLowerCase("pl").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
 const city=normalize(place?.city||"");
 const destination=normalize(input.destination||"");
 const match=Boolean(city && destination && (destination.includes(city)||city.includes(destination)));
 const partner=input.partner.toLowerCase();
 const type:BookingLead["type"]=partner==="booking"||partner==="holidaypark"?"hotel":partner==="kiwi"||partner==="esky"?"lot":partner==="getyourguide"?"atrakcja":"inne";
 const now=new Date().toISOString();
 const rows=readBookingLeads();
 const candidate=rows.find(r=>r.partner===partner&&r.destination===input.destination&&r.status==="pending"&&Date.now()-new Date(r.createdAt).getTime()<120000);
 if(candidate) return;
 writeBookingLeads([{id:input.clickId||crypto.randomUUID(),tripId:match?trip?.tripId:undefined,partner,destination:input.destination,type,createdAt:now,status:"pending"},...rows]);
 }catch{}
}
export function BookingInbox({tripOnly=false}:{tripOnly?:boolean}){
 const [rows,setRows]=useState<BookingLead[]>([]);
 const [ref,setRef]=useState<Record<string,string>>({});
 const [message,setMessage]=useState("");
 const [pasted,setPasted]=useState("");
 const [selected,setSelected]=useState("");
 useEffect(()=>{const refresh=()=>setRows(readBookingLeads());refresh();window.addEventListener(BOOKING_LEADS_EVENT,refresh);window.addEventListener("storage",refresh);return()=>{window.removeEventListener(BOOKING_LEADS_EVENT,refresh);window.removeEventListener("storage",refresh)}},[]);
 const tripId=typeof window!=="undefined"?readActiveTrip()?.tripId:undefined;
 const visible=rows.filter(r=>!tripOnly||(tripId&&r.tripId===tripId));
 const update=(id:string,patch:Partial<BookingLead>)=>writeBookingLeads(readBookingLeads().map(r=>r.id===id?{...r,...patch}:r));
 function parseText(){
 const text=pasted.slice(0,8000);
 if(!text.trim()){setMessage("Wklej tekst potwierdzenia.");return;}
 const confirmation=text.match(/(?:numer|nr|kod|reservation|booking)(?:\s+(?:rezerwacji|confirmation|number|code))?\s*[:#-]?\s*([A-Z0-9-]{5,20})/i);
 const code=confirmation?.[1]||"";
 const date=text.match(/\b20\d{2}-\d{2}-\d{2}\b/)?.[0]||"";
 const id=selected||visible.find(x=>x.status==="pending")?.id;
 if(id){update(id,{status:"confirmed",reference:code||undefined,date:date||undefined});}
 else {writeBookingLeads([{id:crypto.randomUUID(),partner:"import",destination:"",type:"inne",createdAt:new Date().toISOString(),status:"confirmed",reference:code||undefined,date:date||undefined,title:"Potwierdzenie dodane ręcznie"},...readBookingLeads()]);}
 setPasted("");setMessage("Zapisano informacje z potwierdzenia. Sprawdź je z oryginałem wiadomości.");
 }
 return <section id="centrum-rezerwacji" className="my-trip-card" style={{marginBlock:"22px",padding:"22px",borderRadius:20}}>
 <div className="my-trip-card-head"><h2>Twoje rezerwacje w jednym miejscu</h2></div>
 <p>Tripownia zapamiętuje przejścia do partnerów, ale nie ma dostępu do ich systemów płatności. Status „potwierdzona” ustawisz po otrzymaniu potwierdzenia.</p>
 <div style={{display:"grid",gap:12,marginTop:16}}>
 {visible.map(r=><div key={r.id} style={{padding:14,border:"1px solid #d9e1ec",borderRadius:14,display:"flex",flexWrap:"wrap",gap:12,alignItems:"center",justifyContent:"space-between"}}>
 <div><strong>{r.title||r.destination||"Nowa rezerwacja"} · {r.partner}</strong><div style={{fontSize:13,marginTop:5}}>{r.type} · {r.status==="confirmed"?"Potwierdzona przez użytkownika":"Oczekuje na potwierdzenie"}{r.reference?" · Kod: "+r.reference:""}</div></div>
 <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
 {r.status==="pending"&&<><input aria-label="Numer rezerwacji" placeholder="Numer potwierdzenia" value={ref[r.id]||""} onChange={e=>setRef({...ref,[r.id]:e.target.value})} style={{minWidth:145,padding:9,border:"1px solid #cdd5df",borderRadius:8}}/><button type="button" onClick={()=>update(r.id,{status:"confirmed",reference:ref[r.id]||undefined})}>Potwierdź zakup</button></>}
 <button type="button" onClick={()=>writeBookingLeads(readBookingLeads().filter(x=>x.id!==r.id))} aria-label="Usuń wpis">Usuń</button>
 </div></div>)}
 {!visible.length&&<p>Nie ma jeszcze zapisanych przejść do partnerów. Gdy wybierzesz ofertę, pojawi się tutaj jako oczekująca.</p>}
 </div>
 <div style={{marginTop:22,display:"grid",gap:10}}>
 <h3>Dodaj potwierdzenie z maila</h3>
 <p>Wklej fragment potwierdzenia z numerem rezerwacji i datą. Nie wklejaj danych kart, haseł ani dokumentów tożsamości.</p>
 <select aria-label="Powiąż z rezerwacją" value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Dopasuj do ostatniego oczekującego wpisu</option>{visible.filter(r=>r.status==="pending").map(r=><option value={r.id} key={r.id}>{r.destination||"Oferta"} — {r.partner}</option>)}</select>
 <textarea rows={3} value={pasted} onChange={e=>setPasted(e.target.value)} placeholder="Wklej numer i datę rezerwacji..." style={{width:"100%",padding:12,border:"1px solid #cdd5df",borderRadius:10}}/>
 <div><button type="button" onClick={parseText}>Zapisz z potwierdzenia</button></div>{message&&<p role="status">{message}</p>}
 </div></section>;
}
