"use client";
import { useEffect, useId } from "react";

export default function EskyLiveWidget({ mode="packages" }: { mode?: "packages"|"flights" }) {
  const reactId = useId().replace(/:/g, "");
  const id = `esky-widget-${reactId}`;
  useEffect(() => {
    const host = document.getElementById(id);
    if (!host) return;
    host.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://widgets.esky.com/qsf-widget/bundle.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.branding = "false";
    script.dataset.partnerCode = mode === "packages" ? "TRIPOWNIAPLPACKAGES" : "TRIPOWNIAPL";
    script.dataset.defaultContext = mode === "packages" ? "pl-packages" : "pl-flights";
    script.dataset.target = "_blank";
    script.onload = () => {
      const render = (window as any).renderQsf;
      if (typeof render === "function") render(script);
    };
    host.appendChild(script);
    return () => { host.innerHTML = ""; };
  }, [id, mode]);
  return <div id={id} className="city-esky-widget" />;
}
