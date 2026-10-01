const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
function load(file, deps = {}, globals = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(code, {exports, require:name => deps[name] || require(name), console, URL, Date, AbortSignal, ...globals});
  return exports;
}
const ranking = load('lib/searchOfferRanking.ts');
const base = {partner:'exim', city:'Pafos',country:'Cypr', hotel:'Hotel A',startDateISO:'2027-12-01',nights:7,departure:'Warszawa',board:'All Inclusive'};
let rows = ranking.rankSearchOffers([{...base,price:2500}, {...base,price:1500}, {...base,price:1700,board:'Śniadanie'}, {...base,price:600,hotel:'Other',searchTier:2}, {...base,price:NaN}]);
assert.equal(rows.length,3);
assert.equal(rows[0].price,1500);
assert.equal(rows[1].board,'Śniadanie');
assert.equal(rows[2].searchTier,2);
rows=ranking.rankSearchOffers(Array.from({length:90},(_,id)=>({...base,hotel:`Hotel ${id}`,price:1000+id})).reverse());
assert.equal(rows.length,90); assert.equal(rows[0].price,1000);
const grouping=load('lib/destinationGrouping.ts');
let mode='normal'; const calls=[];
const product=(id,price)=>({name:`Hotel ${id}`,fields:[{name:'Country',value:'Cypr'},{name:'Region',value:'Pafos'},{name:'DepartureCity',value:'Warszawa'},{name:'DepartureDate',value:'2027-12-01'},{name:'Duration',value:'7'},{name:'ServiceDescription',value:'All Inclusive'}],offers:[{productUrl:`https://www.tui.pl/oferta/${id}`,sourceProductId:String(id),priceHistory:[{price:{value:String(price)}}]}]});
const route=load('app/api/today-offers/route.ts',{'@/lib/searchOfferRanking':ranking,'@/lib/destinationGrouping':grouping,'next/server':{NextResponse:{json:(body,opts)=>({body,status:opts?.status||200})}}},{process:{env:{TRADEDOUBLER_TUI_TOKEN:'test-only'}},fetch:async(url)=>{
 calls.push(url); if(mode==='error') throw new Error('offline');
 const radom = product(4,999); radom.fields.find(field => field.name === 'DepartureCity').value='Warszawa - Radom';
 const page=Number(url.match(/;page=(\d+)/)[1]);
 return {ok:true,json:async()=>({products:page===0?[product(1,900),radom]:page===1?[product(2,1100)]:[product(3,1300)]})};
}});
(async()=>{
 let res=await route.GET({nextUrl:new URL('https://example.test/api/today-offers?mode=search&q=Cypr&from=WAW&maxPrice=1200&strict=1')});
 assert.equal(res.status,200); assert.equal(res.body.offers.length,2);assert.equal(res.body.offers[0].price,900);
 assert(calls.some(url=>url.includes(';page=0;')));assert(calls.some(url=>url.includes(';page=2;')));assert(calls.every(url=>url.includes(';orderBy=priceAsc;')));
 res=await route.GET({nextUrl:new URL('https://example.test/api/today-offers?mode=search&q=Cypr&board=roomonly&strict=1')});
 assert.equal(res.body.offers.length,0);
 mode='error';res=await route.GET({nextUrl:new URL('https://example.test/api/today-offers?mode=search&q=Cypr')});assert.equal(res.status,502);
 console.log('PASS: cheapest variant, board variants, no city cap, exact-first alternatives, price pagination, WAW, budget, strict filters, upstream failure.');
})().catch(e=>{console.error(e);process.exit(1)});
