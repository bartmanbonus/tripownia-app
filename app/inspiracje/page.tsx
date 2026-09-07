import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Flame, Heart, Map, Sparkles, Trophy } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Inspiracje podróżnicze | Tripownia.pl",
  description: "Pomysły na wyjazd według nastroju, sezonu i stylu podróżowania. Tripownia podpowiada, od czego zacząć.",
  alternates: { canonical: "/inspiracje" },
};

const moods = [
  { href:"/okazje", kicker:"DOBRA CENA", title:"Ciepło teraz", text:"Kierunki, które dziś mają sens cenowo i pogodowo.", image:"/images/destinations/teneryfa.jpg", icon:Flame, tone:"warm" },
  { href:"/podroze-po-przezycia", kicker:"EFEKT WOW", title:"Podróż po emocje", text:"Zorza, sakura, fiordy, safari i inne wyjazdy, które pamięta się latami.", image:"/images/destinations/reykjavik.jpg", icon:Heart, tone:"violet" },
  { href:"/dalekie-podroze", kicker:"DALEKO", title:"Egzotyka i inne kontynenty", text:"Azja, Afryka, Ameryki i wyspy — kiedy chcesz naprawdę zmienić otoczenie.", image:"/images/destinations/zanzibar.jpg", icon:Compass, tone:"ocean" },
  { href:"/wydarzenia", kicker:"EMOCJE NA ŻYWO", title:"Mecz + miasto", text:"Wybierz spotkanie, a Tripownia pomoże dołożyć lot i nocleg.", image:"/images/destinations/mediolan.jpg", icon:Trophy, tone:"blue" },
];

const quick = [
  { href:"/city-break", icon:"✦", title:"Mam tylko 3–4 dni", text:"Krótki city break bez brania tygodnia urlopu." },
  { href:"/jarmarki-bozonarodzeniowe", icon:"🎄", title:"Chcę poczuć sezon", text:"Jarmarki i miejsca, które mają sens właśnie teraz." },
  { href:"/sylwester", icon:"✨", title:"Chcę wyjechać na Sylwestra", text:"Od europejskich miast po ciepłe i egzotyczne kierunki." },
  { href:"/dalekie-podroze", icon:"🌴", title:"Chcę gdzieś naprawdę daleko", text:"Inspiracje spoza Europy, z różnych kontynentów." },
];

export default function InspirationsPage(){
  return <main>
    <SiteHeader/>
    <section className="inspo-premium-hero">
      <div className="shell inspo-premium-hero-inner">
        <div className="inspo-premium-copy">
          <span className="inspo-eyebrow"><Sparkles size={15}/> INSPIRACJE TRIPOWNI</span>
          <h1>Nie zaczynaj od kierunku.<br/>Zacznij od tego, <em>na co masz ochotę.</em></h1>
          <p>Podpowiadamy wyjazdy według nastroju, sezonu i czasu, który masz. Bez przekopywania setek przypadkowych propozycji.</p>
          <div className="inspo-hero-actions">
            <Link href="#wybierz-nastroj">Znajdź swój pomysł <ArrowRight size={17}/></Link>
            <Link href="/#wyszukiwarka">Wyszukaj konkretnie</Link>
          </div>
        </div>
        <div className="inspo-premium-orbit" aria-hidden="true">
          <div><span>🌴</span><b>Egzotyka</b></div>
          <div><span>⚽</span><b>Mecz + city break</b></div>
          <div><span>🌌</span><b>Przeżycia</b></div>
          <div><span>🔥</span><b>Okazje</b></div>
        </div>
      </div>
    </section>

    <section className="shell inspo-premium-section" id="wybierz-nastroj">
      <div className="inspo-section-head"><div><span>CO CIĘ DZIŚ CIĄGNIE?</span><h2>Wybierz klimat, resztę zawęzimy za Ciebie</h2></div><Map size={28}/></div>
      <div className="inspo-mood-grid">
        {moods.map((item)=>{const Icon=item.icon;return <Link className={`inspo-mood-card tone-${item.tone}`} href={item.href} key={item.title}>
          <img src={item.image} alt=""/>
          <div className="inspo-mood-overlay"/>
          <div className="inspo-mood-content"><span><Icon size={15}/>{item.kicker}</span><h3>{item.title}</h3><p>{item.text}</p><b>Odkryj propozycje <ArrowRight size={16}/></b></div>
        </Link>})}
      </div>
    </section>

    <section className="shell inspo-quick-section">
      <div className="inspo-section-head"><div><span>SZYBKI START</span><h2>Powiedz tylko, czego potrzebujesz</h2></div></div>
      <div className="inspo-quick-grid">
        {quick.map(item=><Link href={item.href} key={item.title}><i>{item.icon}</i><div><strong>{item.title}</strong><p>{item.text}</p></div><ArrowRight size={18}/></Link>)}
      </div>
    </section>

    <section className="shell inspo-premium-cta">
      <div><span>✦ TRIPOWNIA WYBIERA CODZIENNIE</span><h2>Wolisz, żebyśmy po prostu pokazali Ci, co dziś wygląda najlepiej?</h2><p>Przejdź do aktualnej selekcji z cenami i konkretnymi terminami.</p></div>
      <Link href="/okazje">Zobacz dzisiejsze okazje <ArrowRight size={18}/></Link>
    </section>
    <SiteFooter/>
  </main>
}
