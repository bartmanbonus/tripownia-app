import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import { offers, isOfferExpired } from "@/lib/offers";
import { partners } from "@/lib/partners";

export const metadata: Metadata={title:"Last minute — EXIM Tours i okazje | Tripownia.pl",description:"Last minute z EXIM Tours: Egipt, Tunezja, Bułgaria i inne kierunki plus wybrane okazje Tripowni.",alternates:{canonical:"/last-minute"}};
export default function LastMinutePage(){
 const exim=offers.filter(o=>!isOfferExpired(o)&&o.partner==="exim");
 const eximLast=partners.exim.buildUrl("https://www.exim.pl/last-minute");
 return <main><SiteHeader/><section className="seasonal-hero shell"><div className="kicker">LAST MINUTE · EXIM TOURS</div><h1>Jeśli możesz lecieć szybko, sprawdź co zostało w najlepszej cenie.</h1><p>Tu priorytetem jest EXIM Tours i pakiety z wylotem, hotelem oraz transferem. Najpierw konkretne kierunki, potem pełna baza last minute.</p></section>
 <section className="section shell"><div className="lastminute-provider"><div><strong>EXIM Tours — pełne Last Minute</strong><p>Ceny i dostępność zmieniają się na żywo. Otwieramy sekcję partnera przez link afiliacyjny Tripowni.</p></div><a href={eximLast} target="_blank" rel="sponsored noopener noreferrer">Sprawdź EXIM Last Minute →</a></div>
 <div className="cards-grid">{exim.map(o=><OfferCard key={o.id} offer={o}/>)}</div></section><SiteFooter/></main>
}
