import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const legacy = JSON.parse(fs.readFileSync(path.join(root,"data/legacy-content.json"),"utf8"));
const aliasSource = fs.readFileSync(path.join(root,"lib/internalAliases.ts"),"utf8");
const aliasMatches = [...aliasSource.matchAll(/'([^']+)'/g)].map(m=>m[1]);
const routes = new Set(["/","/okazje","/poradniki","/parkingi","/atrakcje","/esim","/ubezpieczenia","/transfery","/wynajem-auta","/planowanie-podrozy","/admin",...legacy.map(x=>(x.path||"/").replace(/\/$/,"")||"/"),...aliasMatches]);
const broken = new Map();
for (const item of legacy) {
  const html = item.html || "";
  const hrefs = [...html.matchAll(/href=["']([^"']+)/gi)].map(m=>m[1]);
  for (const href of hrefs) {
    let pathname = null;
    try {
      if (href.startsWith("https://tripownia.pl")) pathname = new URL(href).pathname;
      else if (href.startsWith("/")) pathname = new URL(href,"https://tripownia.pl").pathname;
    } catch {}
    if (!pathname) continue;
    pathname = pathname.replace(/\/$/,"") || "/";
    if (!routes.has(pathname) && !pathname.startsWith("/wp-")) broken.set(pathname,(broken.get(pathname)||0)+1);
  }
}
if (broken.size) {
  console.error(`❌ ${broken.size} nierozwiązanych wewnętrznych adresów`);
  for (const [p,n] of broken) console.error(`${n}× ${p}`);
  process.exit(1);
}
console.log(`✅ Audyt OK: ${legacy.length} zmigrowanych stron + ${aliasMatches.length} naprawionych starych adresów. Brak znanych wewnętrznych linków prowadzących do 404.`);
