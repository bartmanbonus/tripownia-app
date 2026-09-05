import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import { partners } from "@/lib/partners";

export const metadata: Metadata = {
  title: "Podróże po przeżycia — konkretne wyjazdy na zorzę, sakurę i safari | Tripownia.pl",
  description: "Nie tylko inspiracje: konkretne miasta, terminy, loty i atrakcje na zorzę, sakurę, fiordy, safari, tulipany i inne wyjątkowe podróże.",
  alternates: { canonical: "/podroze-po-przezycia" },
};

type Idea={city:string;airport:string;dates:[string,string];label:string};
type Experience={id:string;icon:string;season:string;title:string;lead:string;ideas:Idea[]};
const experiences:Experience[]=[
 {id:"zorza",icon:"🌌",season:"wrzesień – marzec",title:"Zorza polarna — nie tylko Islandia",lead:"Dajemy kilka realnych baz, bo zorza nie kończy się na Reykjavíku.",ideas:[
  {city:"Reykjavík",airport:"KEF",dates:["2026-11-19","2026-11-23"],label:"Islandia · 4 noce"},
  {city:"Tromsø",airport:"TOS",dates:["2027-01-21","2027-01-25"],label:"Norwegia · 4 noce"},
  {city:"Rovaniemi",airport:"RVN",dates:["2027-02-04","2027-02-08"],label:"Laponia · 4 noce"},
 ]},
 {id:"sakura",icon:"🌸",season:"marzec – kwiecień",title:"Sakura w Japonii",lead:"Tokio jest startem, ale przy kwitnieniu warto porównać kilka regionów.",ideas:[
  {city:"Tokio",airport:"NRT",dates:["2027-03-27","2027-04-04"],label:"Tokio · 8 nocy"},
  {city:"Osaka",airport:"KIX",dates:["2027-03-31","2027-04-07"],label:"Osaka + Kioto · 7 nocy"},
  {city:"Fukuoka",airport:"FUK",dates:["2027-03-22","2027-03-29"],label:"Południe Japonii · 7 nocy"},
 ]},
 {id:"fiordy",icon:"🏔️",season:"maj – wrzesień",title:"Fiordy i długie dni",lead:"Rejsy, kolej i trekking można ułożyć z kilku różnych baz.",ideas:[
  {city:"Bergen",airport:"BGO",dates:["2027-06-10","2027-06-15"],label:"Bergen · 5 nocy"},
  {city:"Oslo",airport:"OSL",dates:["2027-06-17","2027-06-21"],label:"Oslo + kolej · 4 noce"},
  {city:"Ålesund",airport:"AES",dates:["2027-07-01","2027-07-06"],label:"Ålesund · 5 nocy"},
 ]},
 {id:"tulipany",icon:"🌷",season:"kwiecień – maj",title:"Tulipany w Holandii",lead:"Amsterdam to najłatwiejsza baza, ale nie jedyna opcja.",ideas:[
  {city:"Amsterdam",airport:"AMS",dates:["2027-04-15","2027-04-19"],label:"Amsterdam · 4 noce"},
  {city:"Eindhoven",airport:"EIN",dates:["2027-04-22","2027-04-26"],label:"Eindhoven · 4 noce"},
  {city:"Rotterdam",airport:"RTM",dates:["2027-04-29","2027-05-03"],label:"Rotterdam · 4 noce"},
 ]},
 {id:"safari",icon:"🦁",season:"czerwiec – październik",title:"Safari — Kenia i Tanzania",lead:"Zamiast jednego hotelu: konkretne bramy do parków i kilka wariantów podróży.",ideas:[
  {city:"Nairobi",airport:"NBO",dates:["2027-07-08","2027-07-17"],label:"Kenia · 9 nocy"},
  {city:"Kilimanjaro",airport:"JRO",dates:["2027-08-05","2027-08-14"],label:"Tanzania · 9 nocy"},
  {city:"Zanzibar",airport:"ZNZ",dates:["2027-09-09","2027-09-18"],label:"Safari + ocean · 9 nocy"},
 ]},
 {id:"azory",icon:"🐋",season:"wiosna – jesień",title:"Wieloryby i ocean",lead:"Atlantyk daje kilka mocnych kierunków do rejsów i natury.",ideas:[
  {city:"Ponta Delgada",airport:"PDL",dates:["2027-05-06","2027-05-12"],label:"Azory · 6 nocy"},
  {city:"Funchal",airport:"FNC",dates:["2027-05-13","2027-05-19"],label:"Madera · 6 nocy"},
  {city:"Reykjavík",airport:"KEF",dates:["2027-06-03","2027-06-08"],label:"Islandia · 5 nocy"},
 ]},
 {id:"jarmarki",icon:"🎄",season:"listopad – grudzień",title:"Jarmarki bożonarodzeniowe",lead:"Wiedeń, Praga, Berlin i Budapeszt — osobny kalendarz i gotowe weekendy.",ideas:[
  {city:"Wiedeń",airport:"VIE",dates:["2026-11-20","2026-11-23"],label:"Wiedeń · 3 noce"},
  {city:"Praga",airport:"PRG",dates:["2026-12-04","2026-12-07"],label:"Praga · 3 noce"},
  {city:"Berlin",airport:"BER",dates:["2026-11-27","2026-11-30"],label:"Berlin · 3 noce"},
 ]},
 {id:"egzotyka",icon:"🌴",season:"zima w Polsce",title:"Egzotyka w porze suchej",lead:"Kilka różnych klimatów zamiast jednego przypadkowego resortu.",ideas:[
  {city:"Zanzibar",airport:"ZNZ",dates:["2027-01-14","2027-01-23"],label:"Zanzibar · 9 nocy"},
  {city:"Malé",airport:"MLE",dates:["2027-02-04","2027-02-12"],label:"Malediwy · 8 nocy"},
  {city:"Phuket",airport:"HKT",dates:["2027-02-18","2027-02-28"],label:"Tajlandia · 10 nocy"},
 ]},
];
function flightUrl(i:Idea){const u=new URL("https://www.kiwi.com/deep");u.searchParams.set("from","WAW");u.searchParams.set("to",i.airport);u.searchParams.set("departure",i.dates[0]);u.searchParams.set("return",i.dates[1]);u.searchParams.set("currency","PLN");return partners.kiwi.buildUrl(u.toString())}
function attractionUrl(city:string){return partners.getyourguide.buildUrl(`https://www.getyourguide.pl/s/?q=${encodeURIComponent(city)}`)}
export default function ExperiencesPage(){return <main className="experience-expanded-page"><SiteHeader/><BreadcrumbSchema items={[{name:"Tripownia",url:"https://tripownia.pl/"},{name:"Podróże po przeżycia",url:"https://tripownia.pl/podroze-po-przezycia"}]}/>
<section className="experience-expanded-hero"><div className="shell"><div className="kicker">PODRÓŻE PO PRZEŻYCIA</div><h1>Najpierw wybierz przeżycie. Potem dostajesz kilka konkretnych miejsc.</h1><p>Zorza nie oznacza tylko Islandii. Safari nie oznacza jednego hotelu. Przy każdym pomyśle pokazujemy kilka baz i gotowe terminy do sprawdzenia.</p><div className="experience-season-nav"><a href="#zorza">🌌 Zorza</a><a href="#sakura">🌸 Sakura</a><a href="#fiordy">🏔️ Fiordy</a><Link href="/jarmarki-bozonarodzeniowe">🎄 Jarmarki 2026</Link><Link href="/sylwester">🥂 Sylwester</Link></div></div></section>
<section className="section shell"><div className="experience-expanded-grid">{experiences.map(item=><article className="experience-expanded-card" id={item.id} key={item.id}><div className="experience-expanded-card-top"><span>{item.icon}</span><div><small>{item.season}</small><h2>{item.title}</h2></div></div><p className="experience-expanded-lead">{item.lead}</p><div className="experience-ideas">{item.ideas.map(i=><div className="experience-idea" key={i.city}><strong>{i.city}</strong><small>{i.label}<br/>{i.dates[0]} → {i.dates[1]}</small><a href={flightUrl(i)} target="_blank" rel="sponsored noopener noreferrer">✈️ sprawdź lot</a><br/><a href={attractionUrl(i.city)} target="_blank" rel="sponsored noopener noreferrer">🎟️ atrakcje</a></div>)}</div>{item.id==="jarmarki"&&<div className="experience-expanded-actions"><Link href="/jarmarki-bozonarodzeniowe">Zobacz pełny kalendarz jarmarków →</Link></div>}</article>)}</div></section><SiteFooter/></main>}
