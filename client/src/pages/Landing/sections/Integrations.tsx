const PLATFORMS = [
  { cls: 'pf-allegro', letter: 'A', name: 'Allegro',  cat: 'OAuth · Smart!Ready' },
  { cls: 'pf-olx',     letter: 'O', name: 'OLX',      cat: 'OAuth · OLX Pro' },
  { cls: 'pf-otomoto', letter: 'M', name: 'Otomoto',  cat: 'Login biznesowy' },
  { cls: 'pf-ovoko',   letter: 'V', name: 'Ovoko',    cat: 'Części samochodowe' },
];

const BG: Record<string, string> = {
  'pf-allegro': 'var(--pf-allegro-bg)', 'pf-olx': 'var(--pf-olx-bg)',
  'pf-otomoto': 'var(--pf-otomoto-bg)', 'pf-ovoko': 'var(--pf-ovoko-bg)',
};
const COLOR: Record<string, string> = {
  'pf-allegro': 'var(--pf-allegro)', 'pf-olx': 'var(--pf-olx)',
  'pf-otomoto': 'var(--pf-otomoto)', 'pf-ovoko': 'var(--pf-ovoko)',
};

export function Integrations() {
  return (
    <section style={{ padding: '96px 0' }} id="integracje">
      <div className="landing-wrap">
        <div style={{ maxWidth: 720, marginBottom: 48 }}>
          <span className="t-eyebrow" style={{ display: 'block', marginBottom: 14 }}>Integracje</span>
          <h2 className="t-h2" style={{ marginBottom: 14 }}>Cztery marketplaces. Więcej w drodze.</h2>
          <p style={{ color: 'var(--ink-2)', fontSize: 18, lineHeight: 1.5, margin: 0 }}>Pełna integracja przez OAuth lub API biznesowe. Łączysz raz, działa do końca.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }} className="integ-grid">
          {PLATFORMS.map(({ cls, letter, name, cat }) => (
            <div key={name} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: BG[cls], color: COLOR[cls], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 13 }}>{letter}</div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>{name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{cat}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--success)', fontFamily: 'var(--font-mono)', marginTop: 'auto' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                integracja aktywna
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: 'var(--surface-2)', border: '1px dashed var(--border-strong)', borderRadius: 14 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, padding: '2px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)' }}>Wkrótce</span>
          <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>eBay · Amazon · Empik Marketplace</span>
          <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>Q3 2026</span>
        </div>
      </div>
    </section>
  );
}
