import type { Metadata } from "next";
import { travelShareMetadata } from "@/lib/sharePreview";
import SocialShare from "@/components/SocialShare";
import Link from "next/link";
import { CheckCircle2, MapPin, ShieldCheck } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SearchHub from "@/components/SearchHub";

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const p = await searchParams;
  const firstValue = (v: string | string[] | undefined) => Array.isArray(v) ? v[0] || "" : v || "";
  const destination = firstValue(p.destination || p.q) || "Noclegi";
  return travelShareMetadata({city:destination,kind:"hotel",dates:[firstValue(p.from),firstValue(p.to)].filter(Boolean).join(" – "),
    url:`/hotele?${new URLSearchParams(Object.entries(p).map(([k,v])=>[k,firstValue(v)])).toString()}`});
}

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function HotelsPage({ searchParams }: Props) {
  const params = await searchParams;
  const destination = first(params.q || params.destination).trim();
  const origin = first(params.origin).trim();
  const from = first(params.from).trim();
  const to = first(params.to).trim();
  const hotelAdults = Math.min(16, Math.max(1, Number(first(params.adults)) || 2));
  const hotelRooms = Math.min(8, Math.max(1, Number(first(params.rooms)) || 1));
  const ages = first(params.ages).split(",").filter(Boolean).map(Number).filter((age) => Number.isInteger(age) && age >= 0 && age <= 17).slice(0, 8);
  const hasRange = /^\d{4}-\d{2}-\d{2}$/.test(from) && /^\d{4}-\d{2}-\d{2}$/.test(to) && to > from;

  return (
    <main>
      <SiteHeader />
      <section className="shell service-page">
        <div className="kicker">HOTELE I NOCLEGI</div>
        <h1>Znajdź nocleg, który pasuje do Twojej podróży.</h1>
        <p className="hub-lead">
          Wybierz miejsce, daty pobytu, gości i pokoje. Najpierw ułożysz wyszukiwanie w Tripowni, a aktualne ceny sprawdzisz w systemie rezerwacyjnym.
        </p>

        <nav className="hotel-popular-destinations" aria-label="Popularne kierunki noclegów">
          <span>Popularne:</span>
          {["Rzym","Barcelona","Kraków","Praga","Londyn"].map((city) => (
            <Link key={city} href={`/hotele?destination=${encodeURIComponent(city)}`}>{city} →</Link>
          ))}
        </nav>
        <div className="service-signal-row" aria-label="Jak wybierać hotel">
          <div><MapPin size={19}/><strong>Lokalizacja</strong><span>Sprawdź odległość od miejsc, do których naprawdę będziesz jeździć.</span></div>
          <div><ShieldCheck size={19}/><strong>Warunki</strong><span>Porównaj anulację, śniadanie, podatki i finalną cenę.</span></div>
          <div><CheckCircle2 size={19}/><strong>Decyzja</strong><span>Rezerwuj dopiero po sprawdzeniu całego kosztu pobytu.</span></div>
        </div>

        <SocialShare url={`/hotele?${new URLSearchParams(Object.entries(params).map(([k,v])=>[k,first(v)])).toString()}`} title={`Hotele: ${destination || "szukaj noclegów"}`} text="Znajdź nocleg w Tripowni" />
        <div className="service-search-shell">
          <SearchHub embedded initialTab="Hotele" initialDestinations={destination ? [destination] : []} initialAirports={origin ? [origin] : []} initialDateMode="range" initialDateFrom={hasRange ? from : ""} initialDateTo={hasRange ? to : ""} initialHotelAdults={Math.max(hotelAdults, hotelRooms)} initialHotelRooms={hotelRooms} initialHotelChildAges={ages} />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
