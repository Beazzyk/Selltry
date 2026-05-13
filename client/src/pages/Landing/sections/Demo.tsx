import { Link } from 'react-router-dom';

const PLATFORMS = [
  { cls: 'pf-allegro', label: 'Allegro', price: '385,00 zł', checked: true },
  { cls: 'pf-olx',     label: 'OLX',     price: '370,00 zł', checked: true },
  { cls: 'pf-otomoto', label: 'Otomoto', price: '340,00 zł', checked: true },
  { cls: 'pf-ovoko',   label: 'Ovoko',   price: '—',         checked: false },
];

const MARGINS = [['Allegro','+20%','385,00 zł'],['OLX','+15%','370,00 zł'],['Otomoto','+6%','340,00 zł']];

export function Demo() {
  return (
    <section style={{ padding: '96px 0' }}>
      <div className="landing-wrap">
        <div style={{ background: 'var(--ink)', color: '#fff', borderRadius: 24, padding: '56px 48px 0', position: 'relative', overflow: 'hidden' }} className="demo-strip">
          <div style={{ maxWidth: 560, marginBottom: 36 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)' }}>Wizard ogłoszenia</span>
            <h2 className="t-h2" style={{ color: '#fff', margin: '12px 0 12px' }}>Cztery kroki, jeden formularz, cztery platformy</h2>
            <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 17, lineHeight: 1.5, margin: '0 0 20px' }}>Sprawdź jak działa wizard nowego ogłoszenia — od wyboru kategorii po publikację.</p>
            <Link to="/listings/new" className="btn btn-cta">Otwórz interaktywne demo →</Link>
          </div>

          {/* Mini wizard step 4 preview */}
          <div style={{ background: 'var(--surface)', borderRadius: '14px 14px 0 0', color: 'var(--ink)', border: '1px solid rgba(255,255,255,.1)', borderBottom: 'none', overflow: 'hidden' }}>
            <div style={{ padding: '24px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', flexWrap: 'wrap' }}>
                {['✓ KATEGORIA','✓ ATRYBUTY','✓ ZDJĘCIA'].map(s => <span key={s} style={{ color: 'var(--success)' }}>{s}</span>)}
                <span style={{ width: 24, height: 1, background: 'var(--border)' }} />
                <span style={{ color: 'var(--orange)', fontWeight: 600 }}>04 · CENA I PLATFORMY</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, alignItems: 'start' }} className="demo-inner-grid">
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Wybierz platformy do publikacji</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {PLATFORMS.map(({ cls, label, price, checked }) => (
                      <label key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--surface-2)', border: `2px solid ${checked ? 'var(--orange)' : 'var(--border)'}`, borderRadius: 10, cursor: 'pointer' }}>
                        <span style={{ width: 18, height: 18, borderRadius: 5, background: checked ? 'var(--orange)' : 'var(--surface)', border: checked ? 'none' : '1.5px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {checked && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>}
                        </span>
                        <span className={`pf-chip ${cls}`}><span className="pf-mark" />{label}</span>
                        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 12, color: checked ? 'var(--ink-2)' : 'var(--muted)' }}>{price}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 20px' }}>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>Cena bazowa</div>
                  <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', fontFamily: 'var(--font-mono)' }}>320,00 zł</div>
                  <div style={{ height: 1, background: 'var(--border)', margin: '16px -4px' }} />
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Marże per platforma</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5 }}>
                    {MARGINS.map(([pl, pct, final]) => (
                      <div key={pl} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{pl} <span style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{pct}</span></span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{final}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>3 platformy wybrane · Allegro, OLX, Otomoto</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 40, padding: '0 18px', background: 'var(--ink)', color: '#fff', borderRadius: 10, fontSize: 14, fontWeight: 500 }}>Opublikuj na 3 platformach →</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
