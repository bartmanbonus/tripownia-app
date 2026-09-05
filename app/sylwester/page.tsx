import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TravelImage from "@/components/TravelImage";
import { partners } from "@/lib/partners";

export const metadata:Metadata={
  title:"Sylwester 2026/2027 — city break, dłuższy wyjazd i egzotyka | Tripownia.pl",
  description:"Pomysły na Sylwestra 2026/2027: krótkie city breaki, tygodniowe wyjazdy i egzotyczne kierunki.",
  alternates:{canonical:"/sylwester"}
};

type Idea={city:string;country:string;flag:string;airport:string;dates:[string,string];image?:string;type:"CITY BREAK"|"TYDZIEŃ"|"EGZOTYKA";why:string;see:string};
const ideas:Idea[]=[
 {city:"Budapeszt",country:"Węgry",flag:"🇭🇺",airport:"BUD",dates:["2026-12-30","2027-01-03"],image:"/images/destinations/budapeszt.jpg",type:"CITY BREAK",why:"Termy w dzień, Dunaj nocą i mocny klimat bez długiego lotu.",see:"Parlament · Baszta Rybacka · termy · rejs po Dunaju"},
 {city:"Rzym",country:"Włochy",flag:"🇮🇹",airport:"ROM",dates:["2026-12-29","2027-01-02"],image:"/images/destinations/rzym.jpg",type:"CITY BREAK",why:"Klasyk, który na przełomie roku daje więcej niż tylko jedną imprezową noc.",see:"Koloseum · Watykan · Trastevere · punkty widokowe"},
 {city:"Stambuł",country:"Turcja",flag:"🇹🇷",airport:"IST",dates:["2026-12-29","2027-01-03"],image:"/images/destinations/stambul.jpg",type:"CITY BREAK",why:"Bardziej nieoczywisty city break: Bosfor, hammam i intensywne miasto.",see:"Bosfor · Hagia Sophia · Grand Bazaar · Kadıköy"},
 {city:"Marrakesz",country:"Maroko",flag:"🇲🇦",airport:"RAK",dates:["2026-12-28","2027-01-03"],image:"/images/destinations/marrakesz.jpg",type:"TYDZIEŃ",why:"Kolor, riady i pustynny klimat — dobry kompromis między Europą a egzotyką.",see:"Medyna · Atlas · pustynia Agafay · ogrody"},
 {city:"Teneryfa",country:"Hiszpania",flag:"🇪🇸",airport:"TFS",dates:["2026-12-27","2027-01-04"],image:"/images/destinations/teneryfa.jpg",type:"TYDZIEŃ",why:"Słońce, ocean i tydzień bez presji intensywnego zwiedzania.",see:"Teide · Anaga · plaże · Los Gigantes"},
 {city:"Dubaj",country:"ZEA",flag:"🇦🇪",airport:"DXB",dates:["2026-12-27","2027-01-04"],image:"/images/destinations/dubaj.jpg",type:"TYDZIEŃ",why:"Ciepło i spektakularny Sylwester, ale z czasem także na plażę i pustynię.",see:"Downtown · Marina · pustynia · plaża · Creek"},
 {city:"Zanzibar",country:"Tanzania",flag:"🇹🇿",airport:"ZNZ",dates:["2026-12-26","2027-01-05"],type:"EGZOTYKA",why:"Sylwester boso na plaży i pełne wejście w tropikalny klimat.",see:"Stone Town · Nungwi · Kendwa · rejsy · przyprawy"},
 {city:"Bangkok",country:"Tajlandia",flag:"🇹🇭",airport:"BKK",dates:["2026-12-26","2027-01-07"],type:"EGZOTYKA",why:"Miasto na start, a potem można dołożyć wyspę i zrobić z tego pełną podróż.",see:"Bangkok · Ayutthaya · wyspa lub południe Tajlandii"},
 {city:"Malé",country:"Malediwy",flag:"🇲🇻",airport:"MLE",dates:["2026-12-27","2027-01-06"],type:"EGZOTYKA",why:"Drożej, ale jeśli budżet pozwala — to kierunek, który naprawdę czuje się jak wyjątkowy Sylwester.",see:"atol · snorkeling · sandbank · ocean"},
 {city:"Nowy Jork",country:"USA",flag:"🇺🇸",airport:"NYC",dates:["2026-12-27","2027-01-05"],type:"EGZOTYKA",why:"Ikoniczny Sylwester i kilka dni na miasto, które zimą ma bardzo filmowy klimat.",see:"Manhattan · Brooklyn · Central Park · skyline"},
 {city:"Meksyk",country:"Meksyk",flag:"🇲🇽",airport:"CUN",dates:["2026-12-26","2027-01-07"],type:"EGZOTYKA",why:"Dłuższy reset: plaża, cenoty i możliwość połączenia wybrzeża z historią Majów.",see:"Riviera Maya · cenoty · Tulum · Chichén Itzá"},
 {city:"Mauritius",country:"Mauritius",flag:"🇲🇺",airport:"MRU",dates:["2026-12-26","2027-01-07"],type:"EGZOTYKA",why:"Wyspa na dłuższy wyjazd, gdy chcesz zacząć rok od natury zamiast kolejnego miasta.",see:"Le Morne · Chamarel · laguny · trekking"},
];
function flightSearch(i:Idea){const u=new URL("https://www.kiwi.com/deep");u.searchParams.set("from","WAW");u.searchParams.set("to",i.airport);u.searchParams.set("departure",i.dates[0]);u.searchParams.set("return",i.dates[1]);u.searchParams.set("currency","PLN");return partners.kiwi.buildUrl(u.toString())}
function gyg(city:string){return partners.getyourguide.buildUrl(`https://www.getyourguide.pl/s/?q=${encodeURIComponent(city+' New Year')}`)}

