import Link from "next/link";
import { ArrowRight, Bell, MapPin, Plane, Sparkles } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import LiveDepartureDeals from "@/components/LiveDepartureDeals";
import FacebookFollowCTA from "@/components/FacebookFollowCTA";
import SocialShare from "@/components/SocialShare";
import styles from "./DepartureDealsPage.module.css";

type Props = {
  city: string;
  airportCodes: string[];
  intro: string;
  cityBreakHref?: string;
  holidaysHref?: string;
  lastMinuteHref?: string;
  allInclusiveHref?: string;
};

export default function DepartureDealsPage({
  city,
  airportCodes,
  intro,
  cityBreakHref,
  holidaysHref,
  lastMinuteHref,
  allInclusiveHref,
}: Props) {
  const intentCards = [
    cityBreakHref ? { href: cityBreakHref, icon: "🏙️", title: `City break z ${city}`, text: "2–5 dni · lot + hotel" } : null,
    holidaysHref ? { href: holidaysHref, icon: "☀️", title: `Wakacje z ${city}`, text: "Pakiety i ciepłe kierunki" } : null,
    lastMinuteHref ? { href: lastMinuteHref, icon: "⚡", title: `Last Minute z ${city}`, text: "Najbliższe terminy" } : null,
    allInclusiveHref ? { href: allInclusiveHref, icon: "🌴", title: `All Inclusive z ${city}`, text: "Lot + hotel + wyżywienie" } : null,
  ].filter(Boolean) as Array<{ href: string; icon: string; title: string; text: string }>;

  const sharePath = ({
    WAW: "/z-warszawy",
    KRK: "/z-krakowa",
    KTW: "/z-katowic",
    GDN: "/z-gdanska",
    WRO: "/z-wroclawia",
    POZ: "/z-poznania",
  } as const)[airportCodes[0] as "WAW" | "KRK" | "KTW" | "GDN" | "WRO" | "POZ"] || "/oferty-z-postow#lotniska";

  return <main className={styles.page}>
    <SiteHeader />
    <section className={styles.hero}><div className={styles.shell}>
      <span className={styles.kicker}><MapPin size={15}/> OKAZJE Z LOTNISKA</span>
      <h1>Wakacje i wyjazdy z {city}</h1><p>{intro}</p>
      <div className={styles.actions}><a href="#oferty"><Plane size={18}/> Zobacz aktualne oferty</a><Link href="/alerty"><Bell size={18}/> Ustaw alert z {city}</Link></div>
      <div className={styles.intentGrid} aria-label={`Typy wyjazdów z ${city}`}>
        {intentCards.map((item) => (
          <Link href={item.href} key={item.href} className={styles.intentCard}>
            <span className={styles.intentIcon} aria-hidden="true">{item.icon}</span>
            <span><strong>{item.title}</strong><small>{item.text}</small></span>
            <ArrowRight size={17}/>
          </Link>
        ))}
      </div>
      <div className={styles.proofStrip}>
        <div><small>WYLOT</small><strong>{airportCodes.join(" + ")}</strong></div>
        <div><small>PORÓWNANIE</small><strong>Różne kierunki i typy wyjazdów</strong></div>
        <div><small>REZERWACJA</small><strong>Sprawdzasz finalną cenę i warunki wyjazdu</strong></div>
      </div>
    </div></section>
    <section className={styles.section} id="oferty"><div className={styles.shell}>
      <div className={styles.heading}><div><span className={styles.kicker}>AKTUALNA PULA</span><h2>Najpierw konkretne oferty z {city}</h2><p>Pokazujemy różne kierunki zamiast kilku wariantów tego samego miejsca. Wybierasz ofertę i przechodzisz dalej do szczegółów rezerwacji.</p></div><Link href="/okazje">Wszystkie okazje <ArrowRight size={16}/></Link></div>
      <LiveDepartureDeals airportCodes={airportCodes}/>
      <section aria-label={`Poleć wyjazdy z ${city}`} style={{ marginTop: 24 }}>
        <SocialShare
          url={sharePath}
          title={`Wyjazdy z ${city} — Tripownia.pl`}
          text={`Zobacz wyjazdy z ${city}: city break, wakacje i All Inclusive. Terminy oraz ceny sprawdzisz na Tripowni.`}
          placement={`airport_hub_${airportCodes[0].toLowerCase()}`}
          label="POLEĆ ZNAJOMYM"
          shareLead="WYJAZDY Z TWOJEGO LOTNISKA"
          buttonLabel={`Wyślij okazje z ${city}`}
          heading={`Kto jeszcze szuka wylotów z ${city}?`}
          description="Udostępnij znajomym aktualną listę opcji z tego lotniska. Każdy sam sprawdzi dostępność i cenę przed rezerwacją."
        />
      </section>
      <FacebookFollowCTA placement={`departure_hub_after_offers_${airportCodes.join("_")}`} compact />
    </div></section>
    <section className={styles.ctaSection}><div className={styles.shell}><div className={styles.cta}>
      <Sparkles size={30}/><div><span className={styles.kicker}>NIE ODKŁADAJ DOBREJ OFERTY</span><h2>Sprawdź szczegóły, a potem ułóż całą podróż w Tripowni.</h2><p>Ceny i dostępność mogą się zmieniać. Najpierw wybierz wyjazd, później dodaj lot, hotel, transfer, atrakcje i checklistę do planu.</p></div><div className={styles.ctaActions}><a href="#oferty">Wróć do ofert <ArrowRight size={17}/></a><Link href="/dodaj-podroz">Plan za 0 zł</Link></div>
    </div></div></section>
    <SiteFooter />
  </main>;
}
