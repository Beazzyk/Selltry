import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/api/dashboard.api';

const QUICK = [
  { to: '/listings/new', title: 'Wystaw ogłoszenie', desc: 'Nowy wpis — AI generuje opisy i tytuły',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 3v12M3 9h12"/></svg> },
  { to: '/listings', title: 'Zarządzaj ogłoszeniami', desc: 'Przeglądaj, edytuj i synchronizuj statusy',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 5h14M2 9h14M2 13h9"/></svg> },
  { to: '/platforms', title: 'Platformy sprzedaży', desc: 'Połącz Allegro, OLX, Otomoto i Ovoko',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="5" cy="9" r="3"/><circle cx="14" cy="5" r="2.5"/><circle cx="14" cy="13" r="2.5"/><path d="M8 8l4-2M8 10l4 2"/></svg> },
];

const PF_META: Record<string, { bg: string; color: string; letter: string }> = {
  ALLEGRO: { bg: 'var(--pf-allegro-bg)', color: 'var(--pf-allegro)', letter: 'A' },
  OLX:     { bg: 'var(--pf-olx-bg)',     color: 'var(--pf-olx)',     letter: 'O' },
  OTOMOTO: { bg: 'var(--pf-otomoto-bg)', color: 'var(--pf-otomoto)', letter: 'M' },
  OVOKO:   { bg: 'var(--pf-ovoko-bg)',   color: 'var(--pf-ovoko)',   letter: 'V' },
};

const BAR_DATA = [
  [2,1,1,0],[3,2,1,0],[2,2,1,1],[4,2,2,1],[3,2,1,1],
  [5,3,2,1],[4,3,1,1],[5,4,2,2],[4,3,2,1],[6,4,3,2],
  [5,4,2,1],[7,5,3,2],[6,4,3,1],[7,5,3,2],[6,4,2,2],
  [8,6,4,2],[7,5,3,2],[9,6,4,3],[8,5,3,2],[9,7,4,3],
];
const PF_COLORS = ['var(--pf-allegro)','var(--pf-olx)','var(--pf-otomoto)','var(--pf-ovoko)'];

function BarChart() {
  const ref = useRef<SVGGElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const W = 600, H = 180, gap = 5;
    const colW = (W - gap * (BAR_DATA.length - 1)) / BAR_DATA.length;
    const max = Math.max(...BAR_DATA.map(d => d.reduce((a, b) => a + b, 0)));
    let html = '';
    BAR_DATA.forEach((d, i) => {
      let y = H - (d.reduce((a, b) => a + b, 0) / max) * H;
      d.forEach((v, j) => {
        const h = (v / max) * H;
        html += `<rect x="${i * (colW + gap)}" y="${y.toFixed(1)}" width="${colW.toFixed(1)}" height="${h.toFixed(1)}" fill="${PF_COLORS[j]}" rx="${j === 0 ? 2 : 0}"/>`;
        y += h;
      });
    });
    ref.current.innerHTML = html;
  }, []);

  return (
    <svg viewBox="0 0 600 180" preserveAspectRatio="none" style={{ width: '100%', height: 180, display: 'block' }}>
      <g stroke="var(--border)" strokeWidth="1">
        {[0, 45, 90, 135, 180].map(y => <line key={y} x1="0" y1={y} x2="600" y2={y} />)}
      </g>
      <g ref={ref} />
    </svg>
  );
}

const S = {
  panel: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14 } as React.CSSProperties,
  ph: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' } as React.CSSProperties,
  phTitle: { margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-sans)' } as React.CSSProperties,
};

