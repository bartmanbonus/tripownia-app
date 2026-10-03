"use client";

import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import { offers } from "@/lib/offers";
import { findSocialOfferForCatalogOffer } from "@/lib/socialOffers";

export default function AdminSocialDrafts(){
  const [id,setId]=useState(offers[0]?.id ?? 1);
  const [copied,setCopied]=useState<"post"|"comment"|null>(null);
  const offer=useMemo(()=>offers.find(o=>o.id===id) ?? offers[0],[id]);
  if(!offer) return null;
  const curated=findSocialOfferForCatalogOffer({ affiliateUrl:offer.affiliateUrl, city:offer.city, hotel:offer.hotel, price:offer.price });
  const url=curated
    ? `https://tripownia.pl/o/${curated.slug}`
    : offer.id >= 1_000_000
      ? "https://tripownia.pl/okazje"
      : `https://tripownia.pl/oferta/${offer.id}`;
  const text=`${offer.flag} ${offer.city} z ${offer.departure} — ${offer.nights} nocy, od ${offer.price} zł/os. ✈️\n\n${offer.reason}\n\n👉 Link do oferty w pierwszym komentarzu.\n\n❤️ Obserwuj Tripownię, jeśli chcesz codziennie dostawać konkretne wyjazdy z ceną i terminem.\n\n#Tripownia #Podróże #${offer.city.toLowerCase().replace(/\\s+/g,"-")}`;
  const comment=`👉 ${url}`;
  async function copy(kind:"post"|"comment"){ await navigator.clipboard.writeText(kind==="post"?text:comment); setCopied(kind); setTimeout(()=>setCopied(null),1500); }
  return <div className="admin-editor"><div className="admin-editor-head"><div><h2>Posty do akceptacji</h2><p>Treść powstaje automatycznie z danych oferty. Najpierw sprawdzasz, potem publikujesz — bez ręcznego przepisywania.</p></div></div><div className="admin-form-grid"><label>Oferta<select value={id} onChange={e=>setId(Number(e.target.value))}>{offers.map(o=><option key={o.id} value={o.id}>{o.flag} {o.city} · {o.price} zł</option>)}</select></label><label className="admin-form-wide">Facebook / Instagram<textarea rows={9} value={text} readOnly/></label><label className="admin-form-wide">Pierwszy komentarz<textarea rows={2} value={comment} readOnly/></label></div><div className="admin-editor-actions"><button type="button" className="admin-save-draft" onClick={()=>copy("post")}>{copied==="post"?<Check size={16}/>:<Copy size={16}/>} {copied==="post"?"Skopiowano":"Skopiuj post"}</button><button type="button" className="admin-save-draft" onClick={()=>copy("comment")}>{copied==="comment"?<Check size={16}/>:<Copy size={16}/>} {copied==="comment"?"Skopiowano":"Skopiuj komentarz"}</button><a href={url} target="_blank">Sprawdź ofertę przed publikacją →</a></div><div className="admin-local-warning"><span><strong>Kontrola jakości:</strong> publikuj dopiero po potwierdzeniu ceny i deeplinku. Post celowo prowadzi najpierw do strony oferty Tripowni, dzięki czemu ruch, SEO i pomiar pozostają po stronie serwisu.</span></div></div>;
}
