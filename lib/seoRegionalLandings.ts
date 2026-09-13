import type { SeoLanding } from "@/lib/seoLandings";

export const seoRegionalLandings: SeoLanding[] = [
  {
    slug: "wakacje-z-olsztyna-mazur",
    title: "Wyloty z Olsztyna-Mazur — wakacje, city break i last minute",
    eyebrow: "WYLOTY Z OLSZTYNA-MAZUR",
    lead: "Aktualne wakacje, city breaki i last minute z lotniska Olsztyn-Mazury (SZY).",
    query: "Wakacje",
    departure: "Olsztyn-Mazury",
    departureCode: "SZY",
    categoryKeywords: ["wakacje", "city", "plaza", "cieplo", "allinclusive"],
    minNights: 2,
    paragraphs: [
      "Siatka połączeń z Olsztyna-Mazur jest mniejsza niż z największych polskich lotnisk, dlatego warto zaczynać od konkretnego terminu i sprawdzać realną dostępność zamiast zakładać, że każdy kierunek będzie możliwy.",
      "Tripownia pokazuje tylko wyniki zgodne z wybranym lotniskiem. Jeśli z SZY nie ma teraz pasującej oferty, nie podstawiamy w zamian przypadkowego wylotu z Warszawy czy Gdańska."
    ],
  },
  {
    slug: "last-minute-z-olsztyna-mazur",
    title: "Last Minute z Olsztyna-Mazur — aktualne wyloty z SZY",
    eyebrow: "LAST MINUTE Z OLSZTYNA-MAZUR",
    lead: "Sprawdź aktualne last minute z lotniska Olsztyn-Mazury i porównaj dostępne wakacyjne kierunki.",
    query: "Last Minute",
    departure: "Olsztyn-Mazury",
    departureCode: "SZY",
    categoryKeywords: ["wakacje", "plaza", "cieplo", "allinclusive"],
    minNights: 5,
    paragraphs: [
      "Przy last minute z regionalnego lotniska najważniejsza jest bieżąca dostępność. Zamiast filtrować po jednym kraju, lepiej najpierw zobaczyć wszystkie realne wyjazdy z SZY dla najbliższego terminu.",
      "Porównuj pełny pakiet: bagaż, transfer, wyżywienie i godziny lotów. Przy małej liczbie rotacji dobry rozkład bywa ważniejszy niż niewielka różnica ceny."
    ],
  },
  {
    slug: "city-break-z-olsztyna-mazur",
    title: "City break z Olsztyna-Mazur — krótki wyjazd z SZY",
    eyebrow: "CITY BREAK Z OLSZTYNA-MAZUR",
    lead: "Pomysły na 2–5 dni i aktualne krótkie wyjazdy z lotniska Olsztyn-Mazury.",
    query: "City break",
    departure: "Olsztyn-Mazury",
    departureCode: "SZY",
    categoryKeywords: ["city", "weekend", "tanio"],
    maxNights: 5,
    paragraphs: [
      "Przy city breaku z SZY rozkład ma większe znaczenie niż liczba dostępnych kierunków. Dobra para lotów potrafi dać pełne 2–3 dni bez dokładania urlopu.",
      "Jeżeli w wybranym terminie nie ma sensownego połączenia, Tripownia pokaże brak lokalnego dopasowania zamiast mieszać wyniki z innymi lotniskami."
    ],
  },
];
