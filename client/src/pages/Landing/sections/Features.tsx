const FEATURES = [
  { icon: <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="14" cy="14" r="3"/><path d="M14 2v3M14 23v3M2 14h3M23 14h3M5.5 5.5l2 2M20.5 20.5l2 2M22.5 5.5l-2 2M7.5 20.5l-2 2"/></svg>, title: 'AI generator opisów', desc: 'Claude generuje specyfikację techniczną, wymiary, kompatybilność i opis marketingowy — z marki, modelu i kategorii.' },
  { icon: <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6" cy="14" r="3"/><circle cx="22" cy="6" r="3"/><circle cx="22" cy="22" r="3"/><path d="M9 12.5l10-5M9 15.5l10 5"/></svg>, title: 'Multichannel publish', desc: 'Allegro, OLX, Otomoto, Ovoko — wybierasz checkboxy, system rozsyła i pilnuje aż wszystko jest aktywne.' },
  { icon: <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="10" height="10" rx="2"/><rect x="15" y="3" width="10" height="10" rx="2"/><rect x="3" y="15" width="10" height="10" rx="2"/><rect x="15" y="15" width="10" height="10" rx="2"/></svg>, title: '7 kategorii, setki marek', desc: 'Motoryzacja, elektronika, dom, moda, sport, narzędzia, inne. Podkategorie i marki dobrane pod polski rynek.' },
  { icon: <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 14h20M4 14l6-6M4 14l6 6M24 14l-6-6M24 14l-6 6"/></svg>, title: 'Marże per platforma', desc: 'Ustaw marżę procentową lub kwotową dla każdej platformy. Cena końcowa naliczana automatycznie.' },
  { icon: <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 6A9 9 0 0 0 5 9M6 14V9h5"/><path d="M6 22a9 9 0 0 0 17-3M22 14v5h-5"/></svg>, title: 'Synchronizacja statusów', desc: 'System sprawdza czy ogłoszenia są aktywne, wygasłe lub odrzucone i alarmuje, gdy coś wymaga uwagi.' },
  { icon: <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 14s4-8 12-8 12 8 12 8-4 8-12 8S2 14 2 14z"/><circle cx="14" cy="14" r="3.5"/></svg>, title: 'Podgląd przed publikacją', desc: 'Zobacz jak ogłoszenie wygląda po stronie kupującego — zdjęcia, tytuł, cena, opis — zanim trafi na żywo.' },
];

export function Features() {
  return (
    <section style={{ padding: '96px 0', borderTop: '1px solid var(--border)' }} id="funkcje">
      <div className="landing-wrap">
        <div style={{ maxWidth: 720, marginBottom: 48 }}>
          <span className="t-eyebrow" style={{ display: 'block', marginBottom: 14 }}>Funkcje</span>
          <h2 className="t-h2" style={{ marginBottom: 14 }}>Wszystko, co potrzebne do multichannel</h2>
          <p style={{ color: 'var(--ink-2)', fontSize: 18, lineHeight: 1.5, margin: 0 }}>Sześć modułów zaprojektowanych pod realia polskiego sprzedawcy — bez korporacyjnego balastu.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden' }} className="features-grid">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} style={{ background: 'var(--surface)', padding: '32px 28px' }}>
              <div style={{ width: 28, height: 28, color: 'var(--orange)', marginBottom: 18 }}>{icon}</div>
              <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 600, letterSpacing: '-0.005em' }}>{title}</h3>
              <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.55 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
