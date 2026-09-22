import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import { offers } from "@/lib/offers";

const title = "Dane Tripowni – najtańsze kierunki i trendy podróżnicze";
const description = "Dane Tripowni: najtańsze kierunki, ceny wyjazdów, lotniska startowe i sezonowe obserwacje na podstawie aktualnej puli ofert Tripownia.pl.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/dane-tripowni" },
  openGraph: {
    type: "website",
    title: `${title} | Tripownia.pl`,
    description,
    url: "/dane-tripowni",
  },
};

export const revalidate = 3600;

function median(values: number[]) {
  if (!values.length) return null;
  const sorted=[...values].sort((a,b)=>a-b);
  const mid=Math.floor(sorted.length/2);
  return sorted.length%2 ? sorted[mid] : Math.round((sorted[mid-1]+sorted[mid])/2);
}

export default function TripowniaDataPage() {
  const active = offers.filter(o => o.availabilityStatus !== "expired" && Number(o.price) > 0);

  const byDestination = Object.values(active.reduce<Record<string,{city:string;country:string;flag:string;prices:number[];count:number}>>((acc,o)=>{
    const key=`${o.city}|${o.country}`;
    acc[key] ||= {city:o.city,country:o.country,flag:o.flag,prices:[],count:0};
    acc[key].prices.push(o.price);
    acc[key].count += 1;
    return acc;
  },{})).map(row=>({
    ...row,
    minPrice:Math.min(...row.prices),
    medianPrice:median(row.prices),
  })).sort((a,b)=>a.minPrice-b.minPrice).slice(0,10);

  const byAirport = Object.values(active.reduce<Record<string,{name:string;code:string;prices:number[];count:number}>>((acc,o)=>{
    const key=o.airportCode || o.departure;
    acc[key] ||= {name:o.departure,code:o.airportCode,prices:[],count:0};
    acc[key].prices.push(o.price);
    acc[key].count += 1;
    return acc;
  },{})).map(row=>({
    ...row,
    minPrice:Math.min(...row.prices),
    medianPrice:median(row.prices),
  })).sort((a,b)=>(a.medianPrice ?? 999999)-(b.medianPrice ?? 999999)).slice(0,8);

  const cheap = active.filter(o=>o.price<=1500).length;
  const warm = active.filter(o=>o.category.includes("cieplo")).length;
  const city = active.filter(o=>o.category.includes("city") || o.category.includes("weekend")).length;

  const checked = new Intl.DateTimeFormat("pl-PL",{
    timeZone:"Europe/Warsaw",
    day:"2-digit",month:"long",year:"numeric"
  }).format(new Date());

  const datasetSchema = {
    "@context":"https://schema.org",
    "@type":"Dataset",
    name:"Dane Tripowni – ceny i kierunki podróżnicze",
    description:"Zestawienie aktualnej puli ofert Tripownia.pl według kierunku i lotniska wylotu.",
    url:"https://tripownia.pl/dane-tripowni",
    creator:{ "@id":"https://tripownia.pl/#organization" },
    temporalCoverage: checked,
    keywords:["tanie wakacje","city break","ceny podróży","lotniska w Polsce","kierunki podróży"],
    isAccessibleForFree:true,
  };

  return <main>
    <SiteHeader/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(datasetSchema).replace(/</g,"\\u003c")}}/>
    <BreadcrumbSchema items={[
      {name:"Tripownia",url:"https://tripownia.pl/"},
      {name:"Dane Tripowni",url:"https://tripownia.pl/dane-tripowni"},
    ]}/>

    <article className="shell guides-hub">
      <header className="guides-hero">
        <div>
          <div className="kicker">DANE TRIPOWNI · {checked}</div>
          <h1>Co dziś widać w cenach i kierunkach podróży?</h1>
          <p>To publiczne zestawienie naszej aktualnej puli ofert. Pokazujemy najniższe ceny kierunków, porównujemy lotniska startowe i opisujemy, co rzeczywiście widać w danych — bez udawania pełnego obrazu całego rynku.</p>
        </div>
      </header>

      <section className="guides-section-grid">
        <section className="guides-section-card"><div className="kicker">PULA</div><h2>{active.length} aktywnych ofert</h2><p>Tyle pozycji bierze udział w bieżącym zestawieniu Tripowni.</p></section>
        <section className="guides-section-card"><div className="kicker">DO 1500 ZŁ</div><h2>{cheap} ofert</h2><p>Pozycje z ceną do 1500 zł za osobę w aktualnej puli.</p></section>
        <section className="guides-section-card"><div className="kicker">CIEPŁO</div><h2>{warm} ofert</h2><p>Oferty oznaczone jako kierunki ciepłe lub plażowe.</p></section>
        <section className="guides-section-card"><div className="kicker">CITY BREAK</div><h2>{city} ofert</h2><p>Krótkie miejskie wyjazdy i weekendy w bieżącej bazie.</p></section>
      </section>

      <section className="guides-checklist">
        <div>
          <div className="kicker">TOP 10 CENOWO</div>
          <h2>Najtańsze kierunki w aktualnej puli Tripowni</h2>
          <p>Sortujemy po najniższej dostępnej cenie w naszej bazie. To nie jest ranking całego rynku ani gwarancja utrzymania ceny.</p>
        </div>
        <ol>
          {byDestination.map((row,index)=><li key={`${row.city}-${row.country}`}>
            <strong>{index+1}</strong>
            <span>{row.flag} <b>{row.city}, {row.country}</b> — od {row.minPrice.toLocaleString("pl-PL")} zł{row.medianPrice ? ` · mediana ${row.medianPrice.toLocaleString("pl-PL")} zł` : ""}</span>
          </li>)}
        </ol>
      </section>

      <section className="guides-checklist">
        <div>
          <div className="kicker">LOTNISKA STARTOWE</div>
          <h2>Gdzie dziś widać najniższe mediany cen?</h2>
          <p>Porównujemy tylko lotniska obecne w aktualnej puli. Przy małej liczbie ofert wynik może szybko się zmienić.</p>
        </div>
        <ol>
          {byAirport.map((row,index)=><li key={row.code || row.name}>
            <strong>{index+1}</strong>
            <span><b>{row.name}</b>{row.code ? ` (${row.code})` : ""} — mediana {row.medianPrice?.toLocaleString("pl-PL")} zł · {row.count} {row.count===1?"oferta":"oferty"}</span>
          </li>)}
        </ol>
      </section>

      <section className="guides-section-grid">
        <section className="guides-section-card">
          <h2>Jak liczymy?</h2>
          <p>Bierzemy aktywne oferty widoczne w Tripowni, grupujemy je po kierunku i lotnisku startowym, a następnie liczymy najniższą cenę i medianę. Nie interpolujemy brakujących cen i nie traktujemy niepotwierdzonych pozycji jako danych rynkowych.</p>
        </section>
        <section className="guides-section-card">
          <h2>Jak cytować?</h2>
          <p>Możesz cytować zestawienie jako „Dane Tripowni, tripownia.pl/dane-tripowni, stan na {checked}”. Przy publikacji online prosimy o link do tej strony.</p>
          <Link href="/dla-mediow">Informacje dla mediów →</Link>
        </section>
        <section className="guides-section-card">
          <h2>Czego te dane nie mówią?</h2>
          <p>Nie pokazują całego rynku turystycznego, wszystkich biur podróży ani wszystkich terminów. To snapshot aktualnej puli Tripowni, który służy do obserwowania kierunków i różnic cenowych.</p>
        </section>
        <section className="guides-section-card">
          <h2>Chcesz zobaczyć konkret?</h2>
          <p>Radar Tripowni wybiera codziennie krótki zestaw ofert, a Okazje pokazują pełniejszą listę dostępnych propozycji.</p>
          <Link href="/radar-tripowni">Radar Tripowni →</Link>
        </section>
      </section>

      <nav className="guides-quick-links" aria-label="Powiązane strony">
        <Link href="/radar-tripowni">Radar Tripowni</Link>
        <Link href="/okazje">Okazje Tripowni</Link>
        <Link href="/podroze">Podróże</Link>
        <Link href="/dla-mediow">Dla mediów</Link>
        <Link href="/standardy-redakcyjne">Standardy redakcyjne</Link>
      </nav>
    </article>
    <SiteFooter/>
  </main>;
}
