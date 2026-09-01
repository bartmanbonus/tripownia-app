"use client";

import { useEffect, useState } from "react";
import { CloudUpload, RefreshCw } from "lucide-react";
import { exportOfferOverrides } from "@/lib/clientOfferOverrides";

export default function AdminPublishPanel() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [secret, setSecret] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/admin/publish-overrides")
      .then(r => r.json())
      .then(data => setConfigured(Boolean(data.configured)))
      .catch(() => setConfigured(false));
  }, []);

  async function publish() {
    setBusy(true);
    setStatus("");
    try {
      const response = await fetch("/api/admin/publish-overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminSecret: secret, overrides: exportOfferOverrides() }),
      });
      const data = await response.json();
      setStatus(data.message || data.error || (response.ok ? "Zmiany opublikowane." : "Publikacja nie powiodła się."));
    } catch {
      setStatus("Nie udało się połączyć z mechanizmem publikacji.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="admin-editor-head">
    <div>
      <h2>Publikacja zmian</h2>
      <p>{configured === null ? "Sprawdzam konfigurację…" : configured ? "GitHub/Vercel jest skonfigurowany do publikacji zmian." : "Publikacja z panelu nie jest jeszcze skonfigurowana. Wersje robocze nadal działają lokalnie."}</p>
      {status && <small>{status}</small>}
    </div>
    <div className="admin-audit-actions">
      <input type="password" value={secret} onChange={e => setSecret(e.target.value)} placeholder="Hasło publikacji" aria-label="Hasło publikacji" />
      <button type="button" className="admin-export" onClick={publish} disabled={!configured || !secret || busy}>
        {busy ? <RefreshCw size={16}/> : <CloudUpload size={16}/>} {busy ? "Publikuję…" : "Opublikuj"}
      </button>
    </div>
  </div>;
}
