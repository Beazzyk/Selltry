import { Link } from 'react-router-dom';
import { SelltryLogo } from '../SelltryLogo';

const NAV_ICONS: Record<string, JSX.Element> = {
  Dashboard: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>,
  Ogłoszenia: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><path d="M2 4h12M2 8h12M2 12h8"/></svg>,
  Zamówienia: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><path d="M2 5h12l-1 9H3z"/><path d="M5 5V3a3 3 0 0 1 6 0v2"/></svg>,
  Platformy: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><circle cx="4" cy="8" r="2"/><circle cx="12" cy="4" r="2"/><circle cx="12" cy="12" r="2"/><path d="M6 7l4-2M6 9l4 2"/></svg>,
  Ustawienia: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><circle cx="8" cy="8" r="2"/><path d="M8 1v2M8 13v2M15 8h-2M3 8H1"/></svg>,
};

const COUNTS: Record<string, string> = { Ogłoszenia: '147', Zamówienia: '12' };

export function Hero() {
  return (
    <header style={{ padding: '64px 0 32px' }}>
      <div className="landing-wrap">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 12px 6px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 999, fontSize: 12.5, color: 'var(--ink-2)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, padding: '2px 6px', background: 'var(--orange)', color: '#fff', borderRadius: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Nowe</span>
          AI generuje opisy w kontekście marki i kategorii
        </div>

        <h1 className="t-display" style={{ margin: '22px 0 18px', maxWidth: '16ch' }}>
          Cztery platformy.{' '}
          <span style={{ color: 'var(--orange)' }}>Jedno</span> ogłoszenie.
        </h1>
        <p style={{ fontSize: 19, lineHeight: 1.5, color: 'var(--ink-2)', maxWidth: '56ch', margin: '0 0 28px' }}>
          Selltry wystawia Twoje ogłoszenia na Allegro, OLX, Otomoto i Ovoko z jednego panelu. Tworzysz raz, AI dopasowuje tytuł i opis pod każdą platformę, a Ty publikujesz jednym kliknięciem.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Link to="/register" className="btn btn-cta">Wypróbuj za darmo →</Link>
          <Link to="/dashboard" className="btn btn-secondary">Otwórz demo</Link>
        </div>

        <div style={{ display: 'flex', gap: 28, marginTop: 32, flexWrap: 'wrap' }}>
          {[['128 400','ogłoszeń','wystawionych przez Selltry w 2025'],['11h','/tydzień','średnio zaoszczędzone na sprzedawcę'],['2 140','sprzedawców','aktywnych na platformie']].map(([num, unit, label]) => (
            <div key={unit} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em' }}>
                {num}<span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--muted)', marginLeft: 4, fontWeight: 400 }}>{unit}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Dashboard mockup */}
        <div style={{ marginTop: 56, position: 'relative' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, boxShadow: 'var(--shadow-3)', overflow: 'hidden', display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 540 }} className="hero-mock-frame">
            {/* Sidebar */}
            <aside style={{ background: 'var(--surface-2)', borderRight: '1px solid var(--border)', padding: '18px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px 18px', borderBottom: '1px solid var(--border)', marginBottom: 14 }}>
                <SelltryLogo size={22} />
                <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>Selltry</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Object.entries(NAV_ICONS).map(([label, icon]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 8, fontSize: 13, color: label === 'Dashboard' ? '#fff' : 'var(--ink-2)', background: label === 'Dashboard' ? 'var(--ink)' : 'transparent', cursor: 'default' }}>
                    {icon} {label}
                    {COUNTS[label] && <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, opacity: 0.7 }}>{COUNTS[label]}</span>}
                  </div>
                ))}
              </div>
            </aside>
            {/* Main */}
            <div style={{ padding: '18px 22px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>Dashboard</h3>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em' }}>PN, 12 MAJ 2026</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                {[['Aktywne','147','↑ 12 w tym tygodniu',false],['Wystawione','38','↑ 8 dzisiaj',false],['Wygasłe','6','do odnowienia',true],['Sprzedaż','12 480 zł','↑ 22%',false]].map(([label, val, delta, down]) => (
                  <div key={label as string} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label as string}</div>
                    <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 4 }}>{val as string}</div>
                    <div style={{ fontSize: 11, color: down ? 'var(--danger)' : 'var(--success)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{delta as string}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13, fontWeight: 600 }}>
                    <span>Publikacje · 30 dni</span><span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>Allegro · OLX · Otomoto</span>
                  </div>
                  <div style={{ height: 70, display: 'flex', alignItems: 'flex-end', gap: 3 }}>
                    {[30,42,38,55,48,62,50,70,58,74,65,80,72,88,76,90,84,96,82,78].map((h, i) => (
                      <div key={i} style={{ flex: 1, background: i >= 15 ? 'var(--orange)' : 'var(--ink)', borderRadius: '2px 2px 0 0', height: `${h}%`, opacity: i >= 15 ? 1 : 0.14 }} />
                    ))}
                  </div>
                </div>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13, fontWeight: 600 }}>
                    <span>Ostatnie ogłoszenia</span><span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>147 →</span>
                  </div>
                  {[['Rozrusznik Bosch BMW E46','320 zł',['a','o','m','off']],['Wkrętarka Makita DDF485','589 zł',['a','o','off','off']],['Bluza Nike Tech Fleece XL','249 zł',['a','o','off','off']],['Czujnik ABS Audi A4 B7','85 zł',['a','off','m','v']]].map(([title, price, pfs]) => (
                    <div key={title as string} style={{ display: 'grid', gridTemplateColumns: '28px 1fr auto auto', gap: 10, padding: '8px 0', borderTop: '1px solid var(--border)', alignItems: 'center', fontSize: 12.5 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 5, background: 'linear-gradient(135deg,#E8E2D4,#D9D0B9)' }} />
                      <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title as string}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500 }}>{price as string}</span>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {(pfs as string[]).map((p, i) => <span key={i} className={`pf-dot ${p}`} style={{ width: 14, height: 14 }} />)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Floating publish toast */}
          <div style={{ position: 'absolute', right: -10, top: 60, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', boxShadow: 'var(--shadow-3)', width: 240, transform: 'rotate(2deg)' }} className="hero-float-pub">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', animation: 'l-pulse 2s infinite', display: 'inline-block' }} />
              Publikuję na 4 platformach
            </div>
            {[['a','Allegro','opublikowano'],['o','OLX','opublikowano'],['m','Otomoto','opublikowano'],['v','Ovoko','w toku…']].map(([cls, name, status]) => (
              <div key={name as string} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 12.5 }}>
                <span className={`pf-dot ${cls}`} style={{ width: 16, height: 16, borderRadius: 5, flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{name as string}</span>
                <span style={{ marginLeft: 'auto', color: status === 'w toku…' ? 'var(--muted)' : 'var(--success)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{status as string}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
