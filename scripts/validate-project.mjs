import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const fail = (message) => { console.error(`✗ ${message}`); process.exitCode = 1; };
const pass = (message) => console.log(`✓ ${message}`);

const duplicateRouteDirs = ["okazje", "poradniki", "parkingi", "atrakcje", "esim"];
for (const dir of duplicateRouteDirs) {
  const route = path.join(root, "app", dir, "page.tsx");
  if (fs.existsSync(route)) fail(`Stary równoległy route nadal istnieje: app/${dir}/page.tsx`);
}
if (!process.exitCode) pass("Brak równoległych route'ów dublujących catch-all");

const offersSource = fs.readFileSync(path.join(root, "lib", "offers.ts"), "utf8");
const ids = [...offersSource.matchAll(/\bid:(\d+)/g)].map(m => Number(m[1]));
const duplicateIds = ids.filter((id, i) => ids.indexOf(id) !== i);
if (duplicateIds.length) fail(`Duplikaty ID ofert: ${[...new Set(duplicateIds)].join(", ")}`);
else pass(`Unikalne ID ofert: ${ids.length}`);

const eximBlocks = offersSource.match(/\{ id:\d+[^\n]+partner:"exim"[^\n]+\}/g) || [];
for (const block of eximBlocks) {
  if (/partners\.exim\.buildUrl\(\s*\)/.test(block)) fail(`EXIM bez destinationUrl: ${block.slice(0, 80)}…`);
  if (!/eximDestination\("\/kierunki\//.test(block)) fail(`EXIM nie prowadzi do strony kierunku: ${block.slice(0, 80)}…`);
}
if (eximBlocks.length && !process.exitCode) pass(`EXIM: ${eximBlocks.length} ofert ma destinationUrl zamiast homepage`);

const eskyBlocks = offersSource.match(/\{ id:\d+[^\n]+partner:"esky"[^\n]+\}/g) || [];
for (const block of eskyBlocks) {
  const airport = block.match(/airportCode:"([A-Z]{3})"/)?.[1];
  const linkAirport = block.match(/airportCode:"([A-Z]{3})" \}\)/)?.[1] || block.match(/airportCode:"([A-Z]{3})", departureDate/)?.[1];
  if (airport && linkAirport && airport !== linkAirport) fail(`eSky: lotnisko karty ${airport} != link ${linkAirport}`);
}
if (eskyBlocks.length && !process.exitCode) pass(`eSky: zgodność lotniska karty i linku dla ${eskyBlocks.length} ofert`);

const tsbuild = path.join(root, "tsconfig.tsbuildinfo");
if (fs.existsSync(tsbuild)) fail("tsconfig.tsbuildinfo powinien być usunięty z repo");
else pass("Brak artefaktu tsconfig.tsbuildinfo");

if (process.exitCode) process.exit(process.exitCode);
