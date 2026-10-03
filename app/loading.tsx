export default function Loading() {
  return (
    <main className="system-state-page system-loading-page" aria-live="polite" aria-busy="true" data-nosnippet>
      <div className="system-loading-mark" aria-hidden="true">✈</div>
      <div>
        <div className="kicker">TRIPOWNIA</div>
        <strong className="system-loading-title">Sprawdzamy aktualne dane.</strong>
        <p>Ceny i dostępność odświeżają się automatycznie.</p>
      </div>
      <div className="system-loading-bar" aria-hidden="true"><span /></div>
    </main>
  );
}
