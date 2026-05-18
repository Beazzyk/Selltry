const S = { section: { padding: '96px 0', borderTop: '1px solid var(--border)' } };

const STEPS = [
  {
    num: 'KROK 01', title: 'Stwórz ogłoszenie raz',
    desc: 'Wybierz kategorię, wpisz markę i model, dodaj zdjęcia. To wszystko.',
    vis: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Bosch','0001125045'].map(p => (
            <div key={p} style={{ flex: 1, height: 32, borderRadius: 6, background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{p}</div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0,1,2].map(i => <div key={i} style={{ width: 42, height: 42, borderRadius: 6, background: 'linear-gradient(135deg,#E8E2D4,#D9D0B9)' }} />)}
          <div style={{ width: 42, height: 42, borderRadius: 6, background: 'var(--bg)', border: '1px dashed var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 18 }}>+</div>
        </div>
      </div>
    ),
  },
  {
    num: 'KROK 02', title: 'AI dopasowuje pod każdą platformę',
    desc: 'Claude generuje opis, specyfikację i tytuł zoptymalizowany pod limity każdego marketplace.',
    vis: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[['pf-allegro','Allegro','Rozrusznik Bosch BMW E46 318i 1.9 N42…'],['pf-olx','OLX','Rozrusznik BMW E46 - oryginalny Bosch'],['pf-otomoto','Otomoto','BMW E46 318i — rozrusznik (Bosch)']].map(([cls, name, title]) => (
          <div key={name} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11 }}>
            <span className={`pf-chip ${cls}`} style={{ flexShrink: 0 }}><span className="pf-mark" />{name}</span>
            <span style={{ flex: 1, fontFamily: 'var(--font-mono)', color: 'var(--ink-2)', fontSize: 11, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{title}</span>
          </div>
        ))}
        <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--orange-2)', fontFamily: 'var(--font-mono)' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="#FF6A1A" strokeWidth="1.5"/></svg>
          wygenerowano w 1.8s
        </div>
      </div>
    ),
  },
  {
    num: 'KROK 03', title: 'Publikuj i synchronizuj',
    desc: 'Wciskasz „Publikuj". System rozsyła do platform i automatycznie sprawdza statusy.',
    vis: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[['a','Allegro'],['o','OLX'],['m','Otomoto'],['v','Ovoko']].map(([cls, name]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '6px 8px', background: 'var(--surface)', borderRadius: 6 }}>
            <span className={`pf-dot ${cls}`} style={{ width: 14, height: 14 }} />
            <span style={{ flex: 1 }}>{name}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--success)' }}>✓ aktywne</span>
          </div>
        ))}
      </div>
    ),
  },
];

export function HowItWorks() {
  return (
    <section style={S.section} id="jak">
      <div className="landing-wrap">
        <div style={{ maxWidth: 720, marginBottom: 48 }}>
          <span className="t-eyebrow" style={{ display: 'block', marginBottom: 14 }}>Jak to działa</span>
          <h2 className="t-h2" style={{ marginBottom: 14 }}>Trzy kroki od pomysłu do publikacji</h2>
          <p style={{ color: 'var(--ink-2)', fontSize: 18, lineHeight: 1.5, margin: 0 }}>Cały proces — od wpisania marki po opublikowane ogłoszenia na czterech platformach — zajmuje średnio 90 sekund.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', border: '1px solid var(--border)', borderRadius: 18, background: 'var(--surface)', overflow: 'hidden' }} className="steps-grid">
          {STEPS.map(({ num, title, desc, vis }, i) => (
            <div key={num} style={{ padding: '36px 32px', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, padding: '3px 8px', background: 'var(--ink)', color: '#fff', borderRadius: 4, letterSpacing: '0.06em' }}>{num}</span>
              <h3 style={{ margin: '16px 0 8px', fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</h3>
              <p style={{ margin: '0 0 20px', color: 'var(--ink-2)', fontSize: 14.5, lineHeight: 1.55 }}>{desc}</p>
              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>{vis}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
