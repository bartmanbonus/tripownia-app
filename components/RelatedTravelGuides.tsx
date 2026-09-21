import Link from "next/link";
import { findLegacy } from "@/lib/legacy";
import { canonicalPublicPath } from "@/lib/seoRouting";

const packing = "/jak-spakowac-sie-w-bagaz-podreczny-lista-rzeczy-na-wyjazd";
const airport = "/jak-wyglada-odprawa-na-lotnisku-przewodnik-dla-osob-lecacych-pierwszy-raz";
const liquids = "/lotniska-w-polsce-bez-limitu-100-ml-plynow";
const transfer = "/jak-dojechac-z-lotniska-do-centrum-miasta-najtansze-opcje-transportu";
const planning = "/jak-zaplanowac-podroz-krok-po-kroku-praktyczny-poradnik-dla-poczatkujacych";
const hotel = "/jak-znalezc-tani-hotel-8-sposobow-na-oszczednosc-przy-rezerwacji-noclegow";

// A small set of relevant editorial links; never recommend self-links or aliases.
export default function RelatedTravelGuides({ path, title, isDestination }: {
  path: string; title: string; isDestination: boolean;
}) {
  const topic = `${path} ${title}`.toLocaleLowerCase("pl");
  const candidates = isDestination ? [planning, transfer, hotel]
    : /bagaz|bagaż|plyn|płyn|odpraw|pokladow|pokładow|jedzenie-do-samolotu/.test(topic) ? [packing, airport, liquids]
    : /lotnisk|lot-|loty|lotow|lotów/.test(topic) ? [airport, transfer, packing]
    : [planning, hotel, packing];
  const articles = [...new Set(candidates.map(canonicalPublicPath))]
    .filter(href => href !== canonicalPublicPath(path))
    .map(href => ({ href, item: findLegacy(href) }))
    .filter(({ item }) => item?.type === "post");

  return <section className="legacy-internal-links" aria-label="Poradniki do planowania wyjazdu">
    <h2>{isDestination ? "Przygotuj podróż krok po kroku" : "Przeczytaj też przed wyjazdem"}</h2>
    <p>{isDestination
      ? "Po wyborze kierunku zaplanuj dojazdy, nocleg i czas na miejscu. Te poradniki pomogą uporządkować przygotowania."
      : "Połącz wskazówki z tego poradnika z kolejnymi etapami przygotowań do podróży."}</p>
    <div>{articles.map(({ href, item }) => <Link key={href} href={href}>{item!.title.replace(/\s*\|\s*Tripownia(?:\.pl)?$/i, "")} →</Link>)}</div>
    <p>Masz już pomysł na wyjazd? <Link href="/planer-podrozy">Zobacz, jak ułożyć plan podróży za darmo</Link> i zbierz swoje ustalenia w jednym miejscu.</p>
  </section>;
}
