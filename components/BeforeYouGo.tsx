"use client";

import Link from "next/link";
import {
  FileCheck2,
  HeartPulse,
  ShieldCheck,
  Smartphone,
  BusFront,
  PlugZap,
  ExternalLink,
} from "lucide-react";

type BeforeYouGoProps = {
  city: string;
  country: string;
  transferIncluded?: boolean;
};

export default function BeforeYouGo({
  city,
  country,
  transferIncluded,
}: BeforeYouGoProps) {
  const officialTravel =
    "https://www.gov.pl/web/dyplomacja/informacje-dla-podrozujacych";

  const health =
    "https://www.gov.pl/web/gis/szczepienia-dla-podrozujacych";

  return (
    <section className="before-you-go">
      <div className="before-head">
        <div>
          <div className="kicker">ZANIM KUPISZ / ZANIM POLECISZ</div>

          <h2>
            {city}: co trzeba sprawdzić przed wyjazdem?
          </h2>

          <p>
            Tripownia nie zgaduje wymagań wjazdowych ani zdrowotnych.
            Te informacje mogą się zmieniać, dlatego przy formalnościach
            kierujemy do oficjalnych źródeł i pokazujemy praktyczną
            checklistę dla konkretnej podróży.
          </p>
        </div>
      </div>

      <div className="before-grid">
        <article>
          <FileCheck2 />

          <strong>Dokumenty i wjazd</strong>

          <span>
            Sprawdź wymagany dokument, jego ważność oraz aktualne zasady
            wjazdu do kraju: {country}.
          </span>

          <a
            href={officialTravel}
            target="_blank"
            rel="noopener noreferrer"
          >
            Sprawdź oficjalne informacje
            <ExternalLink size={14} />
          </a>
        </article>

        <article>
          <HeartPulse />

          <strong>Zdrowie i szczepienia</strong>

          <span>
            Przed podróżą sprawdź aktualne zalecenia zdrowotne
            i informacje dotyczące szczepień.
          </span>

          <a
            href={health}
            target="_blank"
            rel="noopener noreferrer"
          >
            Sprawdź zalecenia
            <ExternalLink size={14} />
          </a>
        </article>

        <article>
          <ShieldCheck />

          <strong>Ubezpieczenie</strong>

          <span>
            Sprawdź koszty leczenia, ratownictwo, transport medyczny,
            zakres ochrony oraz wyłączenia odpowiedzialności.
          </span>

          <Link href="/ubezpieczenia">
            Co sprawdzić →
          </Link>
        </article>

        <article>
          <BusFront />

          <strong>Transfer z lotniska</strong>

          <span>
            {transferIncluded
              ? "W tej selekcji transfer jest oznaczony jako element pakietu. Przed zakupem potwierdź jego warunki u partnera."
              : "Transfer nie jest potwierdzony w danych Tripowni. Przed zakupem sprawdź sposób dojazdu z lotniska."}
          </span>

          <Link href="/transfery">
            Zaplanuj dojazd →
          </Link>
        </article>

        <article>
          <Smartphone />

          <strong>Internet / eSIM</strong>

          <span>
            Sprawdź roaming, obsługę eSIM w swoim telefonie oraz pakiet
            internetu odpowiedni do długości podróży.
          </span>

          <Link href="/esim">
            Sprawdź eSIM →
          </Link>
        </article>

        <article>
          <PlugZap />

          <strong>Na miejscu</strong>

          <span>
            Waluta, płatności, gniazdka, transport lokalny i praktyczne
            informacje dotyczące pobytu.
          </span>

          <Link href="/poradniki">
            Zobacz poradniki →
          </Link>
        </article>
      </div>

      <div className="source-note">
        Informacje formalne i zdrowotne zawsze zweryfikuj przed podróżą
        w aktualnych oficjalnych źródłach. Tripownia pełni funkcję
        przewodnika organizacyjnego.
      </div>
    </section>
  );
}
