# Tripownia — Facebook: komentarz → oferta → obserwacja (październik 2026)

Wewnętrzny plan pracy BOK/marketingu. **Nie publikować ani nie odpisywać automatycznie bez akceptacji właściciela strony.**

## Dlaczego akurat ten kierunek

Analiza komentarzy pod ofertami z 2–9 października pokazała powtarzające się pytania o wyloty z Warszawy (także Modlin), Krakowa/Balic i Katowic/Pyrzowic oraz o liczbę podróżujących (2 osoby, 2+1, 3 osoby, 4 osoby). Garda ma ponadprzeciętne zainteresowanie, ale historycznej ceny **nie wolno przedstawiać jako aktualnej**.

Wdrożona w gałęzi `feature/fb-follow-social-offers-20261009` nowa sekcja `/oferty-z-postow#lotniska` pokazuje sześć lotnisk oraz ścieżki do city breaków, All Inclusive i wyjazdów rodzinnych. Po zatwierdzeniu i wdrożeniu używaj tej strony jako punktu startu.

## Gotowe odpowiedzi na komentarze (dopasuj do pytania; nie automatyzuj masowo)

**„A z Warszawy?”**

> Tak! Tu znajdziesz aktualne opcje z Lotniska Chopina i Modlina: https://tripownia.pl/z-warszawy 💙 Który termin Cię interesuje?

**„A z Krakowa / Balic?”**

> Sprawdź propozycje z Krakowa-Balic: https://tripownia.pl/z-krakowa ✈️ Napisz, czy szukasz weekendu, czy dłuższego wyjazdu.

**„A z Katowic / Pyrzowic?”**

> Jasne, tu są wyjazdy z Katowic-Pyrzowic: https://tripownia.pl/z-katowic 💙 Jeśli podasz termin, łatwiej będzie zawęzić propozycje.

**„A z Gdańska, Wrocławia, Poznania?”**

> Mamy wyszukiwanie według lotniska: https://tripownia.pl/oferty-z-postow#lotniska — wybierz miasto wylotu i sprawdź opcje. ✈️

**„Oferta dla 2+1 / 2+2 / 4 osób?”**

> Przy wyjeździe rodzinnym ważna jest cena całego pokoju, bagażu i transferu. Zacznij tutaj: https://tripownia.pl/wakacje-z-dziecmi 💙 Z jakiego lotniska i w jakim terminie chcecie lecieć?

**„A Bari + Matera z noclegiem w Materze?”**

> Świetny pomysł na Apulię! To nie jest to samo co standardowy pakiet do Bari, więc musimy sprawdzić osobno hotel w Materze i dojazd. Dostępne propozycje regionu możesz zobaczyć tutaj: https://tripownia.pl/okazje?destination=Bari ✈️ Nie podajemy ceny, dopóki nie potwierdzimy konkretnego wariantu.

**„Ta cena nadal obowiązuje?”**

> Ceny i dostępność zmieniają się dynamicznie. Sprawdź szczegóły na stronie konkretnej propozycji w Tripowni; jeśli jest już nieaktualna, wybierz alternatywny termin. 💙

## Zasady konwersji i jakości

1. **Najpierw pomóż**, dopiero potem zachęcaj do obserwowania. Nie wklejaj tej samej odpowiedzi pod każdym komentarzem.
2. W pierwszym komentarzu pod postem używaj **jednego czystego adresu Tripownia.pl**, bez dopisków i partnera. W zwykłych odpowiedziach można dodać krótkie wyjaśnienie.
3. Bez obietnic ceny, statusu „dostępne” i konkretnego hotelu przed weryfikacją. Szczególnie dla starszych, wiralowych postów.
4. Nie organizuj sztucznych wymian polubień, botów, masowego tagowania, nie zamawiaj obserwujących.
5. Opcji Facebook **„Zaproś do obserwowania”** używaj tylko wobec osób, które faktycznie zareagowały i wobec których Meta udostępnia tę opcję; unikaj spamowania.
6. Nie zmieniaj zatwierdzonych szablonów graficznych i nie podawaj nazw sieci afiliacyjnych w marketingowym copy; prawnie wymagane informacje o relacjach partnerskich pozostają w serwisie.
7. Na stronach z ofertami głównym CTA pozostaje sprawdzenie ceny / rezerwacja. CTA do Facebooka jest drugorzędne.

## Pomiar po wdrożeniu

- Meta/Page: dzienny przyrost obserwujących (obserwujący, nie stare `page_likes`).
- Tripownia: `social_departure_choice` (lotnisko), `social_trip_type_choice` (kategoria), `facebook_follow_click` (placement), `share_offer` (placement i kanał), `social_referral` (skąd przyszła wizyta).
- Przekierowania do partnera: porównuj tylko rzeczywiste zdarzenia wyjścia z Tripowni — Facebook **post clicks** obejmują też kliknięcia zdjęcia i rozwijanie treści.
- GA4 działa po zgodzie analitycznej; jeśli dane GA4 wydają się zaniżone, sprawdź konfigurację i zgody przed interpretacją zasięgu.
- Pierwszy przegląd: 7 dni po wdrożeniu. Porównuj przyrost fanów na 1000 wyświetleń, udział kliknięć do strony oraz udział wejść prowadzących do oferty, nie tylko komentarze.


## Opcjonalne krótsze linki z pomiarem źródła (po wdrożeniu produkcyjnym)

Dla istniejącej, zweryfikowanej w katalogu Tripowni propozycji można przygotować własny link do pierwszego komentarza:

- Facebook: `https://tripownia.pl/l/fb/jezioro-garda-869`
- Instagram: `https://tripownia.pl/l/ig/jezioro-garda-869`
- TikTok: `https://tripownia.pl/l/tt/jezioro-garda-869`

**To nie są linki bezpośrednie do partnera.** Kod 307 kieruje użytkownika do `/o/jezioro-garda-869` na Tripowni i dodaje `utm_source`, `utm_medium=organic_social` oraz identyfikator oferty. Dopiero na własnej podstronie użytkownik widzi szczegóły i decyduje o rezerwacji.

Stare komentarze i istniejący proces Tiny.pl **pozostają bez zmian**. Nie korzystaj z tych nowych odnośników, dopóki `/l/fb/...` nie będzie wdrożone i zweryfikowane na produkcji. Jeśli oferta wygasła, link pokaże jej status i alternatywy – nie wolno kopiować starej ceny jako aktualnej.

Nowy link musi zawierać rzeczywisty slug oferty z `lib/socialOffers.ts`; nie zgaduj identyfikatorów. Nie ma możliwości dowolnego przekierowania na adres zewnętrzny.
