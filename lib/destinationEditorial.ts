import { eximDestinations, type EximDestination } from "@/lib/eximDestinations";

type EditorialCopy = {
  hook: string;
  season: string;
  places: string;
  itinerary: string;
  stay: string;
  tip: string;
  related: string[];
};

export type DestinationArticle = EditorialCopy & {
  name: string;
  query: string;
  slug: string;
  href: string;
};

/**
 * Editorial copy for EVERY country exposed in the Kierunki navigation.
 * No machine-generated placeholders, fictional prices or asserted live availability.
 * Seasons refer to typical climate patterns, never guaranteed conditions.
 */
const editorial: Record<string, EditorialCopy> = {
  "Albania": {
    hook: "Riwiera Albańska to połączenie kameralnych plaż, górskich widoków i coraz lepszej bazy noclegowej.",
    season: "Na plażowanie najczęściej wybiera się czerwiec–wrzesień. Maj i październik bywają przyjemne na objazd, ale temperatura morza i dostępność usług są wtedy mniej pewne.",
    places: "Ksamil i Saranda sprawdzą się na południu; Durrës jest bliżej Tirany, a Gjirokastra i Berat to ciekawy dodatek do wypoczynku.",
    itinerary: "Na 7 dni wybierz jedną część wybrzeża. Przy 10–12 dniach połącz Riwierę, miasteczka w głębi kraju i krótkie przejazdy widokowe.",
    stay: "W Sarandzie łatwiej o restauracje i wycieczki, w Ksamilu o plaże; sprawdź dojazd do hotelu i dostęp do parkingu.",
    tip: "Porównaj lot do Tirany z dojazdem do kurortu. Pozornie tani bilet może oznaczać długi transfer.",
    related: ["Czarnogóra","Grecja","Chorwacja"]
  },
  "Aruba": {
    hook: "Aruba łączy jasne plaże, suchy krajobraz i niewielkie odległości na karaibskiej wyspie.",
    season: "Wyspa jest ciepła przez cały rok, ale wiatr i okresowe opady zmieniają komfort plażowania. Zimą popyt jest zwykle większy, dlatego porównuj kilka terminów.",
    places: "Eagle Beach i Palm Beach to plażowe klasyki; Oranjestad pozwala poznać miasto, a Arikok pokazuje surowszą stronę wyspy.",
    itinerary: "Na 7–9 dni zaplanuj kilka plaż i przynajmniej dzień na północne wybrzeże oraz park narodowy.",
    stay: "Palm Beach jest wygodna, jeśli zależy Ci na restauracjach; Eagle Beach wybierz pod spokojniejszy pobyt.",
    tip: "Sprawdź połączenia z przesiadką, limit bagażu i czas transferu. Lot na Arubę bywa większą częścią budżetu niż nocleg.",
    related: ["Curaçao","Dominikana","Jamajka"]
  },
  "Austria": {
    hook: "Austria nadaje się zarówno na weekend w Wiedniu, jak i aktywny urlop w Alpach.",
    season: "Wiedeń jest dobry niemal cały rok, narciarstwo wymaga zimowych warunków w konkretnym regionie, a trekking zwykle najlepiej planować od późnej wiosny do wczesnej jesieni.",
    places: "Wiedeń i Salzburg przyciągają kulturą; Tyrol i okolice Innsbrucka to baza na góry, jeziora i sporty zimowe.",
    itinerary: "Na 2–4 dni skup się na Wiedniu. Na 6–8 dni połącz miasto z regionem alpejskim, licząc czas przejazdów.",
    stay: "W Wiedniu sprawdzaj dojazd metrem; w Alpach odległość od kolei, szlaków lub wyciągów ma duże znaczenie.",
    tip: "Porównaj loty z pociągiem z Polski. Przy jarmarkach i feriach rezerwuj nocleg z większym wyprzedzeniem.",
    related: ["Szwajcaria","Czechy","Niemcy"]
  },
  "Bahrajn": {
    hook: "Bahrajn to niewielki kraj nad Zatoką Perską, dobry na połączenie miejskich atrakcji i odpoczynku.",
    season: "Od późnej jesieni do wczesnej wiosny temperatury zwykle bardziej sprzyjają spacerom. Lato potrafi być bardzo gorące.",
    places: "Manama, historyczny Muharraq i Bahrain Fort pokazują różne oblicza kraju; plażowe hotele leżą poza ścisłym centrum.",
    itinerary: "Na 3–5 dni połącz Manamę, muzea, historyczne dzielnice i jeden dzień spokojnego wypoczynku.",
    stay: "Centrum Manamy wybierz pod zwiedzanie, a resort poza miastem, gdy ważniejszy jest basen i plaża.",
    tip: "Sprawdź trasę z przesiadką oraz warunki wjazdu obowiązujące w dniu podróży.",
    related: ["Zjednoczone Emiraty Arabskie","Turcja","Maroko"]
  },
  "Bułgaria": {
    hook: "Bułgaria sprawdza się na nadmorskie wakacje z budżetem pod kontrolą, ale także na poznawanie miast i gór.",
    season: "Nadmorskie kąpieliska działają najpełniej latem, zwykle od czerwca do września. Na zwiedzanie Sofii i Płowdiwu warto rozważyć wiosnę lub jesień.",
    places: "Słoneczny Brzeg i Nessebar leżą blisko siebie, Złote Piaski są w rejonie Warny, a Sozopol oferuje inny, spokojniejszy klimat.",
    itinerary: "Przy tygodniu wybierz jeden kurort i krótkie wycieczki. Dłuższy wyjazd pozwoli dodać Płowdiw lub góry.",
    stay: "Sprawdź, czy hotel leży faktycznie przy plaży i jaki jest dojazd z Warny lub Burgas.",
    tip: "W pakietach All Inclusive zwracaj uwagę na standard, wyżywienie i transfer, nie tylko cenę za osobę.",
    related: ["Turcja","Grecja","Rumunia"]
  },
  "Chorwacja": {
    hook: "Chorwacja to Adriatyk, wyspy i zabytkowe miasta, w których łatwo połączyć plażę ze zwiedzaniem.",
    season: "Na kąpiele zwykle najlepiej wypada czerwiec–wrzesień. Maj i październik to dobry pomysł na spokojniejsze zwiedzanie wybrzeża.",
    places: "Split i Dubrownik są wygodnymi bazami, Zadar daje dostęp do północnej Dalmacji, a Istria ma własny, bardziej włoski charakter.",
    itinerary: "Na tydzień wybierz Dalmację albo Istrię. Przeskakiwanie między skrajnymi krańcami wybrzeża zabiera dużo czasu.",
    stay: "Porównuj parking, odległość od plaży i położenie względem starego miasta; wiele miejsc ma strome podejścia.",
    tip: "Sprawdź osobno koszt lotu, transferu i promów. Hotel na wyspie wymaga dopasowania godzin rejsów.",
    related: ["Czarnogóra","Albania","Słowenia"]
  },
  "Curaçao": {
    hook: "Curaçao to karaibska wyspa z kolorowym Willemstad, małymi zatokami i świetnymi miejscami do snorkelingu.",
    season: "Ciepło jest tu przez cały rok. W pierwszej części roku bywa bardziej sucho, ale opady i wiatr są możliwe o każdej porze; w sezonie zimowym ceny noclegów mogą rosnąć.",
    places: "Zobacz kolonialną zabudowę Willemstad, plaże Grote Knip i Cas Abao, okolice Westpunt oraz park Christoffel.",
    itinerary: "Przy 8–10 dniach połącz wypoczynek na zachodzie z Willemstad i jednodniowym zwiedzaniem mniej turystycznych zatok.",
    stay: "Pietermaai i Willemstad pasują do miejskiej bazy, Jan Thiel do plaży i restauracji, a Westpunt do spokojniejszej części wyspy.",
    tip: "Najpierw porównaj loty z przesiadką, a potem sprawdź koszt auta — bez niego dotarcie do wielu zatok jest trudniejsze.",
    related: ["Aruba","Dominikana","Jamajka"]
  },
  "Cypr": {
    hook: "Cypr oferuje długi sezon, zabytki i plaże, ale każdy region daje inny styl pobytu.",
    season: "Najwięcej słońca i plażowego życia jest od późnej wiosny do jesieni; lipiec i sierpień bywają upalne. Wiosna i jesień sprzyjają spacerom.",
    places: "Pafos łączy zabytki i wybrzeże, Larnaka jest wygodną bazą, a Ayia Napa i Protaras słyną z plaż.",
    itinerary: "Na 5–7 dni wybierz jeden region. Przy 10 dniach można podzielić pobyt między zachód i wschód wyspy.",
    stay: "W Pafos sprawdź odległość od plaży, a na wschodzie dojazd do zatok i centrum kurortu.",
    tip: "Sprawdź lotnisko docelowe i realny czas dojazdu. Pafos i Larnaka nie są zamienne dla każdego hotelu.",
    related: ["Cypr Północny","Grecja","Malta"]
  },
  "Cypr Północny": {
    hook: "Północna część Cypru ma spokojniejsze kurorty, zatoki i zabytkowe miejscowości.",
    season: "Najprzyjemniej zwiedza się wiosną i jesienią. Lato jest gorące i bardziej nastawione na plażowanie.",
    places: "Kirenia (Girne), Famagusta i półwysep Karpaz pokazują wybrzeże, historię i przyrodę tego regionu.",
    itinerary: "Na 5–7 dni zaplanuj bazę przy Kirenii, Famagustę i osobny dzień na odleglejsze plaże.",
    stay: "Sprawdź położenie hotelu względem plaży i dostępność transportu — odległości bywają większe niż wyglądają na mapie.",
    tip: "Przed zakupem zweryfikuj trasę lotu, warunki przekroczenia linii podziału, ubezpieczenie i zasady wynajmu auta.",
    related: ["Cypr","Turcja","Grecja"]
  },
  "Czarnogóra": {
    hook: "Czarnogóra mieści fiordowe widoki Zatoki Kotorskiej, góry i plaże na niewielkim obszarze.",
    season: "Wybrzeże najlepiej zwiedza się od późnej wiosny do wczesnej jesieni. W środku lata bywa tłoczno, a w górach pogoda zmienia się szybciej.",
    places: "Kotor i Perast to zatoka, Budva i Sveti Stefan — część plażowa, a Durmitor — zupełnie inna, górska odsłona kraju.",
    itinerary: "Na 7 dni połącz Zatokę Kotorską z plażami. Na 10 dni dodaj Durmitor, uwzględniając kręte drogi.",
    stay: "Baza w Kotorze ułatwia zwiedzanie zatoki, a okolice Budvy lepiej pasują do codziennego plażowania.",
    tip: "Sprawdź transfer z Podgoricy lub Tivatu; krótka odległość na mapie może oznaczać długi przejazd.",
    related: ["Chorwacja","Albania","Słowenia"]
  },
  "Czechy": {
    hook: "Czechy to świetny kierunek na city break bez skomplikowanej logistyki oraz wyjazdy w góry.",
    season: "Praga działa cały rok; wiosną i jesienią łatwiej o spacery bez letnich upałów, a grudzień przyciąga jarmarkami.",
    places: "Praga, Brno i Czeski Krumlov to różne pomysły na zwiedzanie; Karkonosze i Morawy wybierz przy dłuższym pobycie.",
    itinerary: "Na weekend skup się na Pradze. Przy 5–6 dniach połącz dwa miasta lub miasto z regionem przyrodniczym.",
    stay: "W Pradze warto szukać blisko metra lub tramwaju, niekoniecznie tuż przy Rynku Staromiejskim.",
    tip: "Porównaj pociąg, autobus i samochód przed lotem — z wielu polskich miast mogą być wygodniejsze.",
    related: ["Austria","Niemcy","Słowacja"]
  },
  "Dominikana": {
    hook: "Dominikana to karaibskie plaże, tropikalna roślinność i duży wybór resortów.",
    season: "Zima i wczesna wiosna często oferują bardziej komfortową pogodę, ale ceny bywają wyższe. Latem i jesienią sprawdź ryzyko burz tropikalnych.",
    places: "Punta Cana to baza resortowa, Bayahibe daje dostęp do rejsów, a Samaná i Santo Domingo pokazują inną stronę kraju.",
    itinerary: "Na 9–12 dni połącz wypoczynek z jedną lub dwiema wycieczkami poza hotel.",
    stay: "Porównuj konkretną plażę, standard All Inclusive i czas transferu; nazwa regionu bywa bardzo szeroka.",
    tip: "Długi przelot warto zestawić z łącznym kosztem bagażu, transferu i wyżywienia.",
    related: ["Jamajka","Aruba","Curaçao"]
  },
  "Egipt": {
    hook: "Egipt łączy hotelowy wypoczynek nad Morzem Czerwonym z możliwością poznania starożytnych zabytków.",
    season: "Wiosna i jesień sprzyjają aktywnemu zwiedzaniu, a zimą nad Morzem Czerwonym bywa łagodnie, choć wieczory mogą być chłodniejsze i wietrzne.",
    places: "Hurghada i Marsa Alam są bazami plażowymi, Sharm el-Sheikh oferuje rafy, a Kair i Luksor warto zaplanować osobno.",
    itinerary: "Na 7 dni wybierz kurort i krótkie wycieczki. Przy podróży objazdowej sprawdź dojazdy między regionami.",
    stay: "W hotelu sprawdzaj realny dostęp do kąpieliska, jakość rafy, baseny i zakres formuły All Inclusive.",
    tip: "Nie kieruj się wyłącznie temperaturą powietrza: zimą wiatr i temperatura wody mają duże znaczenie.",
    related: ["Turcja","Zjednoczone Emiraty Arabskie","Tunezja"]
  },
  "Filipiny": {
    hook: "Filipiny to archipelag tysięcy wysp, gdzie wybór regionu decyduje o całej logistyce podróży.",
    season: "W wielu popularnych regionach mniej deszczu bywa od późnej jesieni do wiosny, ale pory opadów i ryzyko tajfunów różnią się między wyspami.",
    places: "Palawan przyciąga lagunami, Bohol przyrodą, Cebu nurkowaniem, a Siargao surfingiem.",
    itinerary: "Na 12–16 dni wybierz maksymalnie dwa lub trzy regiony. Każdy dodatkowy przelot lub prom może zabrać sporą część dnia.",
    stay: "El Nido i Coron wymagają innej logistyki niż Bohol; dobierz bazę do wycieczek, nie tylko zdjęć hotelu.",
    tip: "Porównaj lot do Manili lub Cebu, a następnie sprawdź koszt i rozkład lotów wewnętrznych oraz promów.",
    related: ["Indonezja","Malezja","Tajlandia"]
  },
  "Grecja": {
    hook: "Grecja daje ogromny wybór: od wysp na plażowanie po Ateny i miejsca historyczne.",
    season: "Od maja do października na wielu wyspach trwa sezon turystyczny. Wysokie lato bywa gorące; na spokojne zwiedzanie warto rozważyć maj, czerwiec lub wrzesień.",
    places: "Kreta to różnorodność, Rodos zabytki i plaże, Korfu zieleń, a Ateny sprawdzą się na krótki wyjazd.",
    itinerary: "Na tydzień zwykle wybierz jedną wyspę. Łączenie wielu wysp wymaga sprawdzenia rejsów i godzin transferów.",
    stay: "Zanim wybierzesz hotel, sprawdź stronę wyspy, charakter plaży i odległość od lotniska.",
    tip: "Porównuj lot + hotel z wyjazdem samodzielnym; przy krótkim urlopie transfer może zmienić opłacalność.",
    related: ["Cypr","Albania","Turcja"]
  },
  "Hiszpania": {
    hook: "Hiszpania sprawdzi się zarówno na miejski weekend, jak i dłuższe wakacje nad morzem.",
    season: "Barcelona i Andaluzja są dobre również poza szczytem lata, ale pogoda mocno zależy od regionu; Wyspy Kanaryjskie mają odmienny klimat od kontynentu.",
    places: "Barcelona i Madryt to miasta, Majorka i Costa Blanca to plaże, a Andaluzja łączy historię i krajobrazy.",
    itinerary: "Na 3–4 dni wybierz jedno miasto. Na tydzień zdecyduj się na wyspę albo fragment wybrzeża.",
    stay: "W miastach sprawdzaj transport publiczny, a przy plaży dojście do morza i sezonowość okolicy.",
    tip: "Nie porównuj wyłącznie temperatur: kontynent, Baleary i Kanary mają inne pory najlepsze na podróż.",
    related: ["Portugalia","Malta","Włochy"]
  },
  "Indonezja": {
    hook: "Indonezja to więcej niż Bali: wyspy różnią się klimatem, kulturą i sposobem podróżowania.",
    season: "Na Bali zwykle bardziej sucho jest od późnej wiosny do wczesnej jesieni, ale inne części archipelagu mają własny rytm pogodowy.",
    places: "Bali to Ubud i południowe plaże, Lombok pozwala odpocząć, a Jawa daje świątynie i wulkany.",
    itinerary: "Na 12–15 dni połącz dwa regiony, zamiast próbować zwiedzić kilka odległych wysp w tydzień.",
    stay: "Ubud wybierz pod naturę i zwiedzanie, a wybrzeże pod plaże; dojazdy na Bali bywają wolne.",
    tip: "Uwzględnij loty między wyspami, transport lokalny i sezon deszczowy dla wybranego regionu.",
    related: ["Filipiny","Malezja","Tajlandia"]
  },
  "Jamajka": {
    hook: "Jamajka to karaibskie plaże, muzyka, góry i kurorty o bardzo różnym charakterze.",
    season: "Zimowe miesiące często są przyjemniejsze na wypoczynek; lato i jesień wymagają sprawdzenia prognozy oraz sezonu burz tropikalnych.",
    places: "Negril słynie z długiej plaży, Montego Bay z hotelowych resortów, a Ocho Rios z wodospadów i wycieczek.",
    itinerary: "Na 8–10 dni wybierz jedną bazę, a dalsze atrakcje planuj jako całodniowe wycieczki.",
    stay: "Porównaj Negril z Montego Bay pod kątem dojazdu, charakteru plaży i odległości od lotniska.",
    tip: "Sprawdź, czy transfer jest w cenie pakietu oraz jaki jest całkowity czas lotu z przesiadką.",
    related: ["Dominikana","Aruba","Curaçao"]
  },
  "Kenia": {
    hook: "Kenia daje połączenie safari z wypoczynkiem nad Oceanem Indyjskim, ale to dwa odrębne etapy podróży.",
    season: "Safari i plażowanie mają różne optymalne terminy. Pora suchsza w wielu parkach ułatwia obserwację zwierząt, a na wybrzeżu sprawdzaj lokalne opady.",
    places: "Masai Mara i Amboseli to znane regiony safari, Nairobi punkt startowy, a Diani Beach i okolice Mombasy służą plażowaniu.",
    itinerary: "Na 10–14 dni połącz kilkudniowe safari i odpoczynek nad oceanem, uwzględniając lot krajowy lub długi transfer.",
    stay: "W parkach liczy się lokalizacja lodge, na wybrzeżu sprawdź przypływy, dojazd i formułę posiłków.",
    tip: "Koszt safari często jest osobnym, znaczącym elementem budżetu. Zweryfikuj też aktualne formalności wjazdowe.",
    related: ["Tanzania","Madagaskar","Mauritius"]
  },
  "Macedonia Północna": {
    hook: "Macedonia Północna jest dobrym pomysłem na spokojny objazd Bałkanów, jeziora i górskie widoki.",
    season: "Na zwiedzanie najlepiej rozważyć wiosnę lub wczesną jesień; latem przy Jeziorze Ochrydzkim trwa sezon wypoczynkowy.",
    places: "Skopje to stolica, Ochryda i Jezioro Ochrydzkie są główną atrakcją, a kanion Matka pozwala na krótki wypad w naturę.",
    itinerary: "Na 5–7 dni połącz Skopje i Ochrydę, bez pośpiechu i z czasem nad jeziorem.",
    stay: "Nocleg przy Ochrydzie wybieraj pod względem zejścia do wody i dostępu do starego miasta.",
    tip: "Sprawdź loty do Skopje i czas dojazdu nad jezioro; przy kilku osobach wynajem auta może uprościć trasę.",
    related: ["Albania","Czarnogóra","Grecja"]
  },
  "Madagaskar": {
    hook: "Madagaskar to lemury, baobaby, niezwykła przyroda i plaże, ale wymaga rozsądnego planowania odległości.",
    season: "W wielu regionach pora bardziej sucha przypada na maj–październik. Na wschodzie bywa wilgotniej, a w porze deszczowej część tras jest trudniejsza; sezon cyklonowy wymaga uwagi.",
    places: "Andasibe słynie z przyrody, Morondava z Alei Baobabów, Nosy Be z plaż, a Tsingy de Bemaraha z wyjątkowych formacji skalnych.",
    itinerary: "Na 12–16 dni wybierz jeden region objazdowy i wypoczynek. Nie łącz na siłę odległych parków — przejazdy mogą zajmować wiele godzin.",
    stay: "Na północy porównaj Nosy Be i okoliczne wysepki, a na trasie objazdu noclegi blisko parków i transferów.",
    tip: "Zacznij od trasy lotu do Antananarywy lub Nosy Be. Przed rezerwacją sprawdź transport wewnętrzny, sezon i aktualne zalecenia podróżne.",
    related: ["Mauritius","Seszele","Kenia"]
  },
  "Malediwy": {
    hook: "Malediwy to atole i laguny, ale sposób transferu na wyspę mocno wpływa na finalną cenę.",
    season: "Wiele wysp ma bardziej suchy okres mniej więcej od zimy do wiosny, ale przelotne opady zdarzają się cały rok.",
    places: "Malé bywa punktem przesiadkowym, a lokalne wyspy i prywatne resorty oferują zupełnie inny model wypoczynku.",
    itinerary: "Na 7–10 dni wybierz jeden atol albo połącz dwie wyspy tylko wtedy, gdy transfer jest prosty.",
    stay: "Porównaj lokalną wyspę z resortem, wliczając łódź lub hydroplan, posiłki oraz ewentualne opłaty.",
    tip: "Nie oceniaj pakietu tylko po cenie noclegu — koszt transferu i wyżywienia bywa kluczowy.",
    related: ["Seszele","Mauritius","Sri Lanka"]
  },
  "Malezja": {
    hook: "Malezja pozwala połączyć nowoczesne miasto, dżunglę i wyspy, ale pogoda zależy od wybrzeża.",
    season: "Zachodnie i wschodnie wybrzeże mają odmienne pory deszczowe. Termin dobieraj do konkretnej wyspy, nie do kraju jako całości.",
    places: "Kuala Lumpur to city break, Penang słynie z kuchni, Langkawi z plaż, a Borneo z przyrody.",
    itinerary: "Na 12 dni połącz Kuala Lumpur z jedną wyspą lub regionem przyrodniczym.",
    stay: "W Kuala Lumpur liczy się dostęp do komunikacji, a na wyspach odległość od plaży i infrastruktura w okolicy.",
    tip: "Sprawdź, czy lot kończy się w Kuala Lumpur, czy konieczna będzie osobna przesiadka na wyspę.",
    related: ["Tajlandia","Indonezja","Filipiny"]
  },
  "Malta": {
    hook: "Malta to kamienne miasta, historia i zatoki — dobry kierunek również na krótki urlop.",
    season: "Wiosna i jesień sprzyjają zwiedzaniu, lato jest gorące i plażowe, a zimą może być wietrznie i deszczowo.",
    places: "Valletta to zabytki, Sliema i St. Julian's to miejska baza, Gozo to spokojniejsze tempo, a Comino przyciąga laguną.",
    itinerary: "Na 3–4 dni wybierz Vallettę i południe wyspy. Przy tygodniu dodaj Gozo i więcej kąpielisk.",
    stay: "Sprawdź połączenia autobusowe; odległości są małe, ale przejazdy w sezonie mogą długo trwać.",
    tip: "Przy jesiennym city breaku porównaj lot z Modlina, Krakowa i innych lotnisk — ważne są także godziny powrotu.",
    related: ["Cypr","Hiszpania","Włochy"]
  },
  "Maroko": {
    hook: "Maroko łączy miasta z medynami, oceaniczne plaże i krajobrazy Atlasu oraz Sahary.",
    season: "Na intensywne zwiedzanie komfortowe bywają wiosna i jesień; latem w głębi kraju może być bardzo gorąco, a nad oceanem chłodniej.",
    places: "Marrakesz daje medynę i ogrody, Fez zabytki, Agadir plaże, a Essaouira spokojniejszy klimat nad Atlantykiem.",
    itinerary: "Na tydzień skup się na Marrakeszu i wybrzeżu. Pustynię dodaj do dłuższej trasy, sprawdzając czas przejazdu.",
    stay: "Riad w medynie to inna wygoda niż hotel resortowy; sprawdź dojście z ulicy i warunki transportu.",
    tip: "Unikaj zbyt krótkich pobytów z długą wycieczką na pustynię — to wiele godzin w samochodzie.",
    related: ["Tunezja","Egipt","Hiszpania"]
  },
  "Mauritius": {
    hook: "Mauritius to nie tylko plaże: są tu trasy trekkingowe, ogrody i krajobrazy wulkanicznej wyspy.",
    season: "Od maja do listopada bywa nieco chłodniej i suchszej, ale warunki różnią się między wybrzeżami. Latem należy śledzić opady i potencjalne cyklony.",
    places: "Le Morne daje widoki i sporty wodne, Grand Baie restauracje, a Black River Gorges to kierunek przyrodniczy.",
    itinerary: "Na 9–12 dni połącz plażowanie z wyjazdami po południowej i północnej części wyspy.",
    stay: "Wybieraj wybrzeże pod sezon i wiatr, nie tylko pod zdjęcie plaży. Resorty mogą leżeć daleko od miasteczek.",
    tip: "Porównaj lot, transfer i ewentualne auto; na wyspie jest wiele atrakcji poza hotelem.",
    related: ["Seszele","Madagaskar","Malediwy"]
  },
  "Meksyk": {
    hook: "Meksyk to duży kraj; wakacje nad Karaibami i zwiedzanie miast kolonialnych to dwa różne wyjazdy.",
    season: "Na Jukatanie zimą i wiosną bywa bardziej komfortowo, a w porze deszczowej trzeba liczyć się z opadami i sezonem huraganowym.",
    places: "Cancún i Riviera Maya dają plaże i hotele, Tulum cenoty i ruiny, a Chichén Itzá to popularna wycieczka.",
    itinerary: "Na 10–14 dni wybierz fragment Jukatanu; łączenie go z centralnym Meksykiem wymaga dodatkowych przelotów.",
    stay: "Porównaj strefę hotelową z miasteczkami i apartamentami pod kątem dojazdu oraz dostępu do plaży.",
    tip: "Sprawdź czas transferu z Cancún i aktualne warunki na plażach, które mogą zmieniać się sezonowo.",
    related: ["Dominikana","Jamajka","Stany Zjednoczone"]
  },
  "Niemcy": {
    hook: "Niemcy to różnorodne miasta, zabytki i trasy przyrodnicze, często osiągalne z Polski bez samolotu.",
    season: "Berlin i Hamburg są dobre na city break cały rok; jarmarki przyciągają w grudniu, a góry i jeziora najbardziej latem.",
    places: "Berlin to muzea i kultura, Drezno architektura, Hamburg port, a Bawaria zamki i Alpy.",
    itinerary: "Na weekend wybierz Berlin albo Drezno. Przy 5–7 dniach dołóż drugi region, ale nie planuj całego kraju naraz.",
    stay: "W miastach sprawdzaj stacje S-Bahn lub U-Bahn; to ważniejsze od samej odległości w kilometrach.",
    tip: "Przy wyjeździe z Polski porównaj pociągi i samochód z lotem, doliczając transfery lotniskowe.",
    related: ["Austria","Czechy","Szwajcaria"]
  },
  "Polinezja Francuska": {
    hook: "Polinezja Francuska to odległe archipelagi, laguny i wyspy, między którymi podróżuje się samolotem lub łodzią.",
    season: "Od maja do października na wielu wyspach jest zwykle suchszy i chłodniejszy okres. W cieplejszej części roku mogą występować intensywniejsze opady.",
    places: "Tahiti jest bramą wjazdową, Moorea ma góry i zatoki, a Bora Bora kojarzy się z laguną i resortami.",
    itinerary: "Na 12–16 dni połącz Tahiti z jedną lub dwiema wyspami. Przeloty między wyspami wymagają osobnego budżetu.",
    stay: "Sprawdź, czy hotel ma transfer z lotniska lub przystani, i czy śniadanie oraz łodzie są w cenie.",
    tip: "Najpierw sprawdź pełny przelot do Papeete, następnie transport między wyspami; to zwykle główne koszty.",
    related: ["Malediwy","Seszele","Mauritius"]
  },
  "Polska": {
    hook: "Polska daje zarówno krótkie weekendy miejskie, jak i dłuższy wypoczynek nad morzem, w górach czy nad jeziorami.",
    season: "Bałtyk i Mazury najbardziej ożywają latem, góry mają osobne sezony na trekking i narty, a miasta można zwiedzać przez cały rok.",
    places: "Kraków, Gdańsk i Wrocław to city break, Podhale i Bieszczady trasy górskie, a Mazury wypoczynek nad wodą.",
    itinerary: "Na 2–4 dni wybierz jeden region. Dłuższy urlop pozwoli połączyć spokojny nocleg z lokalnymi atrakcjami.",
    stay: "Porównaj lokalizację, parking i dojazd; nocleg daleko od centrum albo plaży nie zawsze będzie tańszy w sumie.",
    tip: "Sprawdź pociągi i dojazd autem. Dla wyjazdów krajowych lot nie zawsze ma sens.",
    related: ["Czechy","Słowacja","Niemcy"]
  },
  "Portugalia": {
    hook: "Portugalia łączy Lizbonę i Porto, klifowe Algarve oraz zieloną Maderę.",
    season: "Lizbona i Porto nadają się na city break poza latem; Algarve jest najbardziej plażowe latem, a na Maderze pogoda silnie zależy od wysokości.",
    places: "Lizbona przyciąga dzielnicami i tramwajami, Porto nadbrzeżem, Algarve zatokami, a Madera górami i szlakami.",
    itinerary: "Na 3–4 dni wybierz Lizbonę albo Porto, na 7 dni jeden region wybrzeża lub Maderę.",
    stay: "W Lizbonie sprawdź strome podejścia i komunikację; na Maderze baza z autem daje większą elastyczność.",
    tip: "Przy wyborze między kontynentem a Maderą porównuj pogodę, długość lotu i charakter wypoczynku.",
    related: ["Hiszpania","Malta","Włochy"]
  },
  "Seszele": {
    hook: "Seszele zachwycają granitowymi plażami i zielonymi wyspami, ale wybór bazy wpływa na logistykę całego pobytu.",
    season: "Warunki kąpielowe i wiatr zmieniają się sezonowo; okresy przejściowe często bywają spokojniejsze, lecz opady są możliwe cały rok.",
    places: "Mahé ma największą bazę, Praslin słynie z plaż i Vallée de Mai, a La Digue z rowerowego zwiedzania.",
    itinerary: "Na 10–12 dni połącz dwie wyspy; każda kolejna przeprawa promowa zabiera czas i pieniądze.",
    stay: "Na Mahé ważny bywa wynajem auta, na La Digue lokalizacja przy wypożyczalni rowerów i plażach.",
    tip: "Policz transfer z lotniska i promy; niektóre plaże mają sezonowo silne prądy i fale.",
    related: ["Mauritius","Malediwy","Madagaskar"]
  },
  "Słowacja": {
    hook: "Słowacja świetnie nadaje się na aktywny weekend, termy i wyjazdy w góry blisko Polski.",
    season: "Tatry mają różne sezony trekkingowe i zimowe. Na zwiedzanie miast oraz jaskiń wygodne bywają wiosna i jesień.",
    places: "Bratysława to city break, Tatry Wysokie i Niskie dają szlaki, a okolice Liptowa termy i jeziora.",
    itinerary: "Na 3–5 dni wybierz region górski albo Bratysławę; łączenie wszystkiego w weekend mija się z celem.",
    stay: "W górach liczy się dojazd do początku szlaków, parking i warunki zimowe.",
    tip: "Porównaj samochód i pociąg, a przed górskimi trasami sprawdź lokalne ograniczenia sezonowe.",
    related: ["Polska","Czechy","Austria"]
  },
  "Słowenia": {
    hook: "Słowenia to jeziora, alpejskie szlaki i krótki odcinek Adriatyku, świetne na spokojny road trip.",
    season: "Wiosna i jesień są dobre na miasta i spacery; latem najłatwiej połączyć jeziora, góry i wybrzeże.",
    places: "Bled i Bohinj zachwycają jeziorami, Ljubljana kawiarnianą atmosferą, a Piran zabytkowym wybrzeżem.",
    itinerary: "Na tydzień zaplanuj Bled, Ljubljanę i Piran, bez nadmiernego pośpiechu.",
    stay: "Przy jeziorach noclegi z widokiem mogą być droższe; baza poza Bledem bywa korzystniejsza.",
    tip: "Rozważ auto lub połączenia kolejowo-autobusowe. Sprawdź parking i ewentualne opłaty drogowe.",
    related: ["Chorwacja","Austria","Włochy"]
  },
  "Sri Lanka": {
    hook: "Sri Lanka łączy plantacje herbaty, zabytki, safari i plaże na stosunkowo niewielkiej wyspie.",
    season: "Dwa monsuny wpływają na różne wybrzeża w innym czasie. Najlepszy termin zależy od wybranej części wyspy, nie tylko miesiąca.",
    places: "Sigiriya i Kandy to kultura, Ella i Nuwara Eliya to wzgórza, a południowe oraz wschodnie plaże mają odmienne sezony.",
    itinerary: "Na 12–14 dni połącz centrum kraju z jednym wybrzeżem; przejazdy mogą być powolne.",
    stay: "W górach wybieraj bazę pod trasę kolejową, a przy plaży sprawdź fale i warunki do kąpieli.",
    tip: "Zaplanuj podróż od regionu plażowego, który ma sens pogodowo w Twoim terminie.",
    related: ["Malediwy","Tajlandia","Indonezja"]
  },
  "Stany Zjednoczone": {
    hook: "USA to zupełnie różne podróże: wielkie miasta, parki narodowe i wybrzeża wymagają osobnych planów.",
    season: "Nowy Jork, Kalifornia i Floryda mają odmienne pory najlepsze do zwiedzania; w parkach narodowych warunki zależą od wysokości i regionu.",
    places: "Nowy Jork nadaje się na city break, zachodnie parki na road trip, a Floryda na wypoczynek i atrakcje.",
    itinerary: "Przy 7–10 dniach skup się na jednym regionie. Łączenie obu wybrzeży oznacza dodatkowy przelot i koszty.",
    stay: "W miastach liczy się komunikacja, a przy road tripie parking i odległości między kolejnymi noclegami.",
    tip: "Sprawdź wymagania wjazdowe, ewentualne uprawnienie ESTA lub wizę i pełen koszt bagażu oraz auta.",
    related: ["Meksyk","Jamajka","Dominikana"]
  },
  "Szwajcaria": {
    hook: "Szwajcaria to widokowe pociągi, jeziora i Alpy — kierunek na city break albo aktywną trasę.",
    season: "Lato sprzyja górskim wędrówkom, zima sportom śnieżnym, a wiosna i jesień miastom oraz podróżom kolejowym.",
    places: "Zurych i Lucerna to miasta i jeziora, Interlaken to baza na góry, a Zermatt przyciąga widokiem Matterhornu.",
    itinerary: "Na 5–7 dni wybierz dwa sąsiednie regiony, najlepiej powiązane koleją.",
    stay: "Bliskość stacji kolejowej może oszczędzić kosztów transferu; sprawdź ceny transportu przed wyborem hotelu.",
    tip: "Porównaj bilety kolejowe i karnety regionalne. Sam nocleg nie pokazuje pełnego kosztu wyjazdu.",
    related: ["Austria","Niemcy","Słowenia"]
  },
  "Tajlandia": {
    hook: "Tajlandia sprawdzi się na uliczne jedzenie, świątynie i egzotyczne plaże, ale wybrzeża mają różne sezony.",
    season: "Okres bardziej suchy na wybrzeżu Andamańskim przypada zwykle na zimę i wiosnę; na wyspach Zatoki Tajlandzkiej układ opadów jest odmienny.",
    places: "Bangkok to start i zwiedzanie, Chiang Mai północ, Phuket i Krabi południowe plaże, a Koh Samui leży nad innym wybrzeżem.",
    itinerary: "Na 12–15 dni połącz Bangkok i jeden region plażowy; dalsze wyspy dodawaj dopiero po sprawdzeniu promów.",
    stay: "W Bangkoku liczy się BTS/MRT, a na wyspach konkretna plaża i dojazd do przystani.",
    tip: "Sprawdź sezon dla dokładnego regionu; 'Tajlandia w listopadzie' nie znaczy tego samego dla każdej wyspy.",
    related: ["Wietnam","Malezja","Sri Lanka"]
  },
  "Tanzania": {
    hook: "Tanzania to safari w północnych parkach, Kilimandżaro i plaże Zanzibaru — trzy różne style wyjazdu.",
    season: "Pora bardziej sucha ułatwia safari w wielu parkach, lecz migracje zwierząt i warunki na Zanzibarze zależą od miesiąca.",
    places: "Serengeti i Ngorongoro to safari, Arusha baza wypadowa, a Zanzibar pozwala odpocząć nad oceanem.",
    itinerary: "Na 10–14 dni zaplanuj safari oraz kilka dni na plaży, uwzględniając przelot wewnętrzny.",
    stay: "W parkach ważna jest lokalizacja lodge, na Zanzibarze dobór plaży do pływów i preferowanego stylu wypoczynku.",
    tip: "Kalkuluj safari osobno; porównuj loty do Kilimandżaro, Dar es Salaam i na Zanzibar.",
    related: ["Kenia","Mauritius","Madagaskar"]
  },
  "Tunezja": {
    hook: "Tunezja oferuje plażowe kurorty, medyny i miejsca historyczne w stosunkowo krótkim locie z Polski.",
    season: "Na plażowanie najczęściej wybiera się późną wiosnę, lato i początek jesieni. Na zwiedzanie lepsza bywa łagodniejsza wiosna.",
    places: "Djerba to wypoczynek wyspiarski, Hammamet i Sousse to kurorty, a Tunis i Kartagina oferują zabytki.",
    itinerary: "Na 7 dni wybierz kurort i jedną wycieczkę. Objazd kraju wymaga dłuższego pobytu.",
    stay: "Sprawdź standard hotelu, położenie względem plaży i zakres wyżywienia.",
    tip: "Porównuj całkowitą cenę pakietu z transferem; poza sezonem część atrakcji przy kurortach może nie działać.",
    related: ["Egipt","Maroko","Turcja"]
  },
  "Turcja": {
    hook: "Turcja daje wybór między bogatymi resortami nad morzem a Stambułem i Kapadocją.",
    season: "Na Riwierze Tureckiej sezon plażowy trwa zwykle od późnej wiosny do jesieni; Stambuł przyjemniej zwiedza się wiosną i jesienią.",
    places: "Antalya, Side i Alanya to kurorty, Bodrum ma inny charakter, a Stambuł i Kapadocja to kierunki do zwiedzania.",
    itinerary: "Na tydzień wybierz jeden region. Przy zwiedzaniu Turcji zaplanuj loty wewnętrzne lub dłuższy urlop.",
    stay: "W pakietach All Inclusive sprawdzaj plażę, zjeżdżalnie, standard jedzenia i transfer.",
    tip: "Porównaj finalną cenę gotowego pakietu z lotem i bagażem przed samodzielnym składaniem wyjazdu.",
    related: ["Grecja","Cypr","Egipt"]
  },
  "Węgry": {
    hook: "Węgry to Budapeszt, termy, wino i wypoczynek nad Balatonem.",
    season: "Budapeszt sprawdzi się cały rok, jarmarki ożywają zimą, a Balaton najpełniej latem.",
    places: "Budapeszt ma zabytki i kąpieliska termalne, Eger jest dobry dla miłośników wina, a Balaton dla rodzinnego wypoczynku.",
    itinerary: "Na 3 dni skup się na Budapeszcie. Przy tygodniu dołóż Balaton lub Eger.",
    stay: "W Budapeszcie wygodna jest bliskość metra, tramwaju i mostów nad Dunajem.",
    tip: "Z Polski często warto porównać pociąg z lotem, zwłaszcza gdy podróżujesz z większym bagażem.",
    related: ["Austria","Czechy","Słowacja"]
  },
  "Wietnam": {
    hook: "Wietnam to wielkie miasta, góry północy, zatoka Ha Long i tropikalne południe.",
    season: "Pogoda różni się silnie między północą, centrum i południem; jeden 'najlepszy miesiąc' dla całego kraju nie istnieje.",
    places: "Hanoi, Sapa i Ha Long tworzą trasę na północy, Hoi An jest w centrum, a Ho Chi Minh i Phu Quoc na południu.",
    itinerary: "Na 12–14 dni wybierz dwa regiony zamiast całej długości kraju. Północ wymaga czasu na dojazdy w góry.",
    stay: "W Hanoi szukaj wygodnej bazy, w Sapie sprawdzaj transport do trekkingów, a przy rejsie w Ha Long termin i operatora.",
    tip: "Dopasuj trasę do pory deszczowej w każdym regionie; rejs w Ha Long zależy od pogody i warunków na wodzie.",
    related: ["Tajlandia","Malezja","Indonezja"]
  },
  "Włochy": {
    hook: "Włochy to jedne z najbardziej różnorodnych kierunków na city break, urlop nad morzem i objazd.",
    season: "W Rzymie i na południu wiosna oraz jesień są dobre na zwiedzanie; latem na wyspach trwa szczyt sezonu plażowego.",
    places: "Rzym, Wenecja i Florencja to miasta, Sycylia i Sardynia plaże, a okolice Neapolu i Bari łączą oba style.",
    itinerary: "Na 3–4 dni wybierz jedno miasto. Przy tygodniu skup się na jednym regionie lub wyspie.",
    stay: "W mieście szukaj noclegu z dobrym transportem, a na wybrzeżu sprawdź dojazd do plaż i parking.",
    tip: "Warto porównać loty do kilku sąsiednich lotnisk, ale zawsze dolicz transfer do wybranej miejscowości.",
    related: ["Hiszpania","Grecja","Malta"]
  },
  "Zjednoczone Emiraty Arabskie": {
    hook: "Emiraty łączą miasta, pustynię, plaże i resorty, ale Dubaj, Abu Dhabi oraz Ras Al Khaimah to różne wyjazdy.",
    season: "Od późnej jesieni do wiosny łatwiej o spacery i wycieczki. Latem temperatury bywają bardzo wysokie.",
    places: "Dubaj słynie z atrakcji miejskich, Abu Dhabi z muzeów i architektury, a Ras Al Khaimah z resortów i górskich widoków.",
    itinerary: "Na 5–7 dni wybierz jedno miasto jako bazę, dodając pustynię lub wycieczkę do innego emiratu.",
    stay: "W Dubaju sprawdzaj dostęp do metra i odległość od plaży; resort w Ras Al Khaimah to inna logistyka.",
    tip: "Porównuj transfer z lotniska, dodatkowe opłaty hotelowe i warunki bagażowe.",
    related: ["Bahrajn","Egipt","Turcja"]
  }
};