export default function Page(){return <main><SiteHeader/>
  <section className="seasonal-hero shell"><div className="kicker">SYLWESTER 2026/2027</div><h1>Od 3 nocy w mieście po dwa tygodnie w tropikach.</h1><p>Nie ograniczamy Sylwestra do europejskiego city breaku. Im więcej czasu i budżetu, tym dalej warto celować.</p><div className="newyear-type-nav"><a href="#city-break">City break</a><a href="#tydzien">Dłuższy wyjazd</a><a href="#egzotyka">Egzotyka</a></div></section>
  {(["CITY BREAK","TYDZIEŃ","EGZOTYKA"] as const).map(type=><section className="section shell" id={type==="CITY BREAK"?"city-break":type==="TYDZIEŃ"?"tydzien":"egzotyka"} key={type}><div className="section-heading"><div><div className="kicker">{type}</div><h2>{type==="CITY BREAK"?"Krótko, intensywnie i bez tygodnia urlopu":type==="TYDZIEŃ"?"Więcej oddechu niż jeden weekend":"Sylwester, który naprawdę jest podróżą"}</h2></div></div><div className="seasonal-grid">{ideas.filter(i=>i.type===type).map(i=><article className="seasonal-card newyear-card" key={i.city}><div className="newyear-card-media"><TravelImage city={i.city} country={i.country} alt={`${i.city} na Sylwestra`} overrideSrc={i.image}/><span>{i.flag} {i.type}</span></div><div className="seasonal-card-body"><h2>{i.city}</h2><div className="seasonal-meta"><span>📅 {i.dates[0]} → {i.dates[1]}</span><span>✈️ start: Warszawa</span></div><p>{i.why}</p><p><b>Co połączyć:</b> {i.see}</p><div className="seasonal-actions"><a href={flightSearch(i)} target="_blank" rel="sponsored noopener noreferrer">Sprawdź wyjazd</a><a href={gyg(i.city)} target="_blank" rel="sponsored noopener noreferrer">Zobacz atrakcje</a></div></div></article>)}</div></section>)}
  <SiteFooter/></main>}
