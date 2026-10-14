import { ImageResponse } from "next/og";
import { getDestinationImageRule } from "@/lib/destinationImages";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const SIZE = { width: 1200, height: 630 };

function clean(value: string | null, max = 80) {
  return (value || "").replace(/[\r\n\t<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const city = clean(url.searchParams.get("city"), 56) || "Odkrywaj świat";
  const country = clean(url.searchParams.get("country"), 55);
  const departure = clean(url.searchParams.get("departure"), 55);
  const dates = clean(url.searchParams.get("dates"), 85);
  const board = clean(url.searchParams.get("board"), 48);
  const hotel = clean(url.searchParams.get("hotel"), 75);
  const rawPrice = clean(url.searchParams.get("price"), 10);
  const price = /^\d{1,5}(?:[\s\u00a0]\d{3})?$/.test(rawPrice) ? Number(rawPrice.replace(/\s/g, "")) : 0;
  const label = clean(url.searchParams.get("label"), 28) || "OKAZJE PODRÓŻNICZE";
  const imageRule = getDestinationImageRule(city, country);
  const imageUrl = imageRule.localPath ? `${url.origin}${imageRule.localPath}` : "";
  const primary = city.length > 22 ? 61 : city.length > 14 ? 73 : 93;
  const detail = [dates, departure ? `Wylot: ${departure}` : "", board || hotel].filter(Boolean).join("  ·  ");
  const info = detail.length > 97 ? `${detail.slice(0, 94)}…` : detail;
  const priceLine = price > 0 && price < 100000 ? `od ${price.toLocaleString("pl-PL")} zł/os.` : "Sprawdź możliwości";

  return new ImageResponse(
    (
      <div style={{ width:"100%", height:"100%", display:"flex", overflow:"hidden", position:"relative", color:"#ffffff", fontFamily:"Arial, sans-serif", background:"#052e3a" }}>
        {imageUrl ? (
          <img src={imageUrl} width="1200" height="630" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
        ) : (
          <div style={{ display:"flex", position:"absolute", inset:0, width:"100%", height:"100%", background:"linear-gradient(115deg,#082f49 0%,#075985 52%,#0f766e 100%)" }} />
        )}
        <div style={{ display:"flex", position:"absolute", inset:0, width:"100%", height:"100%", background:"linear-gradient(90deg,rgba(6,23,38,.94) 0%,rgba(6,23,38,.86) 40%,rgba(6,23,38,.30) 100%)" }} />
        <div style={{ display:"flex", flexDirection:"column", justifyContent:"space-between", width:"100%", height:"100%", padding:"47px 62px 42px", position:"relative" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", width:"100%" }}>
            <div style={{ display:"flex", alignItems:"baseline", fontSize:30, fontWeight:900, letterSpacing:".6px" }}>
              <span>TRIPOWNIA</span><span style={{ color:"#ff9237" }}>.PL</span>
            </div>
            <div style={{ display:"flex", borderRadius:32, background:"rgba(255,255,255,.18)", padding:"11px 19px", fontSize:19, fontWeight:800, letterSpacing:"1.3px" }}>{label.toUpperCase()}</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", maxWidth:1010 }}>
            <div style={{ display:"flex", color:"#ffbd78", fontSize:23, fontWeight:800, letterSpacing:"2px" }}>{country || "MY SZUKAMY. TY LECISZ."}</div>
            <div style={{ display:"flex", fontSize:primary, fontWeight:900, lineHeight:1.02, letterSpacing:"-2.5px", marginTop:14, maxWidth:1060 }}>{city}</div>
            <div style={{ display:"flex", fontSize:53, fontWeight:900, lineHeight:1.1, color:"#ffb15d", marginTop:15 }}>{priceLine}</div>
            {info && <div style={{ display:"flex", fontSize:25, fontWeight:600, lineHeight:1.25, marginTop:20, maxWidth:1000 }}>{info}</div>}
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%" }}>
            <div style={{ display:"flex", fontSize:20, opacity:.92 }}>Cena i dostępność wymagają potwierdzenia.</div>
            <div style={{ display:"flex", padding:"14px 23px", borderRadius:50, background:"#f58236", color:"#10283d", fontWeight:900, fontSize:21 }}>Sprawdź ofertę →</div>
          </div>
        </div>
      </div>
    ),
    { ...SIZE, headers: { "Cache-Control":"public, max-age=60, s-maxage=300, stale-while-revalidate=900" } },
  );
}
