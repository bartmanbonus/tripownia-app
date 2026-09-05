import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import { partners } from "@/lib/partners";

export const metadata: Metadata = {
  title: "Podróże po przeżycia — kiedy lecieć na zorzę, sakurę i safari | Tripownia.pl",
  description: "Kalendarz podróży po przeżycia: najlepsze okna na zorzę, sakurę, fiordy, safari, tulipany i egzotykę.",
  alternates: { canonical: "/podroze-po-przezycia" },
};

export const dynamic = "force-dynamic";

type Idea = { city:string; country:string; airport:string; sample:[string,string]; label:string };
type Experience = { id:string; icon:string; window:string; title:string; lead:string; ideas:Idea[] };

const experiences: Experience[] = [
  { id:"zorza", icon:"🌌", window:"15 września – 31 marca", title:"Zorza polarna", lead:"Największą szansę dają długie, ciemne noce. Zamiast jednej daty pokazujemy całe okno, w którym naprawdę warto polować na zorzę.", ideas:[
    {city:"Tromsø",country:"Norwegia",airport:"TOS",sample:["2027-01-21","2027-01-25"],label:"Norwegia · mocna baza na zorzę"},
    {city:"Reykjavík",country:"Islandia",airport:"KEF",sample:["2026-11-19","2026-11-23"],label:"Islandia · zorza + krajobrazy"},
    {city:"Rovaniemi",country:"Finlandia",airport:"RVN",sample:["2027-02-04","2027-02-08"],label:"Laponia · śnieg + zorza"},
  ]},
  { id:"sakura", icon:"🌸", window:"20 marca – 15 kwietnia", title:"Sakura w Japonii", lead:"Kwitnienie przesuwa się co roku i różni między regionami. Najbezpieczniej planować podróż w szerokim oknie i dopiero później dopinać konkretne miasta.", ideas:[
    {city:"Tokio",country:"Japonia",airport:"NRT",sample:["2027-03-27","2027-04-04"],label:"Tokio · klasyczny start"},
    {city:"Osaka",country:"Japonia",airport:"KIX",sample:["2027-03-31","2027-04-07"],label:"Osaka + Kioto"},
    {city:"Fukuoka",country:"Japonia",airport:"FUK",sample:["2027-03-22","2027-03-29"],label:"Południe Japonii · zwykle wcześniej"},
  ]},
  { id:"fiordy", icon:"🏔️", window:"15 maja – 15 września", title:"Fiordy i długie dni", lead:"To okres z najdłuższym dniem, lepszą dostępnością tras i największym wyborem rejsów oraz trekkingów.", ideas:[
    {city:"Bergen",country:"Norwegia",airport:"BGO",sample:["2027-06-10","2027-06-15"],label:"Bergen · fiordy zachodnie"},
    {city:"Ålesund",country:"Norwegia",airport:"AES",sample:["2027-07-01","2027-07-06"],label:"Ålesund · widoki i road trip"},
    {city:"Oslo",country:"Norwegia",airport:"OSL",sample:["2027-06-17","2027-06-21"],label:"Oslo + kolej widokowa"},
  ]},
  { id:"tulipany", icon:"🌷", window:"1 kwietnia – 10 maja", title:"Tulipany w Holandii", lead:"Najlepszy efekt jest zwykle od połowy kwietnia do początku maja, ale dokładny moment zależy od pogody.", ideas:[
    {city:"Amsterdam",country:"Holandia",airport:"AMS",sample:["2027-04-15","2027-04-19"],label:"Amsterdam + Keukenhof"},
    {city:"Rotterdam",country:"Holandia",airport:"RTM",sample:["2027-04-22","2027-04-26"],label:"Rotterdam + pola kwiatów"},
    {city:"Eindhoven",country:"Holandia",airport:"EIN",sample:["2027-04-29","2027-05-03"],label:"Tańsza baza na objazd"},
  ]},
  { id:"safari", icon:"🦁", window:"15 czerwca – 31 października", title:"Safari — Kenia i Tanzania", lead:"Pora sucha daje łatwiejsze obserwacje zwierząt i lepsze warunki na objazd parków. W środku tego okna można dopiero polować na konkretny termin.", ideas:[
    {city:"Nairobi",country:"Kenia",airport:"NBO",sample:["2027-07-08","2027-07-17"],label:"Kenia · Masai Mara"},
    {city:"Kilimanjaro",country:"Tanzania",airport:"JRO",sample:["2027-08-05","2027-08-14"],label:"Tanzania · Serengeti"},
    {city:"Zanzibar",country:"Tanzania",airport:"ZNZ",sample:["2027-09-09","2027-09-18"],label:"Safari + ocean"},
  ]},
  { id:"wieloryby", icon:"🐋", window:"kwiecień – październik", title:"Wieloryby i ocean", lead:"Sezon zależy od akwenu, dlatego pokazujemy kierunki, w których obserwacje mają sens przez dłuższe okno, a nie jeden przypadkowy weekend.", ideas:[
    {city:"Ponta Delgada",country:"Portugalia",airport:"PDL",sample:["2027-05-06","2027-05-12"],label:"Azory · mocny sezon wiosenny"},
    {city:"Funchal",country:"Portugalia",airport:"FNC",sample:["2027-05-13","2027-05-19"],label:"Madera · ocean i natura"},
    {city:"Reykjavík",country:"Islandia",airport:"KEF",sample:["2027-06-03","2027-06-08"],label:"Islandia · rejsy latem"},
  ]},
  { id:"egzotyka", icon:"🌴", window:"listopad – marzec", title:"Egzotyka w porze suchej", lead:"Gdy w Polsce jest zima, wybieramy miejsca z lepszym sezonem pogodowym — bez wciskania kierunku tylko dlatego, że jest tani.", ideas:[
    {city:"Zanzibar",country:"Tanzania",airport:"ZNZ",sample:["2027-01-14","2027-01-23"],label:"Zanzibar · ocean + ciepło"},
    {city:"Malé",country:"Malediwy",airport:"MLE",sample:["2027-02-04","2027-02-12"],label:"Malediwy · pora sucha"},
    {city:"Phuket",country:"Tajlandia",airport:"HKT",sample:["2027-02-18","2027-02-28"],label:"Tajlandia · Andamany"},
  ]},
];

