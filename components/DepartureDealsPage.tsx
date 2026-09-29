import Link from "next/link";
import { ArrowRight, Bell, MapPin, Plane, Sparkles } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import LiveDepartureDeals from "@/components/LiveDepartureDeals";
import styles from "./DepartureDealsPage.module.css";

type Props = { city: string; airportCodes: string[]; intro: string; cityBreakHref?: string };

export default function DepartureDealsPage({ city, airportCodes, intro, cityBreakHref }: Props) {
  return <main className={styles.page}>
    <SiteHeader />
    <section className={styles.hero}><div className={styles.shell}>
      <span className={styles.kicker}><MapPin size={15}/> OKAZJE Z LOTNISKA</span>
      <h1>Wyjazdy z {city}</h1><p>{intro}</p>
      <div className={styles.actions}><a href="#oferty"><Plane size={18}/> Zobacz aktualne oferty</a>{cityBreakHref && <Link href={cityBreakHref}>City break z {city} →</Link>}<Link href="/alerty"><Bell size={18}/> Ustaw alert z {city}</Link></div>
    </div></section>
    <section className={styles.section} id="oferty"><div className={styles.shell}>
      <div className={styles.heading}><div><span className={styles.kicker}>AKTUALNA PULA</span><h2>Dokąd warto polecieć z {city}?</h2><p>Pokazujemy różne kierunki zamiast kilku wariantów tego samego miejsca. Cena i dostępność są sprawdzane przy aktualizacji feedu.</p></div><Link href="/okazje">Wszystkie okazje <ArrowRight size={16}/></Link></div>
      <LiveDepartureDeals airportCodes={airportCodes}/>
    </div></section>
    <section className={styles.ctaSection}><div className={styles.shell}><div className={styles.cta}>
      <Sparkles size={30}/><div><span className={styles.kicker}>ZNALEŹLIŚMY WYJAZD — CO DALEJ?</span><h2>Dodaj go do Tripowni i ułóż całą podróż.</h2><p>Lot, hotel, transfer, atrakcje, eSIM, checklista i plan dnia w jednym miejscu.</p></div><Link href="/dodaj-podroz">Stwórz plan za 0 zł <ArrowRight size={17}/></Link>
    </div></div></section>
    <SiteFooter />
  </main>;
}
