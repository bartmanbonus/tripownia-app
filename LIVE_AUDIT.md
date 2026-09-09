# Audyt publikacji i ofert — 9 września 2026

## Status wdrożenia

Podany adres Vercel nie jest publicznie dostępny. Wejście na stronę przekierowuje
do logowania Vercel, więc użytkownik bez dostępu do projektu nie zobaczy portalu.
W ustawieniach projektu Vercel należy wyłączyć ochronę deploymentu dla Production
albo opublikować domenę `tripownia.pl` jako publiczną.

## Co można uznać za ofertę live

Oferta jest oznaczana jako bieżąca wyłącznie wtedy, gdy została zwrócona w tej
sesji przez `/api/today-offers`, ma dokładny deeplink partnera oraz znacznik czasu
`priceCheckedAt`. Statyczne rekordy są tylko inspiracjami i ich ceny nie są
potwierdzane na żywo.

Pełna kontrola feedów na produkcji wymaga:

- publicznie dostępnego deploymentu;
- ustawionych w Vercel zmiennych `TRADEDOUBLER_EXIM_TOKEN` i/lub
  `TRADEDOUBLER_TUI_TOKEN`;
- odpowiedzi HTTP 200 z `/api/today-offers?mode=search&broad=1` zawierającej
  `ok: true`, niepustą tablicę `offers` i aktualny `checkedAt`.

## Zmiany wykonane w kodzie

- statyczny fallback nie jest już nazywany „aktualnymi ofertami”;
- błąd HTTP lub `ok: false` z API przełącza interfejs na uczciwy komunikat o
  cenach orientacyjnych;
- karty z feedu pokazują czas sprawdzenia danych;
- karty statyczne informują, że cena nie została potwierdzona na żywo;
- zachowano poprzednią pulę zweryfikowaną w tej samej sesji, jeśli kolejne
  odświeżenie feedu chwilowo się nie powiedzie.

## Walidacja lokalna

- `npm run validate` — zaliczony;
- `npx tsc --noEmit` — zaliczony;
- pełny `next build` nie został dokończony w środowisku audytowym, ponieważ
  uruchomienie procesu próbowało wykonać zablokowane połączenie sieciowe.
