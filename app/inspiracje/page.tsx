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
  title: "Inspiracje podróżnicze",
  description: "Pomysły na wyjazd według nastroju, sezonu i stylu podróżowania. Tripownia podpowiada, od czego zacząć.",
  alternates: { canonical: "/inspiracje" },
};

const moods = [
  {
    href: "/sylwester",
    kicker: "SEZONOWO",
    title: "Sylwester bez kombinowania",
    text: "Gotowe miasta i kierunki na przełom roku — bez zaczynania od pustej wyszukiwarki.",
    image: "/images/destinations/praga.jpg",
    imageAlt: "Praga — inspiracja na zimowy city break i Sylwestra",
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
          <h1>Nie wiesz jeszcze dokąd?<br /><em>Wybierz tylko, czego potrzebujesz.</em></h1>
          <p>Weekend, ciepło, najniższa cena czy All Inclusive? Tripownia ustawi sensowny termin, długość i budżet, a Ty przejdziesz od razu do gotowych wyników.</p>
          <div className="inspo-hero-actions">
            <Link href="#gotowce">Dobierz mi wyjazd <ArrowRight size={17} /></Link>
            <Link href="/#wyszukiwarka">Mam konkretny kierunek</Link>
          </div>
        </div>
        <div className="inspo-premium-orbit" aria-hidden="true">
          <div><span>1</span><b>Wybierz potrzebę</b></div>
          <div><span>2</span><b>Wskaż lotnisko</b></div>
          <div><span>3</span><b>Dostajesz gotowce</b></div>
          <div><span>✓</span><b>Wybierasz ofertę</b></div>
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
      <div className="inspo-section-head"><div><span>MASZ KONKRETNY MOTYW WYJAZDU?</span><h2>Wybierz temat — nie pustą kategorię</h2></div><Map size={28} /></div>
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

    <section className="shell inspo-live-section">
      <div className="inspo-section-head">
        <div><span>ALBO OD RAZU KONKRET</span><h2>Najtańsze krótkie wyjazdy, które Tripownia widzi teraz</h2></div>
      </div>
      <p className="inspo-live-lead">Jeśli któryś Ci pasuje, nie musisz wracać do wyszukiwarki — kliknij ofertę i sprawdź szczegóły.</p>
      <LiveSalesRail mode="citybreak" limit={6} initialOffers={homepageFallbackOffers} />
    </section>

    <section className="shell inspo-premium-cta">
      <div><span>✦ MASZ JUŻ KONKRET</span><h2>Wiesz dokąd i kiedy? Przejdź od razu do pełnej wyszukiwarki.</h2><p>Ustawisz własny kierunek, termin, długość pobytu i lotnisko — bez przechodzenia przez inspiracje.</p></div>
      <Link href="/#wyszukiwarka">Wyszukaj po swojemu <ArrowRight size={18} /></Link>
    </section>
    <SiteFooter />
  </main>;
}