function flightUrl(i: Idea) {
  const u = new URL("https://www.kiwi.com/deep");
  u.searchParams.set("from", "WAW");
  u.searchParams.set("to", i.airport);
  u.searchParams.set("departure", i.sample[0]);
  u.searchParams.set("return", i.sample[1]);
  u.searchParams.set("currency", "PLN");
  return partners.kiwi.buildUrl(u.toString());
}
function attractionUrl(city:string){return partners.getyourguide.buildUrl(`https://www.getyourguide.pl/s/?q=${encodeURIComponent(city)}`)}

export default function ExperiencesPage(){
  const showMarkets = Date.now() <= new Date("2027-01-07T22:59:59Z").getTime();
  return <main className="experience-expanded-page"><SiteHeader/><BreadcrumbSchema items={[{name:"Tripownia",url:"https://tripownia.pl/"},{name:"Podróże po przeżycia",url:"https://tripownia.pl/podroze-po-przezycia"}]}/>
    <section className="experience-expanded-hero"><div className="shell"><div className="kicker">PODRÓŻE PO PRZEŻYCIA</div><h1>Nie jedna data. Właściwy moment.</h1><p>Najpierw pokazujemy okres, w którym dane zjawisko ma największy sens. Dopiero potem wybierasz konkretny kierunek i termin.</p><div className="experience-season-nav"><a href="#zorza">🌌 Zorza</a><a href="#sakura">🌸 Sakura</a><a href="#fiordy">🏔️ Fiordy</a><a href="#safari">🦁 Safari</a>{showMarkets&&<Link href="/jarmarki-bozonarodzeniowe">🎄 Jarmarki</Link>}<Link href="/sylwester">🥂 Sylwester</Link></div></div></section>
    <section className="section shell"><div className="experience-expanded-grid">{experiences.map(item=><article className="experience-expanded-card" id={item.id} key={item.id}><div className="experience-expanded-card-top"><span>{item.icon}</span><div><small>REKOMENDOWANE OKNO</small><h2>{item.title}</h2><b className="experience-window">{item.window}</b></div></div><p className="experience-expanded-lead">{item.lead}</p><div className="experience-ideas">{item.ideas.map(i=><div className="experience-idea" key={i.city}><strong>{i.city}</strong><small>{i.label}</small><div className="experience-idea-actions"><a href={flightUrl(i)} target="_blank" rel="sponsored noopener noreferrer">Sprawdź wyjazd →</a><a href={attractionUrl(i.city)} target="_blank" rel="sponsored noopener noreferrer">Atrakcje</a></div></div>)}</div></article>)}</div></section>
    {showMarkets&&<section className="shell experience-market-callout"><div><small>SEZONOWO</small><strong>Jarmarki bożonarodzeniowe 2026</strong><span>Sekcja działa tylko w sezonie i znika automatycznie po zakończeniu jarmarków.</span></div><Link href="/jarmarki-bozonarodzeniowe">Zobacz terminy jarmarków →</Link></section>}
    <SiteFooter/></main>
}
