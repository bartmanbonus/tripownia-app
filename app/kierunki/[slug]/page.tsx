import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DestinationLiveOffers from "@/components/DestinationLiveOffers";
import { destinationArticles, getDestinationArticleBySlug } from "@/lib/destinationEditorial";
import "./destination-guide.css";

export function generateStaticParams() { return destinationArticles.map(item => ({slug:item.slug})); }
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params; const item=getDestinationArticleBySlug(slug);
 if(!item)return {};
 return {title:item.name+" – wakacje, loty, hotele i poradnik podróży",description:(item.hook+" Sprawdź kiedy lecieć, co zobaczyć, loty i noclegi na Tripowni.").slice(0,165),alternates:{canonical:item.href},openGraph:{title:item.name+" – przewodnik podróżniczy | Tripownia",description:item.hook,type:"article",url:"https://tripownia.pl"+item.href},robots:{index:true,follow:true}};
}
export default async function DestinationGuide({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params; const item=getDestinationArticleBySlug(slug); if(!item)notFound();
 const encoded=encodeURIComponent(item.query);
 const related=item.related.map(name=>destinationArticles.find(x=>x.name===name)).filter((x):x is typeof item=>Boolean(x));
 const faq=[
  {q:"Kiedy najlepiej pojechać do "+item.name+"?",a:item.season},
  {q:"Co warto zobaczyć – "+item.name+"?",a:item.places},
  {q:"Jak zaplanować wyjazd – "+item.name+"?",a:item.itinerary},
  {q:"Gdzie szukać noclegu – "+item.name+"?",a:item.stay}
 ];
 const schema={"@context":"https://schema.org","@graph":[
  {"@type":"BreadcrumbList",itemListElement:[{ "@type":"ListItem",position:1,name:"Tripownia",item:"https://tripownia.pl/"},{ "@type":"ListItem",position:2,name:"Kierunki",item:"https://tripownia.pl/kierunki"},{ "@type":"ListItem",position:3,name:item.name,item:"https://tripownia.pl"+item.href}]},
  {"@type":"Article",headline:item.name+" – przewodnik podróży",description:item.hook,inLanguage:"pl-PL",mainEntityOfPage:"https://tripownia.pl"+item.href,author:{"@type":"Organization",name:"Tripownia"},publisher:{"@type":"Organization",name:"Tripownia",url:"https://tripownia.pl"}},
  {"@type":"FAQPage",mainEntity:faq.map(x=>({"@type":"Question",name:x.q,acceptedAnswer:{"@type":"Answer",text:x.a}}))}
 ]};
 return <main><SiteHeader/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}}/>
 <article className="shell destination-guide">
 <nav aria-label="Ścieżka nawigacji"><Link href="/">Tripownia</Link> / <Link href="/kierunki">Kierunki</Link> / {item.name}</nav>
 <header className="destination-guide-hero"><div className="kicker">PRZEWODNIK TRIPOWNI</div><h1>{item.name} – kiedy jechać, co zobaczyć i jak zaplanować wyjazd?</h1><p>{item.hook}</p>
 <div className="destination-guide-actions"><Link className="primary-cta" href={"/okazje?destination="+encoded+"&source=destination_guide"}>🏖️ Sprawdź oferty</Link><Link className="secondary-cta" href={"/loty?destination="+encoded}>✈️ Porównaj loty</Link><Link className="secondary-cta" href={"/hotele?destination="+encoded}>🏨 Sprawdź hotele</Link></div>
 <small>Nie pokazujemy niepotwierdzonych cen. Dostępność i końcową cenę potwierdzasz przy rezerwacji.</small></header>
 <div className="destination-guide-layout"><div className="destination-guide-article">
 <section><h2>Kiedy najlepiej pojechać?</h2><p>{item.season}</p><p>Przed zakupem sprawdź pogodę dla konkretnego regionu oraz porównaj ceny lotów w kilku terminach. Warunki mogą zmieniać się w obrębie jednego kraju.</p></section>
 <section><h2>Co zobaczyć w {item.name}?</h2><p>{item.places}</p><p>Zacznij od miejsc, które najbardziej Cię interesują. Następnie sprawdź czas dojazdu z lotniska, by nie spędzić urlopu głównie w transferach.</p></section>
 <section><h2>Jak zaplanować trasę?</h2><p>{item.itinerary}</p><p>Porównaj dwa warianty: gotowe wakacje i samodzielnie dobrany lot oraz hotel. Uwzględnij bagaż, transfery i posiłki.</p></section>
 <section><h2>Gdzie szukać noclegu?</h2><p>{item.stay}</p><p>Wyszukiwarka hoteli Tripowni pozwala rozpocząć od wybranego kierunku, a potem ustawić własny termin i liczbę osób.</p></section>
 <section><h2>Na co uważać przed wyjazdem?</h2><p>{item.tip}</p><p>Przed rezerwacją sprawdź aktualne zasady wjazdu, ubezpieczenie i oficjalne komunikaty MSZ.</p></section>
 </div><aside className="destination-guide-aside"><h2>Zaplanuj {item.name}</h2>
 <Link href={"/loty?destination="+encoded}>✈️ Loty z Polski →</Link><Link href={"/hotele?destination="+encoded}>🏨 Hotele i noclegi →</Link><Link href={"/okazje?destination="+encoded+"&source=destination_guide"}>🏖️ Wakacje i pakiety →</Link><Link href={"/szukaj?destination="+encoded}>🔎 Własny termin i budżet →</Link><Link href="/planer-podrozy">🧭 Planer podróży →</Link>
 <p>Całą podróż możesz zacząć planować na Tripowni. Ceny i dostępność pochodzą z wyszukiwania i potwierdza je partner.</p></aside></div>
 <section className="destination-guide-offers"><div className="kicker">AKTUALNE PROPOZYCJE</div><h2>Oferty: {item.name}</h2><p>Jeśli dziś nie ma potwierdzonych pakietów, sprawdź osobno loty i hotele. Nie podstawiamy przypadkowych kierunków.</p><DestinationLiveOffers destination={item.query}/></section>
 <section className="destination-guide-related"><h2>Podobne kierunki – porównaj przed zakupem</h2><div>{related.map(x=><Link key={x.slug} href={x.href}>{x.name} →</Link>)}</div><Link href="/kierunki">Wszystkie kierunki →</Link></section>
 <section className="destination-guide-faq"><h2>Najczęstsze pytania</h2>{faq.map(x=><details key={x.q}><summary>{x.q}</summary><p>{x.a}</p></details>)}</section>
 <small className="destination-guide-disclosure">Tripownia może otrzymać prowizję, gdy użytkownik przejdzie do rezerwacji u partnera.</small>
 </article><SiteFooter/></main>;
}
