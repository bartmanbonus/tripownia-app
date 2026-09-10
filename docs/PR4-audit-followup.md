# PR #4: poprawki po ponownym audycie

Zakres tej paczki: pięć usterek wykrytych po pierwszym zielonym buildzie. Nie jest to deklaracja zakończenia całego wcześniejszego zakresu Radar / Facebook / afiliacje.

## Zmiany

- `components/SearchHub.tsx`, `lib/catalogClient.ts`: wyszukiwarka odpytuje bezpośrednio `/api/catalog`; brak automatycznych zapytań rescue i statycznych ofert podstawianych jako dopasowania. Zmiana parametrów ukrywa wyniki poprzedniego zapytania, a poprzedni request jest anulowany. Zostają obecne klasy CSS, wybór wielu kierunków i lotnisk, karty oraz przejście do osobnej wyszukiwarki partnera.
- `app/api/catalog/route.ts`, `lib/searchRules.ts`: licznik `totalMatches` powstaje przed paginacją; UI pokazuje 20 kart na stronę i liczbę wszystkich dopasowań. Daty wylotu, aktualność oferty, polskie znaki oraz rozróżnienie WAW/WMI są sprawdzane. Etykieta „Rzym, Włochy” nie oznacza „Rzym LUB całe Włochy”.
- `app/api/today-offers/route.ts`, `lib/catalogExport.ts`, `scripts/refresh-core.ts`, `scripts/refresh-live-offers.mjs`: osobny, publiczny, tylko do odczytu eksport `mode=search&__direct=1`. Eksport stronicuje wszystkie pobrane rekordy PRZED limitem rekomendacji. Import przechodzi po stronach i kontroluje wersję zawartości. Awaria, zmiana danych między stronami albo niepełna odpowiedź nie zastępuje poprzedniej bazy. `__direct` NIE jest uwierzytelnieniem.
- Usunięte `lib/searchRules.mjs` i `lib/searchRules.d.ts`. Testy importują tę samą implementację `.ts` co API. Node 22 uruchamia je przez `--experimental-strip-types`; TypeScript zachowuje `strict: true`, nie wyłączono kontroli błędów.
- `.github/workflows/refresh-live-offers.yml`: poranny harmonogram nadal celuje w 08:10 Europe/Warsaw, ale dopuszcza opóźniony start runnera, zamiast sprawdzać dokładną minutę 08:10. Nie jest to obietnica punktualnej publikacji Radaru o 08:00. Harmonogram działa na `main`; ta gałąź nie uruchamia produkcyjnej synchronizacji.
- `middleware.ts`: zachowana ochrona `/admin` i `/api/admin`; kompatybilne wyszukiwanie `search` i `citybreak` kieruje do katalogu. DNS, WooCommerce i sekrety bez zmian.

## Zakres danych i świeżość

Katalog oznacza wszystkie rekordy zapisane przez istniejącą integrację, NIE cały asortyment dostawcy. Obecny adapter nadal odpytuje pierwszą stronę feedu (100 produktów) dla skonfigurowanych fraz. Ta paczka usuwa dodatkowe ucięcie na 200 wynikach na wyjściu, nie udaje kompletnego importu całego TradeDoublera. UI podaje datę odczytu i ostrzega o danych starszych niż 24 godziny. Nie obiecuje nowych ofert każdego dnia.

## Testy do odtworzenia

`npm test`: 24 testy logiki. Dane 691 ofert w teście eksportu są FIXTUREM, nie wynikiem bieżącego odczytu produkcji. Testy obejmują wyszukiwanie spoza Radaru, filtrowanie przed limitami, zero wyników bez poszerzania, paginację, normalizację, daty, idempotencję, wzrost ceny, awarie po pierwszej stronie i opóźniony harmonogram CET/CEST.

`npm run validate`: istniejący audyt znanych adresów legacy (nie zastępuje testów przeglądarkowych).

`npm run typecheck`, `npm run build`: pełna kontrola TypeScript i build Next.js.

`node --experimental-strip-types scripts/smoke-preview.mjs`: pięć grup kontroli HTTP na lokalnie uruchomionym buildzie. Sprawdza licznik i strony wyników, brak poszerzania, odrzucenie błędnych filtrów, niedostępność admina bez logowania oraz Atrakcje/GetYourGuide z zachowaniem identyfikatorów w pierwszym przekierowaniu. Nie sprawdza naliczania prowizji ani własności programu. Nie wykonuje publikacji na Facebooku.

Workflow `Validate preview changes` wykonuje powyższe kontrole bez sekretów i bez zapisu do produkcji. Wynik należy odczytać z konkretnego runu, nie wnioskować z obecności plików testowych.

## Nadal poza tą paczką

Trwała selekcja dokładnie trzech elementów Radaru na dzień i przygotowanie jej przed 08:00, pełny panel statusów źródeł, serwerowy proces akceptacji postów i publikacja Meta. Nadal wymagają osobnego dokończenia oraz testów. Sam zielony build nie oznacza, że te funkcje istnieją. Nie ma dedykowanego skryptu ESLint w dotychczasowej konfiguracji. Wizualne testy desktop/mobile i pełne łańcuchy zewnętrznych przekierowań należy potwierdzić osobno.
