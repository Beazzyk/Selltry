import { Link } from 'react-router-dom';

export function CtaFinal() {
  return (
    <section style={{ padding: '96px 0' }}>
      <div className="landing-wrap">
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: '64px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, position: 'relative', overflow: 'hidden', flexWrap: 'wrap' }}>
          {/* Background pattern */}
          <svg style={{ position: 'absolute', right: -40, top: -40, opacity: 0.06, pointerEvents: 'none' }} width="300" height="300" viewBox="0 0 300 300" fill="none">
            <circle cx="150" cy="150" r="60" stroke="#163D6E" strokeWidth="2"/>
            <circle cx="150" cy="150" r="100" stroke="#163D6E" strokeWidth="2"/>
            <circle cx="150" cy="150" r="140" stroke="#163D6E" strokeWidth="2"/>
            <circle cx="40" cy="150" r="10" fill="#FF6A1A"/>
            <circle cx="260" cy="150" r="10" fill="#0E7C66"/>
            <circle cx="150" cy="40" r="10" fill="#163D6E"/>
            <circle cx="150" cy="260" r="10" fill="#FF6A1A"/>
          </svg>
          <div style={{ position: 'relative' }}>
            <h2 className="t-h2" style={{ margin: '0 0 10px', maxWidth: '18ch' }}>Zacznij sprzedawać mądrzej</h2>
            <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: 17, maxWidth: '40ch' }}>Bez karty. Bez instalacji. Pierwsze ogłoszenie wystawisz w 90 sekund.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0, position: 'relative', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-cta">Wypróbuj za darmo →</Link>
            <Link to="/dashboard" className="btn btn-secondary">Otwórz demo</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
