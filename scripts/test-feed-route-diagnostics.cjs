const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const cache = new Map();
const product = { name:'Cebu Hotel', fields:[{name:'Country',value:'Filipiny'},{name:'Region',value:'Cebu'},{name:'DepartureCity',value:'Warszawa'},{name:'DepartureDate',value:'2027-01-10'},{name:'Duration',value:'7'},{name:'ServiceDescription',value:'Śniadanie'}], offers:[{sourceProductId:'fixture', productUrl:'https://www.tui.pl/oferta/fixture', modified:Date.now(),priceHistory:[{price:{value:'3500'}}]}] };
const mocks = {
 '@/lib/offerEngine':{cheapestPerDestination:rows=>rows},
 'next/server':{NextResponse:{json:(body,opts)=>({body,status:opts?.status||200})}},
 '@/lib/offers':{homepageFallbackOffers:[],isOfferExpired:()=>false},
 '@/lib/travelSafety':{isTravelDestinationAllowed:()=>true},
 '@/lib/eskyPackages':{fetchEskyPackages:async()=>({offers:[],partial:false})},
 '@/lib/productFeed':{readProductFeed:async()=>({products:[product,{name:'Missing variants'}],pages:1,failedPages:1,retries:0,truncated:false,partial:true,error:'feed_http_429'})},
};
function load(file) {
 if(cache.has(file))return cache.get(file);
 const exports={};cache.set(file,exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,
 {exports,require:name=>mocks[name]||(name.startsWith('@/')?load(name.slice(2)+'.ts'):require(name)),console,Date,URL,URLSearchParams,AbortSignal,setTimeout,process:{env:{TRADEDOUBLER_TUI_TOKEN:'test'}}});
 return exports;
}
(async()=>{
 const {GET}=load('app/api/today-offers/route.ts');
 const r=await GET({nextUrl:new URL('https://test/api/today-offers?mode=search&q=Filipiny&strict=1&provider=tui')});
 assert.equal(r.body.offers.length,1,'keep valid products even when every query was partial');
 assert.equal(r.body.partial,true);
 assert(r.body.sourceStatus.tui.failedPages>0);
 assert(r.body.diagnostics.products>0);
 assert(r.body.diagnostics.missingVariants>0);
 assert.equal(r.body.diagnostics.destinationMatched,1);
 const filtered=await GET({nextUrl:new URL('https://test/api/today-offers?mode=search&q=Filipiny&strict=1&provider=tui&maxPrice=1000')});
 assert.equal(filtered.body.offers.length,0);
 assert.equal(filtered.body.diagnostics.destinationMatched,1);
 assert.equal(filtered.body.diagnostics.budgetMatched,0,'identify exact filter eliminating results');
 console.log('PASS: route preserves partial inventory, deduplicates variants, and reports where filters remove offers.');
})().catch(e=>{console.error(e);process.exit(1)});
