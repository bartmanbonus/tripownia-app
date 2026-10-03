import { ImageResponse } from "next/og";
import { getSocialOfferForLanding } from "@/lib/socialOffers";

export const alt = "Oferta Tripowni";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const offer = getSocialOfferForLanding(slug);

  if (!offer) {
    return new ImageResponse(
      (
        <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:"#fffaf5", fontFamily:"Arial, sans-serif", color:"#211d1a" }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:18 }}>
            <img src="https://tripownia.pl/tripownia-app-icon-v2.png" width="120" height="120" style={{ objectFit:"contain" }} />
            <div style={{ fontSize:64, fontWeight:800 }}>Tripownia.pl</div>
            <div style={{ fontSize:28, color:"#6f645e" }}>Znajdź wyjazd. Zaplanuj całą podróż.</div>
          </div>
        </div>
      ),
      size,
    );
  }

  const imageSrc = offer.imageSrc
    ? offer.imageSrc.startsWith("http")
      ? offer.imageSrc
      : `https://tripownia.pl${offer.imageSrc}`
    : null;

  return new ImageResponse(
    (
      <div style={{ width:"100%", height:"100%", display:"flex", background:"#111827", fontFamily:"Arial, sans-serif", position:"relative", overflow:"hidden" }}>
        {imageSrc ? (
          <img src={imageSrc} width="1200" height="630" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
        ) : (
          <div style={{ position:"absolute", inset:0, width:"100%", height:"100%", display:"flex", background:"linear-gradient(135deg,#172554 0%,#0f766e 100%)" }} />
        )}
        <div style={{ position:"absolute", inset:0, display:"flex", background:"linear-gradient(90deg,rgba(0,0,0,.82) 0%,rgba(0,0,0,.62) 48%,rgba(0,0,0,.18) 100%)" }} />
        <div style={{ position:"relative", display:"flex", flexDirection:"column", justifyContent:"space-between", width:"100%", height:"100%", padding:"58px 64px", color:"white" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, fontSize:24, fontWeight:700 }}>
            <img src="https://tripownia.pl/tripownia-app-icon-v2.png" width="48" height="48" style={{ objectFit:"contain", borderRadius:12 }} />
            <span>Tripownia.pl</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", maxWidth:790 }}>
            <div style={{ fontSize:28, fontWeight:700, marginBottom:12, opacity:.95 }}>{offer.country} · {offer.departure}</div>
            <div style={{ fontSize:72, lineHeight:1.02, fontWeight:900, letterSpacing:"-2px" }}>{offer.city}</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:16, marginTop:18 }}>
              <span style={{ fontSize:28, fontWeight:700 }}>od</span>
              <span style={{ fontSize:78, fontWeight:900 }}>{offer.price.toLocaleString("pl-PL")} zł</span>
              <span style={{ fontSize:26, fontWeight:700 }}>/ os.</span>
            </div>
            <div style={{ fontSize:26, fontWeight:700, marginTop:14 }}>{offer.dates} · {offer.nights} nocy</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:22 }}>
            <span>{offer.hotel}</span>
            <span style={{ fontWeight:800 }}>Sprawdź ofertę →</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
