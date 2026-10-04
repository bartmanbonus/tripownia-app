import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import { homepageFallbackOffers, isOfferExpired, type Offer } from "@/lib/offers";
import { isTravelDestinationAllowed } from "@/lib/travelSafety";

type Motif = {
  title: string;
  kicker: string;
  description: string;
  searchHref: string;
  match: (offer: Offer) => boolean;
};

const warmPattern = /cieplo|plaza|allinclusive|egipt|turcj|cypr|malta|hiszp|tunez|zanzibar|malediw|mauritius|zea|dubaj|madera|teneryf|fuertevent/i;
const exoticPattern = /zanzibar|tanzania|kenia|mauritius|malediw|seszel|tajland|wietnam|indonez|bali|sri lanka|dominik|meksyk|jamaj|rpa/i;
const idCountries = new Set(["Polska","Włochy","Hiszpania","Portugalia","Grecja","Cypr","Malta","Czechy","Austria","Węgry","Francja","Niemcy","Holandia","Dania","Chorwacja","Bułgaria","Słowacja","Słowenia"]);

const motifs: Record<string, Motif> = {
  "do-1000-zl": {
    title:"Wyjazdy do 1 000 zł/os.", kicker:"BUDŻET",
    description:"Najtańsze sensowne propozycje, które mieszczą się w limicie 1 000 zł za osobę.",
    searchHref:"/szukaj?budget=1000&tab=Lot%20%2B%20hotel",
    match:(o)=>o.price<=1000,
  },
  "do-1500-zl": {
    title:"Wyjazdy do 1 500 zł/os.", kicker:"BUDŻET",
    description:"City breaki i krótsze wyjazdy z limitem do 1 500 zł za osobę.",
    searchHref:"/szukaj?budget=1500&tab=Lot%20%2B%20hotel",
    match:(o)=>o.price<=1500,
  },
  "3-4-dni": {
    title:"Wyjazdy na 3–4 dni", kicker:"KRÓTKO",
    description:"Krótkie wypady, które łatwiej wcisnąć w weekend albo kilka dni urlopu.",
    searchHref:"/szukaj?duration=3-4&tab=City%20break",
    match:(o)=>o.nights>=3&&o.nights<=4,
  },
  "cieplo-zima": {
    title:"Ciepło zimą", kicker:"SŁOŃCE",
    description:"Ciepłe kierunki na 5–9 nocy. Najpierw pokazujemy propozycje, dopiero potem szersze wyszukiwanie.",
    searchHref:"/szukaj?duration=5-9&tab=Lot%20%2B%20hotel",
    match:(o)=>o.nights>=5&&warmPattern.test(`${o.city} ${o.country} ${(o.category||[]).join(" ")}`),
  },
  "all-inclusive": {
    title:"All Inclusive", kicker:"WYGODNIE",
    description:"Pakiety, w których wyżywienie jest częścią oferty i nie trzeba składać urlopu z wielu elementów.",
    searchHref:"/szukaj?duration=5-9&board=all%20inclusive&tab=All%20Inclusive",
    match:(o)=>/all inclusive/i.test(o.board||"") || (o.category||[]).includes("allinclusive"),
  },
  "dla-dwojga": {
    title:"Wyjazdy dla dwojga", kicker:"WE DWOJE",
    description:"Krótsze city breaki i spokojne wyjazdy, które dobrze działają jako wspólny reset.",
    searchHref:"/szukaj?duration=3-5&tab=City%20break",
    match:(o)=>o.nights>=2&&o.nights<=5&&((o.category||[]).includes("city")||(o.category||[]).includes("weekend")),
  },
  "z-dziecmi": {
    title:"Wakacje z dziećmi", kicker:"RODZINNIE",
    description:"Dłuższe pobyty i pakiety z wyżywieniem. Dokładne udogodnienia dla dzieci zawsze potwierdź w ofercie hotelu.",
    searchHref:"/szukaj?duration=7-10&tab=All%20Inclusive",
    match:(o)=>o.nights>=7&&(/all inclusive/i.test(o.board||"")||(o.category||[]).includes("plaza")),
  },
  "bez-paszportu": {
    title:"Wyjazdy bez paszportu", kicker:"PROŚCIEJ",
    description:"Kierunki w UE/Schengen, gdzie polski podróżny zwykle może podróżować z ważnym dowodem osobistym. Wymagania dokumentowe sprawdź przed zakupem.",
    searchHref:"/szukaj?destination=W%C5%82ochy%7CHiszpania%7CPortugalia%7CGrecja%7CCypr%7CMalta%7CCzechy%7CAustria%7CChorwacja&tab=Lot%20%2B%20hotel",
    match:(o)=>idCountries.has(o.country),
  },
  "egzotyka-do-5000": {
    title:"Egzotyka do 5 000 zł/os.", kicker:"DALEJ",
    description:"Dalekie kierunki z limitem ceny. Jeśli aktualna pula jest mała, otwórz pełne wyszukiwanie.",
    searchHref:"/szukaj?destination=Bangkok%7CBali%7CMalediwy%7CZanzibar%7CKenia&duration=7-14&budget=5000&tab=Lot%20%2B%20hotel",
    match:(o)=>o.price<=5000&&exoticPattern.test(`${o.city} ${o.country}`),
  },
  "cieplo-listopad": {
    title:"Ciepło w listopadzie", kicker:"LISTOPAD",
    description:"Gotowy punkt startu na jesienną ucieczkę do słońca.",
    searchHref:"/szukaj?month=2026-11&duration=5-9&tab=Lot%20%2B%20hotel",
    match:(o)=>warmPattern.test(`${o.city} ${o.country} ${(o.category||[]).join(" ")}`),
  },
  "cieplo-grudzien": {
    title:"Ciepło w grudniu", kicker:"GRUDZIEŃ",
    description:"Ciepłe kierunki na grudzień, od krótszych wypadów po tygodniowy urlop.",
    searchHref:"/szukaj?month=2026-12&duration=5-9&tab=Lot%20%2B%20hotel",
    match:(o)=>warmPattern.test(`${o.city} ${o.country} ${(o.category||[]).join(" ")}`),
  },
  "sylwester": {
    title:"Sylwester za granicą", kicker:"SEZON",
    description:"Gotowe kierunki na przełom roku. Jeśli chcesz szerszy wybór, przejdź do dedykowanej strony sylwestrowej.",
    searchHref:"/sylwester",
    match:(o)=>/grud|stycz|sylw/i.test(o.dates||""),
  },
};