// "Rumunia" is not in the menu; keep related links strictly inside the indexed catalogue.
editorial["Bułgaria"].related = ["Turcja","Grecja","Czarnogóra"];

export function normalizeArticleDestination(input: string): string {
  return String(input || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pl").replace(/ł/g, "l").trim();
}

export function destinationArticleHref(destination: Pick<EximDestination, "label" | "eximPath">) {
  const slug = destination.label === "Macedonia Północna" ? "macedonia-polnocna" : destination.eximPath.split("/").filter(Boolean).pop();
  return "/kierunki/" + slug;
}

export const destinationArticles: DestinationArticle[] = eximDestinations.map(destination => {
  const copy = editorial[destination.label];
  if (!copy) throw new Error("Brak treści przewodnika dla kierunku: " + destination.label);
  const href = destinationArticleHref(destination);
  return { ...copy, name: destination.label, query: destination.query, slug: href.split("/").pop()!, href };
});

export function getDestinationArticleBySlug(slug: string) {
  return destinationArticles.find(item => item.slug === slug);
}

export function getDestinationArticleByQuery(query: string) {
  const normalized = normalizeArticleDestination(query);
  if (!normalized) return undefined;
  return destinationArticles.find(item =>
    normalizeArticleDestination(item.name) === normalized ||
    normalizeArticleDestination(item.query) === normalized ||
    (item.name === "Zjednoczone Emiraty Arabskie" && ["zea","emiraty arabskie"].includes(normalized)) ||
    (item.name === "Macedonia Północna" && normalized === "macedonia") ||
    (item.name === "Curaçao" && normalized === "curacao")
  );
}
