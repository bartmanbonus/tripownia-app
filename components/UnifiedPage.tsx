import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import LegacyPage from "@/components/LegacyPage";
import { legacyPosts, findLegacy } from "@/lib/legacy";
import { isInternalAlias } from "@/lib/internalAliases";
import { offers } from "@/lib/offers";
import { partners } from "@/lib/partners";
import PlanningInterest from "@/components/PlanningInterest";

type ServiceType = "parkingi" | "atrakcje" | "esim" | "ubezpieczenia" | "transfery" | "wynajem-auta";

function ServicePage({ type }: { type: ServiceType }) {
  const config = {
    parkingi: {
      kicker: "DODATEK DO PODRÓŻY", title: "Parkingi przy lotniskach",
      lead: "Wybierz parking dopiero po sprawdzeniu lotniska wylotu i szczegółów wyjazdu.",
      partner: partners.parklot,
      bullets: ["Sprawdź, z którego lotniska faktycznie lecisz.", "Porównaj dojazd, czas transferu i zasady anulacji.", "Na końcu przejdź do rezerwacji parkingu."],
    },
    atrakcje: {
      kicker: "DODATEK DO PODRÓŻY", title: "Atrakcje i bilety na miejscu",
      lead: "Najpierw wybierz kierunek i plan wyjazdu, potem dobierz wycieczki, bilety i atrakcje.",
      partner: partners.getyourguide,
      bullets: ["Sprawdź, ile masz realnie czasu na miejscu.", "Wybierz 1–2 najważniejsze atrakcje zamiast przeładowywać plan.", "Na końcu sprawdź dostępność i cenę u partnera."],
    },
    esim: {
      kicker: "DODATEK DO PODRÓŻY", title: "eSIM i internet w podróży",
      lead: "Internet na wyjeździe bez szukania przypadkowej karty SIM po przylocie.",
      partner: partners.fonia,
      bullets: ["Sprawdź, czy Twój telefon obsługuje eSIM.", "Dobierz pakiet danych do długości wyjazdu.", "Kup dopiero po potwierdzeniu kierunku i terminu."],
    },
    ubezpieczenia: {
      kicker: "PRZED WYJAZDEM", title: "Ubezpieczenie podróżne",
      lead: "Nie sprzedajemy jeszcze polisy na Tripowni. Najpierw pokazujemy, jaki zakres warto sprawdzić dla danego wyjazdu.",
      partner: null,
      bullets: ["Sprawdź koszty leczenia, ratownictwo i transport medyczny.", "Dopasuj ochronę do aktywności: sport, trekking, narty lub nurkowanie.", "Zweryfikuj wyłączenia odpowiedzialności i limity świadczeń przed zakupem."],
    },
    transfery: {
      kicker: "PO PRZYLOCIE", title: "Transfery lotniskowe",
      lead: "Porównujemy pakiety całościowo — transfer w cenie może być ważniejszy niż kilkadziesiąt złotych różnicy w cenie wyjazdu.",
      partner: null,
      bullets: ["Sprawdź, czy transfer jest zawarty w pakiecie organizatora.", "Jeśli nie — porównaj transport publiczny, taxi i transfer prywatny.", "Zwróć uwagę na godzinę przylotu i odległość hotelu od lotniska."],
    },
    "wynajem-auta": {
      kicker: "NA MIEJSCU", title: "Wynajem auta na wakacje",
      lead: "Najpierw ustal, czy samochód rzeczywiście będzie potrzebny dla Twojej trasy i miejsca noclegu.",
      partner: null,
      bullets: ["Sprawdź depozyt, udział własny i zakres ubezpieczenia.", "Zweryfikuj zasady paliwowe i limit kilometrów.", "Sprawdź wymagany wiek kierowcy i zasady odbioru po godzinach."],
    },
  }[type];

  return <main><SiteHeader/><section className="shell service-page"><div className="kicker">{config.kicker}</div><h1>{config.title}</h1><p className="hub-lead">{config.lead}</p><div className="service-panel"><div><h2>Co sprawdzić?</h2><ul>{config.bullets.map((b)=><li key={b}>{b}</li>)}</ul></div><div className="service-cta">{config.partner ? <><strong>{config.partner.name}</strong><p>Do partnera przejdziesz dopiero na końcu. Link jest afiliacyjny i może naliczyć Tripowni prowizję bez dodatkowego kosztu dla Ciebie.</p><a href={config.partner.buildUrl()} target="_blank" rel="sponsored noopener noreferrer">Przejdź do {config.partner.name} →</a></> : <><strong>Porównywarka w przygotowaniu</strong><p>Nie wysyłamy Cię na przypadkową stronę tylko po to, żeby mieć link. Gdy dodamy sprawdzonego partnera, pojawi się tu konkretna opcja.</p><Link href="/poradniki">Zobacz poradniki →</Link></>}</div></div></section><SiteFooter/></main>;
}

