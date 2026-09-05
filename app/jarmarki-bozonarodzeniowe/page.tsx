import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { partners } from "@/lib/partners";

export const metadata:Metadata={
  title:"Jarmarki bożonarodzeniowe 2026 — terminy i wyjazdy | Tripownia.pl",
  description:"Wiedeń, Praga, Berlin i Budapeszt: okresy działania jarmarków 2026 i gotowe pomysły na wyjazd.",
  alternates:{canonical:"/jarmarki-bozonarodzeniowe"}
};
export const dynamic = "force-dynamic";

const PUBLISH_UNTIL = new Date("2027-01-07T22:59:59Z").getTime();
const ideas=[
 {city:"Wiedeń",flag:"🇦🇹",market:"13 listopada – 26 grudnia 2026",note:"Schönbrunn działa dłużej — do początku stycznia.",sample:["2026-11-20","2026-11-23"],image:"/images/destinations/wieden.jpg",airport:"VIE",see:"Rathausplatz · Schönbrunn · Belweder · Stephansplatz"},
 {city:"Praga",flag:"🇨🇿",market:"28 listopada 2026 – 6 stycznia 2027",note:"Najbardziej klasyczne jarmarki działają przez cały okres świąteczno-noworoczny.",sample:["2026-12-04","2026-12-07"],image:"/images/destinations/praga.jpg",airport:"PRG",see:"Rynek Staromiejski · Most Karola · Zamek · Mala Strana"},
 {city:"Berlin",flag:"🇩🇪",market:"23 listopada – 27 grudnia 2026",note:"Poszczególne jarmarki mają różne terminy; część startuje wcześniej.",sample:["2026-11-27","2026-11-30"],image:"/images/destinations/berlin.jpg",airport:"BER",see:"Charlottenburg · Mitte · okolice Gendarmenmarkt · East Side Gallery"},
 {city:"Budapeszt",flag:"🇭🇺",market:"połowa listopada – 31 grudnia 2026",note:"Dokładne daty poszczególnych placów warto potwierdzić przed rezerwacją.",sample:["2026-12-11","2026-12-14"],image:"/images/destinations/budapeszt.jpg",airport:"BUD",see:"Bazylika św. Stefana · Vörösmarty tér · Parlament · termy"},
];
function flightSearch(airport:string,sample:string[]){const u=new URL("https://www.kiwi.com/deep");u.searchParams.set("from","WAW");u.searchParams.set("to",airport);u.searchParams.set("departure",sample[0]);u.searchParams.set("return",sample[1]);u.searchParams.set("currency","PLN");return partners.kiwi.buildUrl(u.toString())}
function gyg(city:string){return partners.getyourguide.buildUrl(`https://www.getyourguide.pl/s/?q=${encodeURIComponent(city+' Christmas market')}`)}

export default function Page(){
  if (Date.now() > PUBLISH_UNTIL) notFound();
  return <main><SiteHeader/>
    <section className="seasonal-hero shell"><div className="kicker">SEZON TERAZ · JARMARKI 2026</div><h1>Nie wybieraj jednego weekendu w ciemno. Najpierw zobacz, kiedy jarmark naprawdę trwa.</h1><p>Pokazujemy całe okresy działania jarmarków. Konkretne daty lotu są tylko punktem startowym do sprawdzenia.</p></section>
    <section className="section shell">
      <div className="seasonal-calendar seasonal-calendar-premium">{ideas.map(i=><div key={i.city}><strong>{i.flag} {i.city}</strong><b>{i.market}</b><span>{i.note}</span></div>)}</div>
      <div className="seasonal-grid">{ideas.map(i=><article className="seasonal-card" key={i.city}><img src={i.image} alt={`${i.city} — jarmarki bożonarodzeniowe`} /><div className="seasonal-card-body"><div className="kicker">{i.flag} JARMARKI</div><h2>{i.city}</h2><div className="seasonal-date-window"><small>OKRES JARMARKÓW</small><strong>{i.market}</strong></div><p>{i.note}</p><p><b>Co połączyć:</b> {i.see}</p><div className="seasonal-actions"><a href={flightSearch(i.airport,i.sample)} target="_blank" rel="sponsored noopener noreferrer">Sprawdź wyjazd</a><a href={gyg(i.city)} target="_blank" rel="sponsored noopener noreferrer">Atrakcje i bilety</a></div></div></article>)}</div>
      <p className="seasonal-expiry-note">Ta sekcja jest sezonowa i automatycznie znika z publikacji po 7 stycznia 2027.</p>
    </section><SiteFooter/></main>
}
