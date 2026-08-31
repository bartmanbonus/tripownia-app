# Tripownia.pl — portal sprzedażowo-afiliacyjny

Aktualny etap: **Priority 0 — stabilizacja istniejącego produktu**.

## Co zostało uporządkowane

- jeden routing dla stron systemowych i legacy, bez równoległych `app/okazje`, `app/parkingi`, `app/atrakcje`, `app/esim`, `app/poradniki`,
- poprawione generowanie parametrów eSky (konkretne lotnisko, kierunek, długość pobytu, 2 osoby; dokładne daty tam, gdzie są znane),
- naprawione błędne lotniska w istniejących linkach eSky,
- EXIM ma osobny `destinationUrl` i link trackingowy; cztery istniejące oferty EXIM prowadzą do właściwych stron kierunku zamiast homepage,
- CTA rozróżnia link do konkretnej oferty od linku do wyszukiwania/kierunku,
- ceny statyczne są opisane jako zapisane selekcje, a nie jako cena live,
- model `Offer` ma przygotowane pola `pricePrevious`, `priceCheckedAt`, `availabilityStatus`, `destinationUrl`,
- dodano `.gitignore`, aby artefakty builda (`*.tsbuildinfo`, `.next`, `node_modules`) nie wracały do repo,
- dodano `npm run validate` do podstawowej kontroli routingu i linków ofert.

## Kolejność dalszych prac

1. **Priority 1** — wspólny model Offer + provider adapters + baza danych + aktualizacja cen/statusu.
2. **Priority 2** — Tripownia Deal Engine i Tripownia Score.
3. **Priority 3** — CMS + SEO landingi + zarządzanie ofertami/kierunkami.
4. **Priority 4** — automatyzacja content/social/newsletter/alerty.
5. **Priority 5** — revenue analytics, personalizacja i cross-sell.

## Walidacja

```bash
npm run validate
npm run build
```

`npm run validate` działa bez połączenia z zewnętrznymi providerami. `npm run build` wymaga zainstalowanych zależności.