function PlanningPage() {
  const periods = [
    ["Sylwester 2026/27", "Miasta, słońce i dalsze kierunki na przełom roku."],
    ["Ferie 2027", "Wyjazdy rodzinne, narty i ciepłe kierunki w środku zimy."],
    ["Majówka 2027", "City breaki i krótkie wyjazdy z wykorzystaniem dni wolnych."],
    ["Lato 2027", "First minute, rodzinne wakacje i popularne kierunki plażowe."],
  ];
  return <main><SiteHeader/><section className="shell hub-page"><div className="kicker">PLANUJ WCZEŚNIEJ</div><h1>Nie każdy wyjazd jest na jutro</h1><p className="hub-lead">Tripownia ma pomagać również wtedy, gdy planujesz kilka miesięcy do przodu. Zamiast zgadywać, czy „teraz jest tanio”, pokazujemy aktualne opcje i obserwujemy rynek.</p><div className="plan-ahead-grid">{periods.map(([title,desc])=><Link className="plan-ahead-card" href="/#wyszukiwarka" key={title}><small>PLAN PODRÓŻY</small><strong>{title}</strong><span>{desc}</span><b>Sprawdź kierunki →</b></Link>)}</div><div className="service-panel" style={{marginTop:28}}><div><h2>Docelowo: alert ceny</h2><p>Użytkownik wybierze okres, lotnisko i budżet. System będzie mógł zapamiętać zainteresowanie i poinformować o dobrej ofercie albo spadku ceny.</p></div><div><h2>Bez fałszywych obietnic</h2><p>Nie zakładamy, że wcześniejsza rezerwacja zawsze oznacza najniższą cenę. Pokazujemy bieżące dane i warunki konkretnej oferty.</p></div></div><PlanningInterest/></section><SiteFooter/></main>;
}

function humanize(path: string) {
  return decodeURIComponent(path.split("/").filter(Boolean).pop() || "Podróże")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function AliasLandingPage({ path }: { path: string }) {
  const title = humanize(path);
  const q = decodeURIComponent(path).toLowerCase().replace(/[-/]/g," ");
  const related = offers.filter(o => q.includes(o.city.toLowerCase()) || q.includes(o.country.toLowerCase()) || o.category.some(c => q.includes(c))).slice(0,6);
  const shown = related.length ? related : offers.slice(0,6);
  return <main><SiteHeader/><section className="shell hub-page"><div className="kicker">TRIPOWNIA</div><h1>{title}</h1><p className="hub-lead">Ten stary odnośnik został zachowany po migracji strony. Zamiast błędu 404 pokazujemy aktualne propozycje i prowadzimy dalej po Tripowni.</p><div className="cards-grid">{shown.map(o=><OfferCard key={o.id} offer={o}/>)}</div><div style={{marginTop:30}}><Link className="primary-cta" href="/#wyszukiwarka">Ustaw własne filtry →</Link></div></section><SiteFooter/></main>;
}

export default function UnifiedPage({ path }: { path: string }) {
  if (path === "/okazje") return <main><SiteHeader/><section className="shell hub-page"><div className="kicker">AKTUALNE OKAZJE</div><h1>Podróże, które warto sprawdzić</h1><p className="hub-lead">Najpierw otwierasz ofertę na Tripowni, sprawdzasz ocenę i szczegóły, a dopiero potem przechodzisz do partnera.</p><div className="cards-grid">{offers.map(o=><OfferCard key={o.id} offer={o}/>)}</div></section><SiteFooter/></main>;

  if (path === "/poradniki") return <main><SiteHeader/><section className="shell hub-page"><div className="kicker">MAGAZYN TRIPOWNI</div><h1>Poradniki podróżnicze</h1><p className="hub-lead">Dotychczasowe artykuły Tripowni w jednym miejscu.</p><div className="article-grid">{legacyPosts.map(p=><Link key={p.path} href={p.path}><span>PORADNIK</span><strong>{p.title}</strong><p>{p.description}</p><b>Czytaj →</b></Link>)}</div></section><SiteFooter/></main>;

  if (path === "/parkingi") return <ServicePage type="parkingi"/>;
  if (path === "/atrakcje") return <ServicePage type="atrakcje"/>;
  if (path === "/esim") return <ServicePage type="esim"/>;
  if (path === "/ubezpieczenia") return <ServicePage type="ubezpieczenia"/>;
  if (path === "/transfery") return <ServicePage type="transfery"/>;
  if (path === "/wynajem-auta") return <ServicePage type="wynajem-auta"/>;
  if (path === "/planowanie-podrozy") return <PlanningPage/>;

  const item = findLegacy(path);
  if (item) return <LegacyPage item={item}/>;
  if (isInternalAlias(path)) return <AliasLandingPage path={path}/>;
  return null;
}
