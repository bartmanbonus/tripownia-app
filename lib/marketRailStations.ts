/**
 * Station presets for the Christmas market routes.
 *
 * The names represent suggested city-center stations, not guaranteed stops
 * of a particular service or a confirmed ticket on any departure date.
 */
export type MarketRailStation = {
  id: string;
  label: string;
  mapQuery: string;
};

export const MARKET_RAIL_ORIGINS: MarketRailStation[] = [
  { id: "WAW", label: "Warszawa Centralna", mapQuery: "Warszawa Centralna, Warszawa, Polska" },
  { id: "KRK", label: "Kraków Główny", mapQuery: "Kraków Główny, Kraków, Polska" },
  { id: "KTW", label: "Katowice", mapQuery: "Dworzec PKP Katowice, Katowice, Polska" },
  { id: "GDN", label: "Gdańsk Główny", mapQuery: "Gdańsk Główny, Gdańsk, Polska" },
  { id: "WRO", label: "Wrocław Główny", mapQuery: "Wrocław Główny, Wrocław, Polska" },
  { id: "POZ", label: "Poznań Główny", mapQuery: "Poznań Główny, Poznań, Polska" },
  { id: "RZE", label: "Rzeszów Główny", mapQuery: "Rzeszów Główny, Rzeszów, Polska" },
];

export const MARKET_RAIL_DESTINATIONS: Record<string, MarketRailStation[]> = {
  "Wiedeń": [
    { id: "WIEN_HBF", label: "Wien Hbf", mapQuery: "Wien Hauptbahnhof, Wien, Austria" },
    { id: "WIEN_MEIDLING", label: "Wien Meidling", mapQuery: "Wien Meidling Bahnhof, Wien, Austria" },
  ],
  "Praga": [
    { id: "PRAHA_HL_N", label: "Praha hl.n.", mapQuery: "Praha hlavní nádraží, Praha, Czechia" },
    { id: "PRAHA_HOLESOVICE", label: "Praha-Holešovice", mapQuery: "Praha-Holešovice, Praha, Czechia" },
  ],
  "Drezno": [
    { id: "DRESDEN_HBF", label: "Dresden Hbf", mapQuery: "Dresden Hauptbahnhof, Dresden, Germany" },
    { id: "DRESDEN_NEUSTADT", label: "Dresden-Neustadt", mapQuery: "Dresden-Neustadt Bahnhof, Dresden, Germany" },
  ],
  "Norymberga": [
    { id: "NUERNBERG_HBF", label: "Nürnberg Hbf", mapQuery: "Nürnberg Hauptbahnhof, Nürnberg, Germany" },
  ],
  "Berlin": [
    { id: "BERLIN_HBF", label: "Berlin Hbf", mapQuery: "Berlin Hauptbahnhof, Berlin, Germany" },
    { id: "BERLIN_OSTBAHNHOF", label: "Berlin Ostbahnhof", mapQuery: "Berlin Ostbahnhof, Berlin, Germany" },
  ],
  "Budapeszt": [
    { id: "BUDAPEST_NYUGATI", label: "Budapest-Nyugati", mapQuery: "Budapest-Nyugati pályaudvar, Budapest, Hungary" },
    { id: "BUDAPEST_KELETI", label: "Budapest-Keleti", mapQuery: "Budapest-Keleti pályaudvar, Budapest, Hungary" },
  ],
  "Salzburg": [
    { id: "SALZBURG_HBF", label: "Salzburg Hbf", mapQuery: "Salzburg Hauptbahnhof, Salzburg, Austria" },
  ],
};

export function marketOriginForAirport(airport: string): MarketRailStation {
  const normalized = airport === "WMI" || airport === "ALL" ? "WAW" : airport;
  return MARKET_RAIL_ORIGINS.find((station) => station.id === normalized)
    || MARKET_RAIL_ORIGINS[0];
}

export function marketDestinationStations(city: string): MarketRailStation[] {
  return MARKET_RAIL_DESTINATIONS[city] || [];
}

export function marketStationDirectionsHref(origin: MarketRailStation, destination: MarketRailStation) {
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("origin", origin.mapQuery);
  url.searchParams.set("destination", destination.mapQuery);
  url.searchParams.set("travelmode", "transit");
  return url.toString();
}
