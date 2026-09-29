import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bell, Sparkles } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import LiveDepartureDeals from "@/components/LiveDepartureDeals";

export const metadata: Metadata={title:"Weekend bez urlopu — krótkie wyjazdy z Polski | Tripownia.pl",description:"Pomysły na 2–4 noce z polskich lotnisk. Krótkie city breaki i weekendowe wyjazdy bez oddawania całego tygodnia urlopu.",alternates:{canonical:"/weekend-bez-urlopu"}};

export default function Page(){return <main><SiteHeader/>
<section className="section shell"><div className="kicker">WEEKEND BEZ URLOPU ⚡</div><h1 style={{fontSize:"clamp(42px,5vw,68px)",letterSpacing:"-.05em",margin:"14px 0"}}>Wylot. Reset.<br/><span style={{color:"#f47721"}}>I wracasz do swojego tygodnia.</span></h1><p style={{maxWidth:760,fontSize:18,lineHeight:1.6,color:"#61708d"}}>Tripownia zbiera krótkie wyjazdy na 2–4 noce. Priorytetem jest sensowny czas na miejscu, a nie tylko najniższa cena.</p><div className="premium-action-row" style={{marginTop:24}}><a className="premium-action-main" href="#weekendy">Zobacz weekendy <ArrowRight size={17}/></a><Link className="premium-action-secondary" href="/alerty"><Bell size={18}/> Ustaw alert</Link></div></section>
<section className="section shell" id="weekendy"><div className="section-heading"><div><div className="kicker">AKTUALNE KRÓTKIE WYJAZDY</div><h2>2–4 noce, różne kierunki.</h2><p>Jeśli nie ma teraz potwierdzonej oferty, nie zastępujemy jej starą ceną.</p></div></div><LiveDepartureDeals weekendOnly limit={24}/></section>
<section className="section shell dream-free-plan"><div className="dream-free-plan-copy"><div className="kicker">ZNALEŹLIŚMY WEEKEND</div><h2>Teraz <span>ułóż go do końca.</span></h2><p>Dodaj lot lub pakiet, dobierz hotel, transfer, atrakcje i plan dnia.</p><div className="dream-free-plan-actions"><Link href="/dodaj-podroz"><Sparkles size={18}/> Dodaj podróż</Link></div></div></section>
<SiteFooter/></main>}