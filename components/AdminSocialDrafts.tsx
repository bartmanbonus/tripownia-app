"use client";

import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import { offers } from "@/lib/offers";

export default function AdminSocialDrafts(){
  const [id,setId]=useState(offers[0]?.id ?? 1);
  const [copied,setCopied]=useState(false);
  const offer=useMemo(()=>offers.find(o=>o.id===id) ?? offers[0],[id]);
  if(!offer) return null;
  const url=`https://tripownia.pl/oferta/${offer.id}`;
  const text=`${offer.flag} ${offer.city} z ${offer.departure} — ${offer.nights} nocy, ostatnio od ${offer.price} zł/os. ✈️\n\n${offer.reason}\n\nSprawdź szczegóły i aktualną cenę: ${url}\n\n#tripownia #podróże #${offer.city.toLowerCase().replace(/\s+/g,"-")}`;
  async function copy(){ await navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),1500); }
  return <div className="admin-editor"><div className="admin-editor-head"><div><h2>Posty do akceptacji</h2><p>Treść powstaje automatycznie z danych oferty. Najpierw sprawdzasz, potem publikujesz — bez ręcznego przepisywania.</p></div></div><div className="admin-form-grid"><label>Oferta<select value={id} onChange={e=>setId(Number(e.target.value))}>{offers.map(o=><option key={o.id} value={o.id}>{o.flag} {o.city} · {o.price} zł</option>)}</select></label><label className="admin-form-wide">Facebook / Instagram<textarea rows={8} value={text} readOnly/></label></div><div className="admin-editor-actions"><button type="button" className="admin-save-draft" onClick={copy}>{copied?<Check size={16}/>:<Copy size={16}/>} {copied?"Skopiowano":"Skopiuj zaakceptowaną treść"}</button><a href={`/oferta/${offer.id}`} target="_blank">Sprawdź ofertę przed publikacją →</a></div><div className="admin-local-warning"><span><strong>Kontrola jakości:</strong> publikuj dopiero po potwierdzeniu ceny i deeplinku. Post celowo prowadzi najpierw do strony oferty Tripowni, dzięki czemu ruch, SEO i pomiar pozostają po stronie serwisu.</span></div></div>;
}