function EmptyListings() {
  return (
    <div style={{ padding: '48px 20px', textAlign: 'center' }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--orange-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="var(--orange)" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="16" height="16" rx="2"/><path d="M11 8v6M8 11h6"/></svg>
      </div>
      <p style={{ margin: '0 0 16px', fontSize: 14.5, color: 'var(--ink-2)', fontFamily: 'var(--font-sans)' }}>Nie masz jeszcze żadnych ogłoszeń</p>
      <Link to="/listings/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 36, padding: '0 16px', background: 'var(--ink)', color: '#fff', borderRadius: 8, fontSize: 13.5, fontWeight: 500, textDecoration: 'none', fontFamily: 'var(--font-sans)' }}>
        + Wystaw pierwsze ogłoszenie
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats });
  const firstName = user?.name?.split(' ')[0] ?? '';

  const kpis = [
    { label: 'Aktywne ogłoszenia', val: isLoading ? '—' : (data?.activeListings ?? 0), delta: null },
    { label: 'Szkice',             val: isLoading ? '—' : (data?.draftListings ?? 0),  delta: null },
    { label: 'Łącznie ogłoszeń',   val: isLoading ? '—' : (data?.totalListings ?? 0),  delta: null },
    { label: 'Połączone platformy',val: isLoading ? '—' : (data?.listingsByPlatform?.length ?? 0), delta: null },
  ];

  const platformRows = data?.listingsByPlatform ?? [];
  const recentListings = data?.recentListings ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: 'var(--font-sans)' }}>
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
          {firstName ? `Cześć, ${firstName} 👋` : 'Dashboard'}
        </h2>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14.5 }}>
          {data ? `${data.activeListings} aktywnych ogłoszeń na ${data.listingsByPlatform.length} platformach.` : 'Ładowanie danych...'}
        </p>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        {kpis.map(({ label, val }) => (
          <div key={label} className="kpi-card">
            <div className="kpi-label">{label}</div>
            <div className="kpi-val">{val}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }} className="quick-actions-grid">
        {QUICK.map(({ to, title, desc, icon }) => (
          <Link key={to} to={to} style={{ display: 'flex', gap: 14, padding: '18px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, textDecoration: 'none', color: 'var(--ink)', transition: 'border-color .15s, transform .15s, box-shadow .15s' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--orange)'; el.style.transform = 'translateY(-1px)'; el.style.boxShadow = 'var(--shadow-2)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.transform = ''; el.style.boxShadow = ''; }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--orange-3)', color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
            <div>
              <h4 style={{ margin: '0 0 2px', fontSize: 14.5, fontWeight: 600 }}>{title}</h4>
              <p style={{ margin: 0, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.4 }}>{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Chart + Platforms */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18 }} className="dash-grid">
        <section style={S.panel}>
          <div style={S.ph}>
            <h3 style={S.phTitle}>Aktywność publikacji · 30 dni</h3>
          </div>
          <div style={{ padding: 20 }}>
            <BarChart />
            <div style={{ display: 'flex', gap: 18, marginTop: 12, flexWrap: 'wrap' }}>
              {[['Allegro','var(--pf-allegro)'],['OLX','var(--pf-olx)'],['Otomoto','var(--pf-otomoto)'],['Ovoko','var(--pf-ovoko)']].map(([name, bg]) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--ink-2)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: bg, display: 'inline-block' }} />{name}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={S.panel}>
          <div style={S.ph}>
            <h3 style={S.phTitle}>Platformy</h3>
            <Link to="/platforms" style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)', textDecoration: 'none' }}>Zarządzaj →</Link>
          </div>
          <div>
            {platformRows.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>
                <p style={{ margin: '0 0 12px' }}>Brak podłączonych platform</p>
                <Link to="/platforms" style={{ color: 'var(--navy)', fontWeight: 500, textDecoration: 'none', fontSize: 13 }}>Połącz platformy →</Link>
              </div>
            ) : (
              platformRows.map(({ platform, active }) => {
                const meta = PF_META[platform] ?? { bg: 'var(--bg-2)', color: 'var(--muted)', letter: '?' };
                return (
                  <div key={platform} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 7, background: meta.bg, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 13, flexShrink: 0 }}>{meta.letter}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{platform}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)' }}>
                      {active} <span style={{ color: 'var(--muted)' }}>aktywnych</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Recent listings */}
      <section style={S.panel}>
        <div style={S.ph}>
          <h3 style={S.phTitle}>Ostatnie ogłoszenia</h3>
          {recentListings.length > 0 && (
            <Link to="/listings" style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)', textDecoration: 'none' }}>Wszystkie →</Link>
          )}
        </div>
        {recentListings.length === 0 ? (
          <EmptyListings />
        ) : (
          <div>
            {recentListings.map((listing) => (
              <Link key={listing.id} to={`/listings/${listing.id}/edit`} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'var(--ink)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: listing.images?.[0]?.url ? undefined : 'linear-gradient(135deg,#E8E2D4,#D9D0B9)', flexShrink: 0, overflow: 'hidden' }}>
                  {listing.images?.[0]?.url && <img src={listing.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{listing.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{listing.condition === 'NEW' ? 'Nowy' : listing.condition === 'USED' ? 'Używany' : 'Uszkodzony'}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: 'var(--ink)', flexShrink: 0 }}>{Number(listing.basePrice).toFixed(2)} zł</div>
                <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                  {listing.platformListings?.map((pl) => {
                    const clsMap: Record<string, string> = { ALLEGRO: 'a', OLX: 'o', OTOMOTO: 'm', OVOKO: 'v' };
                    const cls = clsMap[pl.platform] ?? 'off';
                    return <span key={pl.platform} className={`pf-dot ${cls}`} style={{ width: 14, height: 14 }} />;
                  })}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
