import { Link } from 'react-router-dom';

const PLANS = [
  {
    name: 'Free', price: '0', tagline: 'Dla okazjonalnych sprzedawców — sprawdź zanim zapłacisz.',
    features: ['Do 20 ogłoszeń miesięcznie','2 platformy (Allegro + OLX)','Podstawowy edytor opisów','Synchronizacja statusów co 24h'],
    cta: 'Zacznij za darmo', ctaClass: 'btn-secondary', ctaTo: '/register', featured: false,
  },
  {
    name: 'Pro', price: '129', tagline: 'Dla aktywnych sprzedawców i warsztatów części.',
    features: ['Nieograniczone ogłoszenia','Wszystkie 4 platformy','AI generator opisów (Claude)','Synchronizacja w czasie rzeczywistym','Marże per platforma','Hurtowy import CSV'],
    cta: 'Wybierz Pro', ctaClass: 'btn-cta', ctaTo: '/register', featured: true, badge: 'Najpopularniejszy',
  },
  {
    name: 'Business', price: '349', tagline: 'Dla zespołów i sklepów obsługujących 500+ ogłoszeń.',
    features: ['Wszystko z Pro','Multi-user (do 10 stanowisk)','Dostęp do API','Dedykowany opiekun','SLA · 99.9% uptime','Białe etykiety dla agencji'],
    cta: 'Porozmawiaj z nami', ctaClass: 'btn-secondary', ctaTo: '/register', featured: false,
  },
];

export function Pricing() {
  return (
    <section style={{ padding: '96px 0' }} id="cennik">
      <div className="landing-wrap">
        <div style={{ maxWidth: 720, marginBottom: 48 }}>
          <span className="t-eyebrow" style={{ display: 'block', marginBottom: 14 }}>Cennik</span>
          <h2 className="t-h2" style={{ marginBottom: 14 }}>Płacisz tylko za to, czego używasz</h2>
          <p style={{ color: 'var(--ink-2)', fontSize: 18, lineHeight: 1.5, margin: 0 }}>Bez ukrytych kosztów. Bez zobowiązań. Anulujesz kiedy chcesz.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, alignItems: 'stretch' }} className="pricing-grid">
          {PLANS.map(({ name, price, tagline, features, cta, ctaClass, ctaTo, featured, badge }) => (
            <div key={name} style={{
              background: featured ? 'var(--ink)' : 'var(--surface)',
              color: featured ? '#fff' : 'var(--ink)',
              border: `1px solid ${featured ? 'var(--ink)' : 'var(--border)'}`,
              borderRadius: 18, padding: '32px 28px',
              display: 'flex', flexDirection: 'column',
              position: 'relative',
            }}>
              {badge && <span style={{ position: 'absolute', top: 16, right: 16, fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '4px 8px', background: 'var(--orange)', color: '#fff', borderRadius: 4 }}>{badge}</span>}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, letterSpacing: '0.04em', textTransform: 'uppercase', color: featured ? 'var(--orange)' : 'var(--muted)' }}>{name}</div>
              <div style={{ fontSize: 48, fontWeight: 600, letterSpacing: '-0.025em', margin: '14px 0 4px' }}>
                <span style={{ fontSize: 22, fontWeight: 500, verticalAlign: 'top', color: featured ? 'rgba(255,255,255,.55)' : 'var(--muted)', marginRight: 4 }}>zł</span>
                {price}
                <span style={{ fontSize: 15, color: featured ? 'rgba(255,255,255,.55)' : 'var(--muted)', marginLeft: 4, fontWeight: 400 }}>/ mies.</span>
              </div>
              <div style={{ fontSize: 14, color: featured ? 'rgba(255,255,255,.7)' : 'var(--ink-2)', marginBottom: 24, minHeight: 40 }}>{tagline}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                {features.map(f => (
                  <li key={f} style={{ display: 'flex', gap: 8, fontSize: 14, lineHeight: 1.4, alignItems: 'flex-start' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                      <path d="M3 8.5l3 3 7-7" stroke={featured ? '#FF6A1A' : '#16794B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to={ctaTo} className={`btn ${ctaClass}`} style={{ justifyContent: 'center' }}>{cta}</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
