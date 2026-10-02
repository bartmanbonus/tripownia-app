export default function Loading() {
  return (
    <main className="system-state-page system-loading-page" aria-live="polite" aria-busy="true">
      <div className="system-loading-mark" aria-hidden="true">✈</div>
      <div>
        <div className="kicker">TRIPOWNIA</div>
        <h1>Ładujemy kolejną część podróży.</h1>
        <p>Za moment pokażemy aktualny widok.</p>
      </div>
      <div className="system-loading-bar" aria-hidden="true"><span /></div>
    </main>
  );
}
