"use client";

import Link from "next/link";
import { FileCheck2, HeartPulse, ShieldCheck, Smartphone, BusFront, PlugZap, ExternalLink } from "lucide-react";

export default function BeforeYouGo({ city, country, transferIncluded }: { city:string; country:string; transferIncluded?:boolean }) {
  const officialTravel = "https://www.gov.pl/web/dyplomacja/informacje-dla-podrozujacych";
  const health = "https://www.gov.pl/web/gis/szczepienia-dla-podrozujacych";
  return <section className="before-you-go">
    <div className="before-head">
      <div><div className="kicker">ZANIM KUPISZ / ZANIM POLECISZ</div><h2>{city}: co trzeba sprawdzić przed wyjazdem?</h2>
      <p>Tripownia nie zgaduje wymagań wjazdowych ani zdrowotnych. Te informacje potrafią się zmienić, dlatego prowadzimy do oficjalnych źródeł i pokazujemy checklistę dla konkretnej podróży.</p></div>
    </div>
    <div className="before-grid">
      <article><FileCheck2/><strong>Dokumenty i wjazd</strong><span>Paszport/dowód, ewentualna wiza, ważność dokumentu i zasady wjazdu dla {country}.</span><a href={officialTravel} target="_blank" rel="noopener noreferrer">Sprawdź oficjalnie <ExternalLink size={14}/></a></article>
      <article><HeartPulse/><strong>Zdrowie i szczepienia</strong><span>Sprawdź aktualne zalecenia zdrowotne odpowiednio wcześnie przed podróżą.</span><a href={health} target="_blank" rel="noopener noreferrer">Sprawdź zalecenia <ExternalLink size={14}/></a></article>
      <article><ShieldCheck/><strong>Ubezpieczenie</strong><span>Koszty leczenia, ratownictwo, transport, aktywności i wyłączenia odpowiedzialności.</span><Link href="/ubezpieczenia">Co sprawdzić →</Link></article>
      <article><BusFront/><strong>Transfer z lotniska</strong><span>{transferIncluded ? "W tej selekcji transfer jest oznaczony jako element pakietu — potwierdź to jeszcze w warunkach partnera." : "Transfer nie jest potwierdzony w danych Tripowni. Sprawdź go przed zakupem."}</span><Link href="/transfery">Zaplanuj dojazd →</Link></article>
      <article><Smartphone/><strong>Internet / eSIM</strong><span>Sprawdź roaming, obsługę eSIM i ilość danych potrzebną na wyjazd.</span><Link href="/esim">Sprawdź eSIM →</Link></article>
      <article><PlugZap/><strong>Na miejscu</strong><span>Waluta, płatności, gniazdka, lokalny transport i podstawowe zasady — rozwijamy poradnik kierunku.</span><Link href="/poradniki">Poradniki →</Link></article>
    </div>
    <div className="source-note">Informacje formalne i zdrowotne zawsze weryfikuj przed podróżą w oficjalnych źródłach. Tripownia jest przewodnikiem organizacyjnym, nie urzędem ani placówką medyczną.</div>
  </section>;
}
