import { SelltryLogo } from './SelltryLogo';

const COL_PRODUKT = [['#funkcje','Funkcje'],['#cennik','Cennik'],['#integracje','Integracje'],['#jak','Jak działa']];
const COL_FIRMA   = [['#','O nas'],['#','Kontakt'],['#','Blog'],['#','Praca']];
const COL_POMOC   = [['#','Centrum pomocy'],['#','Status systemu'],['#','Regulamin'],['#','Polityka prywatności']];

const linkStyle: React.CSSProperties = { color: 'var(--ink-2)', textDecoration: 'none', fontSize: 14.5 };

export function LandingFooter() {
  return (
    <footer style={{ padding: '64px 0 48px', borderTop: '1px solid var(--border)' }}>
      <div className="landing-wrap">
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(3,1fr)', gap: 48, marginBottom: 48 }} className="foot-grid">
          <div>
            <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: 'var(--ink)', textDecoration: 'none', marginBottom: 16 }}>
              <SelltryLogo />
              <span style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-0.02em' }}>Selltry</span>
            </a>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-2)', maxWidth: '32ch', lineHeight: 1.5 }}>
              Multichannel marketplace dla polskich sprzedawców. Allegro, OLX, Otomoto, Ovoko — z jednego panelu.
            </p>
          </div>
          {[['Produkt', COL_PRODUKT], ['Firma', COL_FIRMA], ['Pomoc', COL_POMOC]].map(([title, links]) => (
            <div key={title as string}>
              <h4 style={{ margin: '0 0 16px', fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 500 }}>{title as string}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(links as string[][]).map(([href, label]) => (
                  <li key={label}><a href={href} style={linkStyle}>{label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ paddingTop: 32, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>© 2026 SELLTRY SP. Z O.O.</div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { label: 'LinkedIn', path: 'M3 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM0 4h3v9H0zM5 4h2.8v1.2h.04c.4-.74 1.36-1.5 2.8-1.5C13.5 3.7 14 5.5 14 7.8V13h-3V8.5c0-1.1-.02-2.5-1.5-2.5-1.5 0-1.7 1.2-1.7 2.4V13H5z' },
              { label: 'Facebook', path: 'M8 14V7.5h2.2l.3-2.6H8V3.3c0-.75.2-1.27 1.3-1.27H10.6V.1A18.4 18.4 0 0 0 8.7 0C6.9 0 5.6 1.1 5.6 3.1v1.8H3.4v2.6h2.2V14z' },
            ].map(({ label, path }) => (
              <a key={label} href="#" aria-label={label} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)', textDecoration: 'none' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d={path}/></svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
