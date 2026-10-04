import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Pomysły na wyjazd według budżetu i stylu",
  description: "Gotowe motywy podróży: tanie wyjazdy, city break, ciepło zimą, All Inclusive, wyjazdy z dziećmi, bez paszportu i egzotyka.",
  alternates: { canonical: "/motywy" },
};

const motifs = [
  ["do-1000-zl","BUDŻET","Wyjazdy do 1 000 zł","Najtańsze sensowne opcje bez przekopywania całego katalogu."],
  ["3-4-dni","KRÓTKO","3–4 dni bez długiego urlopu","City breaki i krótkie wypady z gotową długością pobytu."],
  ["cieplo-zima","SŁOŃCE","Ciepło zimą","Kierunki, w których można uciec od polskiej pogody."],
  ["all-inclusive","WYGODNIE","All Inclusive","Gotowe pakiety na odpoczynek bez składania wyjazdu od zera."],
  ["dla-dwojga","WE DWOJE","Wyjazdy dla dwojga","Krótki reset, city break i spokojniejszy urlop."],
  ["z-dziecmi","RODZINNIE","Wakacje z dziećmi","Dłuższe pobyty i wygodne pakiety rodzinne."],
  ["bez-paszportu","PROŚCIEJ","Bez paszportu","Kierunki, do których polski podróżny może zwykle lecieć z dowodem osobistym w ramach UE/Schengen — dokumenty zawsze sprawdź przed wyjazdem."],
  ["egzotyka-do-5000","DALEJ","Egzotyka do 5 000 zł","Dalekie kierunki z ograniczeniem budżetu."],
  ["do-1500-zl","BUDŻET","Wyjazdy do 1 500 zł","Więcej kierunków, nadal z konkretnym limitem ceny."],
  ["cieplo-listopad","LISTOPAD","Ciepło w listopadzie","Gotowe wyszukiwanie ciepłych kierunków na późną jesień."],
  ["cieplo-grudzien","GRUDZIEŃ","Ciepło w grudniu","Słońce i wyjazdy przed lub po świętach."],
  ["sylwester","SEZON","Sylwester za granicą","Gotowe kierunki na przełom roku."],
] as const;

export default function MotifsPage(){
  return <main className="motifs-page">
    <SiteHeader/>
    <section className="motifs-shell motifs-hero">
      <div className="kicker">GOTOWE MOTYWY TRIPOWNI</div>
      <h1>Nie musisz wiedzieć dokąd. Wystarczy, że wiesz czego chcesz.</h1>
      <p>Wybierz budżet, długość, pogodę albo styl wyjazdu. Tripownia od razu zawęża propozycje i prowadzi do konkretnych ofert.</p>
    </section>
    <section className="motifs-shell motifs-grid">
      {motifs.map(([slug,kicker,title,text]) => (
        <Link href={`/motywy/${slug}`} key={slug}>
          <small>{kicker}</small><strong>{title}</strong><span>{text}</span><em>Zobacz propozycje →</em>
        </Link>
      ))}
    </section>
    <SiteFooter/>
  </main>
}
