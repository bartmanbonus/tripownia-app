# Tripownia v5 — migracja starej Tripowni do nowej aplikacji

Ta paczka zawiera pełny projekt. Zachowuje stare publiczne adresy z eksportu WordPressa i dodaje nową stronę główną, wyszukiwarkę, aktualne oferty oraz wewnętrzne działy.

## Co jest w środku
- 223 starych publicznych URL-i zaimportowanych z WordPressa (strony, posty i produkty)
- dynamiczna obsługa starych adresów przez `app/[...slug]/page.tsx`
- `app/oferta/[id]/page.tsx` — aktualne oferty najpierw otwierają się na Tripowni
- `app/okazje/page.tsx` — hub okazji
- `app/poradniki/page.tsx` — hub starych artykułów
- `app/parkingi`, `app/atrakcje`, `app/esim` — wewnętrzne landing pages przed wyjściem do partnera
- linki afiliacyjne pozostają w `lib/partners.ts`

## WAŻNE
Nie kasuj obecnego WordPressa ani nie przepinaj jeszcze domeny. Najpierw wdroż tę wersję na Vercel i sprawdź adres testowy.

## Jak wgrać na GitHub
Najbezpieczniej zastąpić zawartość repo zawartością tej paczki, zachowując strukturę folderów. Nie wrzucaj plików z podfolderów do głównego katalogu.
