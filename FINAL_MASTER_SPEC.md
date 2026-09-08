# TRIPOWNIA.PL — FINAL MASTER SPEC / ONE-SHOT WDROŻENIE

## Cel
Wypuścić jedną docelową wersję Tripowni łączącą dwa tryby: selekcję najlepszych okazji oraz pełne samodzielne wyszukiwanie. Bez kolejnych etapów i bez przypadkowych modułów.

## Zasady bezwzględne
1. Każdy link wychodzący do partnera musi przechodzić przez istniejący system afiliacyjny (`lib/partners.ts`). Zero Google Flights.
2. eSky nie może pojawiać się w rekomendacjach/ofertach Tripowni. Loty: Kiwi. Hotele: Booking. Pakiety: EXIM / Wakacje.pl / TUI zgodnie z dostępnymi feedami i deeplinkami.
3. Strona główna po wejściu ma od razu mieć do 20 realnych ofert. Jedna oferta na jeden turystyczny kierunek. Zawsze najtańsza poprawna oferta z danego kierunku.
4. Publikacja dzienna przełącza się o 08:00 Europe/Warsaw. Nowa pula musi być zbudowana przed podmianą starej. Jeśli feed/API zawiedzie, użytkownik widzi ostatnią poprawną pulę, a nie pusty stan.
5. CTA prowadzi do konkretnej oferty/deeplinku, nie do losowej strony głównej partnera.
6. Zero ręcznie wpisanych cen w tytułach/opisach. Cena ma pochodzić z jednego pola danych.
7. Wszystkie komponenty muszą działać przy zoom 80/90/100/110/125/150% i breakpointach desktop/tablet/mobile bez poziomego scrolla.

## Strona główna — finalna kolejność
1. Niski, podróżniczy HERO z jednym zdjęciem (bez autoplay video), hasłem i dwoma CTA: „Pokaż mi okazje” / „Wyszukaj samodzielnie”.
2. SearchHub — samodzielne wyszukiwanie.
3. „20 najlepszych znalezionych dziś”.
4. Tripownia Picks / rekomendacje redakcyjne.
5. City Break.
6. Last Minute / słońce / All Inclusive.
7. Budżet + „Zaskocz mnie”.
8. Dalekie podróże / przeżycia / wydarzenia.
9. Dodatki podróżnicze afiliacyjne.
10. SEO/inspiracje + footer.

## Silnik dziennych ofert
- pobierz szeroką pulę z EXIM/TUI;
- odrzuć: wygasłe, brak ceny, brak afiliacyjnego URL, niedozwolony kierunek, niepełne dane;
- grupuj po turystycznym kierunku (np. Durrës/Golem = Riwiera Albańska; Sliema/Valletta = Malta; Costa Adeje/Puerto de la Cruz = Teneryfa);
- w grupie zostaw najtańszą ofertę;
- ranking: cena + jakość + preferowane lotniska WAW/WMI/KRK + konkretne terminy + wyżywienie;
- wybierz do 20 różnych kierunków;
- seed dzienny zmienia układ po 08:00, ale nigdy nie może promować droższego duplikatu kierunku;
- waliduj nową pulę; publikuj dopiero po sukcesie;
- fallback = ostatnia dobra pula.

## Wyszukiwanie
Użytkownik ma móc wybrać: Lot + hotel / Wakacje / City Break / Loty / Hotele. Filtry: skąd, dokąd lub gdziekolwiek, długość, budżet, wyżywienie, weekend, elastyczne daty. Wyniki: maks. 20 różnych kierunków, najtańsze poprawne dopasowanie na kierunek.

## Konwersja
- Tripownia Pick: wyjaśnienie „dlaczego warto”.
- Ulubione i ostatnio oglądane w localStorage.
- „Zaskocz mnie” zawsze zwraca realną aktualną ofertę mieszczącą się w budżecie.
- Nie stosować fałszywych liczników oglądających ani sztucznego scarcity.

## Afiliacja i tracking
Centralny resolver w `lib/partners.ts`. Każdy outbound ma `rel="sponsored noopener noreferrer"`. Zachować deeplink i parametry oferty. Rejestrować provider, offer id, destination, placement i timestamp w analytics/click tracking.

## Responsive / CSS
Nie dokładać kolejnych jednorazowych hacków. Ujednolicić kontenery, gridy, karty, CTA i typografię. Docelowo usunąć duplikujące się późne override'y w `app/globals.css`; końcowy arkusz ma mieć jeden kanoniczny zestaw reguł dla każdego komponentu.

## QA przed deployem
- 20 ofert po wejściu, jeśli feed ma wystarczającą pulę;
- 1 kierunek = 1 karta;
- aktualizacja po 08:00;
- awaria feedu nie czyści strony;
- następny dzień generuje nową pulę;
- brak broken images;
- ceny i daty zgodne z feedem;
- CTA do konkretnej oferty;
- wszystkie linki afiliacyjne;
- zero Google Flights;
- zero eSky w rekomendacjach;
- Kiwi / Booking / EXIM / Wakacje / TUI działają zgodnie z rolą;
- mobile 360/390/430, tablet 768/1024, desktop 1280/1440/1920;
- zoom 80–150%;
- brak horizontal overflow;
- 404, sitemap, robots, canonical, metadata;
- `npm run build` i `npm run validate` bez błędów.
