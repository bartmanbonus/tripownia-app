const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
function loadPolicy(file) { return file === 'lib/offerValuePolicy.ts' ? {} : load('lib/offerValuePolicy.ts'); }
function load(file, deps = {}, globals = {}) {
  const exports = {};
  deps = {'@/lib/eskyPackages': {fetchEskyPackages: async()=>({offers:[], partial:false})}, '@/lib/offerValuePolicy': loadPolicy(file), ...deps};
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
 const destinations=['Malta','Pafos','Rzym','Barcelona','Lizbona','Ateny','Praga','Porto','Madera'];
 const cityRoute=load('app/api/today-offers/route.ts',{'@/lib/searchOfferRanking':ranking,'@/lib/destinationGrouping':grouping,'next/server':{NextResponse:{json:(body,opts)=>({body,status:opts?.status||200})}}},{process:{env:{TRADEDOUBLER_EXIM_TOKEN:'test-only'}},fetch:async()=>({ok:true,json:async()=>({products:destinations.flatMap((city,i)=>Array.from({length:35},(_,j)=>({name:`Hotel ${city} ${j}`,fields:[{name:'BestPrice',value:String(i === 8 ? 8000 : 1400+i*100+j*20)},{name:'DestinationName',value:city},{name:'DestinationAddress',value:`${city};Europa`},{name:'Departure',value:'Warszawa'}],offers:[{sourceProductId:`${city}-${j}`,productUrl:`https://example.test/url(${encodeURIComponent('https://www.exim.pl/?AC1=2&NN=3&DD=2027-12-01&RD=2027-12-04')})`}]})))})})});
 res=await cityRoute.GET({nextUrl:new URL('https://example.test/api/today-offers?mode=citybreak&view=destinations&from=WAWA&strict=1')});
 assert.equal(res.body.offers.length,8, 'all eight directions survive more than 240 variants');
 assert.equal(new Set(res.body.offers.map(o=>grouping.touristDestinationKey(o))).size,8);
 assert.equal(res.body.offers[0].price,700);
 assert(res.body.offers.every(o=>o.price<=2000), 'expensive city breaks are excluded even as the cheapest in a destination');
 const broad=await cityRoute.GET({nextUrl:new URL('https://example.test/api/today-offers?mode=citybreak&from=WAWA&maxPrice=8000')});
 assert(broad.body.offers.every(o=>o.price<=2000), 'broad search and a high user budget cannot bypass the city break cap');
 assert(res.body.offers.every((o,i,all)=>!i||o.price>=all[i-1].price));
 const tracked='https://clk.tradedoubler.com/click?p=fixture&a=fixture&url=https%3A%2F%2Fwww.tui.pl%2Foferta%2Fcity';
 const mixed=load('app/api/today-offers/route.ts',{'@/lib/searchOfferRanking':ranking,'@/lib/destinationGrouping':grouping,'next/server':{NextResponse:{json:(body,opts)=>({body,status:opts?.status||200})}}},{process:{env:{TRADEDOUBLER_EXIM_TOKEN:'test-only',TRADEDOUBLER_TUI_TOKEN:'test-only'}},fetch:async(url)=>{
   const p=product(77,1199);p.fields.find(f=>f.name==='DepartureDate').value='01.12.2027';p.fields.find(f=>f.name==='Duration').value='3';p.offers[0].productUrl=tracked;
   return {ok:true,json:async()=>({products:url.includes('fid=24864')?[p]:[]})};
 }});
 const mixedResult=await mixed.GET({nextUrl:new URL('https://example.test/api/today-offers?mode=citybreak&view=destinations&from=WAWA&strict=1')});
 assert.equal(mixedResult.body.offers.length,1,'TUI short breaks are included without an EXIM-only restriction');
 assert.equal(mixedResult.body.offers[0].partner,'tui');
 assert.equal(mixedResult.body.offers[0].affiliateUrl,tracked,'affiliate tracking URL survives selection unchanged');
 console.log('PASS: cheapest variant, board variants, no city cap, exact-first alternatives, price pagination, WAW, budget, strict filters, upstream failure.');
})().catch(e=>{console.error(e);process.exit(1)});

