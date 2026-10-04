import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Compass, Flame, Heart, Map, Sparkles, Trophy } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import InspirationConcierge from "@/components/InspirationConcierge";
import LiveSalesRail from "@/components/LiveSalesRail";
import { homepageFallbackOffers } from "@/lib/offers";

export const metadata: Metadata = {
  title: "Inspiracje podróżnicze | Tripownia.pl",
  description: "Pomysły na wyjazd według nastroju, sezonu i stylu podróżowania. Tripownia podpowiada, od czego zacząć.",
  alternates: { canonical: "/inspiracje" },
};

const moods = [
  {
    href: "/szukaj?tab=City%20break&duration=3-4&budget=1200&weekend=1",
    kicker: "DOBRA CENA",
    title: "Ciepło teraz",
    text: "Krótki wyjazd do 1 200 zł/os. — parametry są już ustawione.",
    image: "/images/destinations/teneryfa.jpg",
    imageAlt: "Teneryfa — słoneczny kierunek na ciepły wyjazd",
    imagePosition: "center 48%",
    icon: Flame,
    tone: "warm",
  },
  {
    href: "/podroze-po-przezycia",
    kicker: "EFEKT WOW",
    title: "Podróż po emocje",
    text: "Zorza, safari, fiordy i inne gotowe inspiracje z konkretnym kolejnym krokiem.",
    image: "/images/experiences/islandia-zorza.png",
    imageAlt: "Zorza polarna na Islandii — podróż po wyjątkowe przeżycia",
    imagePosition: "center 46%",
    icon: Heart,
    tone: "violet",
  },
  {
    href: "/szukaj?destination=Bangkok%7CBali%7CMalediwy%7CZanzibar&duration=7-14&budget=5500&tab=Lot%20%2B%20hotel",
    kicker: "DALEKO",
    title: "Egzotyka bez szukania od zera",
    text: "Kilka dalekich kierunków sprawdzanych naraz, z budżetem i długością pobytu.",
    image: "/images/experiences/egzotyka.png",
    imageAlt: "Egzotyczna plaża — inspiracja na daleką podróż",
    imagePosition: "center 54%",
    icon: Compass,
    tone: "ocean",
  },
  {
    href: "/wydarzenia",
    kicker: "EMOCJE NA ŻYWO",
    title: "Mecz + cały wyjazd",
    text: "Wybierasz mecz, a Tripownia ustawia termin pobytu, lot i nocleg.",
    image: "/images/destinations/mediolan.jpg",
    imageAlt: "Mediolan — pomysł na city break połączony z wydarzeniem sportowym",
    imagePosition: "center 42%",
    icon: Trophy,
    tone: "blue",
  },
];

const quick = [
  { href: "/szukaj?tab=City%20break&duration=3-4&budget=1200&weekend=1", icon: "✦", title: "Mam tylko 3–4 dni", text: "Gotowe: weekend, 3–4 noce, do 1 200 zł/os." },
  { href: "/szukaj?destination=Praga%7CWiede%C5%84%7CBerlin&duration=2-3&budget=1200&tab=City%20break", icon: "🎄", title: "Chcę poczuć sezon", text: "Praga, Wiedeń i Berlin — 2–3 noce, wyniki od razu." },
  { href: "/sylwester", icon: "✨", title: "Chcę wyjechać na Sylwestra", text: "Gotowe kierunki i terminy na przełom roku." },
  { href: "/szukaj?destination=Bangkok%7CBali%7CMalediwy%7CZanzibar&duration=7-14&budget=5500&tab=Lot%20%2B%20hotel", icon: "🌴", title: "Chcę gdzieś naprawdę daleko", text: "4 kierunki, 7–14 nocy, budżet do 5 500 zł/os." },
];

function monthKey(offset: number) {
  const now = new Date();
  const value = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));
  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(value: string) {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("pl-PL", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(year, month - 1, 1)));
}