export function generateStaticParams(){ return Object.keys(motifs).map(slug=>({slug})); }

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const motif=motifs[slug];
  if(!motif) return {};
  return {
    title: motif.title,
    description: motif.description,
    alternates:{canonical:`/motywy/${slug}`},
    openGraph:{title:`${motif.title} | Tripownia.pl`,description:motif.description,url:`/motywy/${slug}`,type:"website"},
  };
}

export default async function MotifPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const motif=motifs[slug];
  if(!motif) return notFound();

  const matched=homepageFallbackOffers
    .filter(o=>!isOfferExpired(o))
    .filter(o=>isTravelDestinationAllowed(o.city,o.country))
    .filter(motif.match)
    .sort((a,b)=>a.price-b.price)
    .slice(0,9);

  return <main className="motifs-page">
    <SiteHeader/>
    <section className="motifs-shell motif-detail-head">
      <div className="kicker">{motif.kicker}</div>
      <h1>{motif.title}</h1>
      <p>{motif.description}</p>
      <div className="motif-actions">
        <Link href={motif.searchHref}>{slug==="sylwester"?"Zobacz wyjazdy sylwestrowe":"Uruchom pełne wyszukiwanie"}</Link>
        <Link href="/motywy">Wszystkie motywy</Link>
      </div>
    </section>

    <section className="motifs-shell motif-offers">
      <div className="motif-offers-head">
        <div className="kicker">KONKRETNE PROPOZYCJE</div>
        <h2>{matched.length ? "Zacznij od tych ofert" : "Rozszerz wyszukiwanie"}</h2>
        <p>{matched.length ? "Najpierw pokazujemy pasujące propozycje z aktualnej puli Tripowni. Cena i dostępność są potwierdzane przed rezerwacją." : "W opublikowanej puli nie ma teraz wystarczająco dobrych dopasowań — uruchom pełne wyszukiwanie, żeby sprawdzić bieżące źródła."}</p>
      </div>
      {matched.length ? <div className="cards-grid">{matched.map(o=><OfferCard key={o.id} offer={o} sourceSurface={`motif_${slug}`}/>)}</div> : null}
    </section>

    <section className="motifs-shell motif-related">
      {Object.entries(motifs).filter(([key])=>key!==slug).slice(0,7).map(([key,value])=><Link href={`/motywy/${key}`} key={key}>{value.title}</Link>)}
    </section>
    <SiteFooter/>
  </main>
}