// Price gates, actual eSky payload shape and tracking preservation.
const policy = load('lib/offerValuePolicy.ts');
const checked = new Date().toISOString();
const promo = {...base,price:1499,nights:3,affiliateUrl:'https://example.test',priceCheckedAt:checked,availabilityStatus:'available',linkType:'exact'};
assert.equal(policy.isPromotableOffer(promo),true);
assert.equal(policy.isAffordableShortTrip({...promo,price:4000}),false);
assert.equal(policy.isPromotableOffer({...promo,price:4000,nights:7}),false);
assert.equal(policy.isPromotableOffer({...promo,price:4500,nights:7,country:'Tanzania',city:'Zanzibar'}),true);
assert.equal(policy.isPromotableOffer({...promo,linkType:'search'}),false);
assert.equal(policy.isPromotableOffer({...promo,priceCheckedAt:'2020-01-01'}),false);
assert.equal(ranking.rankSearchOffers(Array.from({length:501},(_,i)=>({...base,hotel:`Hotel ${i}`,price:500+i}))).length,501);
const partners = load('lib/partners.ts',{}, {process:{env:{}}});
const esky = load('lib/eskyPackages.ts', {'@/lib/partners':partners});
const fixture = { hotel:{metaCode:113569,name:'Ramla Bay Resort',regionName:'wyspa Malta',countryName:'Malta',rating:4.8}, departureAirportCode:'WMI',pricePerPax:{amount:929,currency:'PLN'},stayInformation:{checkInDate:'2027-11-28',checkOutDate:'2027-12-03',nights:5},mealPlan:'Śniadanie',variantsUrl:'https://www2.esky.pl/lot+hotel/portfolio/details/select-room?packageId=test-package&checkInDate=2027-11-28&checkOutDate=2027-12-03&departureCode=WMI&partner_id=WRONG'};
const eskyOffer = esky.normalizeEskyPackage(fixture);
assert(eskyOffer); assert.equal(eskyOffer.price,929);
assert.equal(new URL(eskyOffer.affiliateUrl).searchParams.get('partner_id'),'TRIPOWNIAPLPACKAGES');
assert.equal(new URL(eskyOffer.affiliateUrl).searchParams.get('packageId'),'test-package');
assert.equal(esky.normalizeEskyPackage({...fixture,departureAirportCode:'BER'}),null);
assert.equal(esky.normalizeEskyPackage({...fixture,pricePerPax:{amount:929,currency:'EUR'}}),null);
assert.equal(esky.normalizeEskyPackage({...fixture,variantsUrl:'https://evil.example/lot+hotel/portfolio/details/select-room?packageId=1'}),null);
(async()=>{
 const providerRoute=load('app/api/today-offers/route.ts',{'@/lib/searchOfferRanking':ranking,'@/lib/destinationGrouping':grouping,'@/lib/eskyPackages':{fetchEskyPackages:async()=>({offers:[eskyOffer,{...eskyOffer,id:eskyOffer.id+1,sourceKey:'expensive',city:'Madryt',price:4000}],partial:true})},'next/server':{NextResponse:{json:(body,opts)=>({body,status:opts?.status||200})}}},{process:{env:{}}});
 const result=await providerRoute.GET({nextUrl:new URL('https://example.test/api/today-offers?mode=search&from=WAWA&strict=1')});
 assert.equal(result.body.offers.length,1); assert.equal(result.body.offers[0].partner,'esky');assert.equal(result.body.partial,true);
 assert.equal(result.body.offers[0].affiliateUrl,eskyOffer.affiliateUrl);
 const wrongAirport=await providerRoute.GET({nextUrl:new URL('https://example.test/api/today-offers?mode=search&from=KRK&strict=1')});
 assert.equal(wrongAirport.body.offers.length,0);
 const daily=await providerRoute.GET({nextUrl:new URL('https://example.test/api/today-offers')});
 assert.equal(daily.body.offers.length,1);assert.equal(daily.body.offers[0].price,929);
 console.log('PASS: promotion ceilings, stale/search-link rejection, 501 results, eSky normalization, affiliate preservation, source mix and airport filters.');
})().catch(e=>{console.error(e);process.exitCode=1});