export default function InspirationsPage() {
  const nextMonth = monthKey(1);
  const followingMonth = monthKey(2);

  return <main>
    <SiteHeader />
    <section className="inspo-premium-hero">
      <div className="shell inspo-premium-hero-inner">
        <div className="inspo-premium-copy">
          <span className="inspo-eyebrow"><Sparkles size={15} /> INSPIRACJE TRIPOWNI</span>
          <h1>Powiedz tylko, <em>jak chcesz odpocząć.</em><br />Resztę ustawimy za Ciebie.</h1>
          <p>Nie każemy Ci wymyślać kierunku, terminu i filtrów od zera. Wybierz klimat i lotnisko — Tripownia ustawi sensowny budżet, długość pobytu i pokaże gotowe wyniki.</p>
          <div className="inspo-hero-actions">
            <Link href="#gotowce">Pokaż gotowe warianty <ArrowRight size={17} /></Link>
            <Link href="/#wyszukiwarka">Wiem dokładnie, czego chcę</Link>
          </div>
        </div>
        <div className="inspo-premium-orbit" aria-hidden="true">
          <div><span>1</span><b>Wybierz klimat</b></div>
          <div><span>2</span><b>Wskaż lotnisko</b></div>
          <div><span>3</span><b>Zobacz gotowe wyniki</b></div>
          <div><span>✓</span><b>Kliknij ofertę</b></div>
        </div>
      </div>
    </section>

    <InspirationConcierge
      nextMonth={nextMonth}
      nextMonthLabel={monthLabel(nextMonth)}
      followingMonth={followingMonth}
      followingMonthLabel={monthLabel(followingMonth)}
    />

    <section className="shell inspo-premium-section" id="wybierz-nastroj">
      <div className="inspo-section-head"><div><span>JESZCZE 4 PROSTE ŚCIEŻKI</span><h2>Wybierz pomysł — nie pustą kategorię</h2></div><Map size={28} /></div>
      <div className="inspo-mood-grid">
        {moods.map((item) => {
          const Icon = item.icon;
          return <Link className={`inspo-mood-card tone-${item.tone}`} href={item.href} key={item.title}>
            <Image
              src={item.image}
              alt={item.imageAlt}
              fill
              sizes="(max-width: 760px) 100vw, 50vw"
              loading="lazy"
              style={{ objectFit: "cover", objectPosition: item.imagePosition }}
            />
            <div className="inspo-mood-overlay" />
            <div className="inspo-mood-content"><span><Icon size={15} />{item.kicker}</span><h3>{item.title}</h3><p>{item.text}</p><b>Przejdź dalej <ArrowRight size={16} /></b></div>
          </Link>;
        })}
      </div>
    </section>

    <section className="shell inspo-quick-section">
      <div className="inspo-section-head"><div><span>SZYBKI START</span><h2>Powiedz tylko, czego potrzebujesz</h2></div></div>
      <div className="inspo-quick-grid">
        {quick.map(item => <Link href={item.href} key={item.title}><i>{item.icon}</i><div><strong>{item.title}</strong><p>{item.text}</p></div><ArrowRight size={18} /></Link>)}
      </div>
    </section>

    <section className="shell inspo-live-section">
      <div className="inspo-section-head">
        <div><span>MOŻESZ TEŻ NIC NIE USTAWIAĆ</span><h2>Najtańsze krótkie wyjazdy, które Tripownia widzi teraz</h2></div>
      </div>
      <p className="inspo-live-lead">Jeśli któryś Ci pasuje, nie musisz wracać do wyszukiwarki — kliknij ofertę i sprawdź szczegóły.</p>
      <LiveSalesRail mode="citybreak" limit={6} initialOffers={homepageFallbackOffers} />
    </section>

    <section className="shell inspo-premium-cta">
      <div><span>✦ ZERO FORMULARZY</span><h2>Nie chcesz już nic ustawiać? Pokażemy Ci najtańsze dostępne opcje.</h2><p>Lista jest sortowana od najniższej ceny, a parametry oferty widzisz przed kliknięciem.</p></div>
      <Link href="/szukaj?tab=City%20break&duration=3-5&budget=1500">Pokaż mi najlepsze <ArrowRight size={18} /></Link>
    </section>
    <SiteFooter />
  </main>;
}
