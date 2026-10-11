/**
 * Real destination IATA codes. These are discoverable search routes, NOT
 * confirmed flight offers: only /api/flight-deals supplies observed prices.
 * Users can additionally look up other cities via /api/flight-places.
 */
const catalogByRegion = {
  Europa: `
AMS|Amsterdam|Holandia
ALC|Alicante|Hiszpania
ATH|Ateny|Grecja
BRI|Bari|Włochy
BCN|Barcelona|Hiszpania
BGY|Bergamo|Włochy
BEG|Belgrad|Serbia
BGO|Bergen|Norwegia
BER|Berlin|Niemcy
BLL|Billund|Dania
BLQ|Bolonia|Włochy
BOD|Bordeaux|Francja
BTS|Bratysława|Słowacja
BRU|Bruksela|Belgia
BUD|Budapeszt|Węgry
BUH|Bukareszt|Rumunia
CHQ|Chania (Kreta)|Grecja
CTA|Katania|Włochy
CPH|Kopenhaga|Dania
DBV|Dubrownik|Chorwacja
DUB|Dublin|Irlandia
EDI|Edynburg|Wielka Brytania
FAO|Faro|Portugalia
FLR|Florencja|Włochy
FRA|Frankfurt|Niemcy
FUE|Fuerteventura|Hiszpania
FNC|Funchal (Madera)|Portugalia
GVA|Genewa|Szwajcaria
GLA|Glasgow|Wielka Brytania
HAM|Hamburg|Niemcy
HEL|Helsinki|Finlandia
HER|Heraklion (Kreta)|Grecja
IBZ|Ibiza|Hiszpania
INN|Innsbruck|Austria
IST|Stambuł|Turcja
JTR|Santorini|Grecja
KEF|Reykjavik|Islandia
LCA|Larnaka|Cypr
LIS|Lizbona|Portugalia
LJU|Lublana|Słowenia
LON|Londyn|Wielka Brytania
LPA|Gran Canaria|Hiszpania
MAD|Madryt|Hiszpania
AGP|Malaga|Hiszpania
MLA|Malta|Malta
MAN|Manchester|Wielka Brytania
MRS|Marsylia|Francja
MIL|Mediolan|Włochy
MUC|Monachium|Niemcy
NAP|Neapol|Włochy
NCE|Nicea|Francja
OSL|Oslo|Norwegia
PMO|Palermo|Włochy
PMI|Majorka|Hiszpania
PFO|Pafos|Cypr
PAR|Paryż|Francja
PSA|Piza|Włochy
OPO|Porto|Portugalia
PRG|Praga|Czechy
RHO|Rodos|Grecja
RIX|Ryga|Łotwa
ROM|Rzym|Włochy
SKG|Saloniki|Grecja
SVQ|Sewilla|Hiszpania
SOF|Sofia|Bułgaria
SPU|Split|Chorwacja
ARN|Sztokholm|Szwecja
TLL|Tallinn|Estonia
TFS|Teneryfa|Hiszpania
TIA|Tirana|Albania
TGD|Podgorica|Czarnogóra
TRN|Turyn|Włochy
VLC|Walencja|Hiszpania
VCE|Wenecja|Włochy
VIE|Wiedeń|Austria
ZAD|Zadar|Chorwacja
ZAG|Zagrzeb|Chorwacja
ZRH|Zurych|Szwajcaria
`,
  Afryka: `
ADD|Addis Abeba|Etiopia
TNR|Antananarywa|Madagaskar
BJL|Bandżul|Gambia
CMN|Casablanca|Maroko
CPT|Kapsztad|RPA
DJE|Dżerba|Tunezja
HRG|Hurghada|Egipt
JNB|Johannesburg|RPA
CAI|Kair|Egipt
NBO|Nairobi|Kenia
MBA|Mombasa|Kenia
RMF|Marsa Alam|Egipt
RAK|Marrakesz|Maroko
MRU|Mauritius|Mauritius
SEZ|Mahé (Seszele)|Seszele
SSH|Szarm el-Szejk|Egipt
TUN|Tunis|Tunezja
ZNZ|Zanzibar|Tanzania
`,
  "Bliski Wschód": `
AUH|Abu Zabi|ZEA
AMM|Amman|Jordania
DOH|Doha|Katar
DXB|Dubaj|ZEA
JED|Dżudda|Arabia Saudyjska
MCT|Maskat|Oman
RUH|Rijad|Arabia Saudyjska
SHJ|Szardża|ZEA
`,
  Azja: `
DPS|Bali (Denpasar)|Indonezja
BKK|Bangkok|Tajlandia
CEB|Cebu|Filipiny
CNX|Chiang Mai|Tajlandia
DAD|Da Nang|Wietnam
DEL|Delhi|Indie
GOI|Goa|Indie
HAN|Hanoi|Wietnam
HKG|Hongkong|Chiny
SGN|Ho Chi Minh|Wietnam
KTM|Katmandu|Nepal
USM|Koh Samui|Tajlandia
KUL|Kuala Lumpur|Malezja
CMB|Kolombo|Sri Lanka
KBV|Krabi|Tajlandia
MLE|Malé (Malediwy)|Malediwy
MNL|Manila|Filipiny
BOM|Mumbaj|Indie
KIX|Osaka|Japonia
PEK|Pekin|Chiny
HKT|Phuket|Tajlandia
PNH|Phnom Penh|Kambodża
SAI|Siem Reap|Kambodża
SIN|Singapur|Singapur
ICN|Seul|Korea Południowa
PVG|Szanghaj|Chiny
TPE|Tajpej|Tajwan
TYO|Tokio|Japonia
`,
  "Ameryka Północna": `
AUA|Aruba|Aruba
NAS|Nassau (Bahamy)|Bahamy
BOS|Boston|USA
CUN|Cancún|Meksyk
CHI|Chicago|USA
HAV|Hawana|Kuba
LAS|Las Vegas|USA
LAX|Los Angeles|USA
MEX|Meksyk|Meksyk
MIA|Miami|USA
YUL|Montreal|Kanada
NYC|Nowy Jork|USA
MCO|Orlando|USA
PUJ|Punta Cana|Dominikana
SFO|San Francisco|USA
SJO|San José|Kostaryka
SDQ|Santo Domingo|Dominikana
YYZ|Toronto|Kanada
YVR|Vancouver|Kanada
WAS|Waszyngton|USA
CUR|Willemstad (Curaçao)|Curaçao
MBJ|Montego Bay|Jamajka
`,
  "Ameryka Południowa": `
BUE|Buenos Aires|Argentyna
BOG|Bogota|Kolumbia
CUZ|Cuzco|Peru
FTE|El Calafate|Argentyna
IGU|Foz do Iguaçu|Brazylia
FLN|Florianópolis|Brazylia
GYE|Guayaquil|Ekwador
LIM|Lima|Peru
MDE|Medellín|Kolumbia
MVD|Montevideo|Urugwaj
NAT|Natal|Brazylia
UIO|Quito|Ekwador
RIO|Rio de Janeiro|Brazylia
SCL|Santiago|Chile
SAO|São Paulo|Brazylia
`,
  Oceania: `
AKL|Auckland|Nowa Zelandia
BNE|Brisbane|Australia
CHC|Christchurch|Nowa Zelandia
NAN|Nadi (Fidżi)|Fidżi
MEL|Melbourne|Australia
PPT|Papeete (Tahiti)|Polinezja Francuska
PER|Perth|Australia
RAR|Rarotonga|Wyspy Cooka
SYD|Sydney|Australia
`,
} as const;

export type FlightCatalogRegion = keyof typeof catalogByRegion;
export type FlightCatalogPlace = {
  code: string;
  name: string;
  country: string;
  region: FlightCatalogRegion;
};

export const FLIGHT_CATALOG_REGIONS = Object.keys(catalogByRegion) as FlightCatalogRegion[];

const all = Object.entries(catalogByRegion).flatMap(([region, raw]) =>
  raw.trim().split("\n").map((line) => {
    const [code, name, country] = line.split("|");
    return { code, name, country, region: region as FlightCatalogRegion };
  }),
);

const seen = new Set<string>();
export const FLIGHT_DESTINATION_CATALOG: FlightCatalogPlace[] = all.filter((place) => {
  if (!/^[A-Z]{3}$/.test(place.code) || !place.name || !place.country || seen.has(place.code)) return false;
  seen.add(place.code);
  return true;
});

export function normalizeFlightDestinationQuery(value: string) {
  return value.toLocaleLowerCase("pl-PL").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ł/g, "l").trim();
}
