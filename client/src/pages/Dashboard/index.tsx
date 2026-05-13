import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/api/dashboard.api';

const PF_META: Record<string, { bg: string; color: string; letter: string; name: string }> = {
  ALLEGRO: { bg: 'var(--pf-allegro-bg)', color: 'var(--pf-allegro)', letter: 'A', name: 'Allegro'  },
  OLX:     { bg: 'var(--pf-olx-bg)',     color: 'var(--pf-olx)',     letter: 'O', name: 'OLX'      },
  OTOMOTO: { bg: 'var(--pf-otomoto-bg)', color: 'var(--pf-otomoto)', letter: 'M', name: 'Otomoto'  },
  OVOKO:   { bg: 'var(--pf-ovoko-bg)',   color: 'var(--pf-ovoko)',   letter: 'V', name: 'Ovoko'    },
};
const ALL_PLATFORMS = ['ALLEGRO', 'OLX', 'OTOMOTO', 'OVOKO'];

const S = {
  panel: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14 } as React.CSSProperties,
  ph:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' } as React.CSSProperties,
  phT:   { margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-sans)' } as React.CSSProperties,
  more:  { fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)', textDecoration: 'none' } as React.CSSProperties,
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats });
  const firstName = user?.name?.split(' ')[0] ?? '';
  const d = (v: number | undefined) => isLoading ? '—' : (v ?? 0);

  const recentListings = data?.recentListings ?? [];
  const connectedSet = new Set(data?.connectedPlatforms ?? []);
  const activeByPlatform = Object.fromEntries((data?.listingsByPlatform ?? []).map(p => [p.platform, p.active]));

  const errorListings = data?.errorListings ?? 0;
  const endedListings = data?.endedListings ?? 0;
  const needsAttention = errorListings + endedListings;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: 'var(--font-sans)' }}>

      {/* Header */}
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
          {firstName ? `Cześć, ${firstName} 👋` : 'Dashboard'}
        </h2>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14.5 }}>
          {data
            ? `${data.activeListings} aktywnych ogłoszeń · ${connectedSet.size} z 4 platform połączonych`
            : 'Ładowanie danych...'}
        </p>
      </div>

      {/* KPIs — 4 kafelki z prawdziwymi danymi */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Aktywne ogłoszenia</div>
          <div className="kpi-val">{d(data?.activeListings)}</div>
          <div className="kpi-delta">na wszystkich platformach</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Szkice</div>
          <div className="kpi-val">{d(data?.draftListings)}</div>
          <div className="kpi-delta">
            {(data?.draftListings ?? 0) > 0
              ? <Link to="/listings?status=DRAFT" style={{ color: 'var(--navy)', textDecoration: 'none' }}>Wyświetl szkice →</Link>
              : 'gotowe do publikacji'}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Błędy publikacji</div>
          <div className="kpi-val" style={{ color: errorListings > 0 ? 'var(--danger)' : 'var(--ink)' }}>
            {d(data?.errorListings)}
          </div>
          <div className="kpi-delta" style={{ color: errorListings > 0 ? 'var(--danger)' : undefined }}>
            {errorListings > 0
              ? <Link to="/listings?status=ERROR" style={{ color: 'var(--danger)', textDecoration: 'none' }}>Napraw błędy →</Link>
              : 'wszystko OK'}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Wygasłe</div>
          <div className="kpi-val" style={{ color: endedListings > 0 ? 'var(--warn)' : 'var(--ink)' }}>
            {d(data?.endedListings)}
          </div>
          <div className="kpi-delta" style={{ color: endedListings > 0 ? 'var(--warn)' : undefined }}>
            {endedListings > 0
              ? <Link to="/listings?status=ENDED" style={{ color: 'var(--warn)', textDecoration: 'none' }}>Odnów ogłoszenia →</Link>
              : 'żadnych wygasłych'}
          </div>
        </div>
      </div>

      {/* Uwaga — jeśli coś wymaga akcji */}
      {needsAttention > 0 && (
        <div style={{ background: '#FFF8F0', border: '1px solid #FFD5B0', borderRadius: 12, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--warn)" strokeWidth="1.8" strokeLinecap="round"><circle cx="9" cy="9" r="7"/><path d="M9 6v3.5M9 12.5v.5"/></svg>
          <span style={{ fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--font-sans)' }}>
            {errorListings > 0 && endedListings > 0
              ? `${errorListings} ogłoszeń z błędem i ${endedListings} wygasłych wymaga uwagi.`
              : errorListings > 0
              ? `${errorListings} ogłoszeń nie zostało opublikowanych z powodu błędu.`
              : `${endedListings} ogłoszeń wygasło — rozważ odnowienie.`}
          </span>
          <Link to="/listings" style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--navy)', fontWeight: 500, textDecoration: 'none', flexShrink: 0 }}>
            Przejdź do ogłoszeń →
          </Link>
        </div>
      )}

      {/* Platformy — stan połączeń + ile aktywnych */}
      <section style={S.panel}>
        <div style={S.ph}>
          <h3 style={S.phT}>Platformy sprzedaży</h3>
          <Link to="/platforms" style={S.more}>Zarządzaj →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }} className="pf-status-grid">
          {ALL_PLATFORMS.map((platform, i) => {
            const meta = PF_META[platform];
            const connected = connectedSet.has(platform as never);
            const active = activeByPlatform[platform] ?? 0;
            return (
              <div key={platform} style={{ padding: '20px 24px', borderRight: i < 3 ? '1px solid var(--border)' : 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: meta.bg, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 14 }}>
                    {meta.letter}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{meta.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: connected ? 'var(--success)' : 'var(--border-strong)', display: 'inline-block' }} />
                      <span style={{ fontSize: 11, color: connected ? 'var(--success)' : 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                        {connected ? 'POŁĄCZONA' : 'NIEPOŁĄCZONA'}
                      </span>
                    </div>
                  </div>
                </div>
                {connected ? (
                  <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
                    {active}
                    <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted)', marginLeft: 6, fontFamily: 'var(--font-mono)' }}>aktywnych</span>
                  </div>
                ) : (
                  <Link to="/platforms" style={{ fontSize: 13, color: 'var(--navy)', fontWeight: 500, textDecoration: 'none' }}>
                    Połącz →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Ostatnie ogłoszenia */}
      <section style={S.panel}>
        <div style={S.ph}>
          <h3 style={S.phT}>Ostatnie ogłoszenia</h3>
          {recentListings.length > 0 && <Link to="/listings" style={S.more}>Wszystkie →</Link>}
        </div>
        {recentListings.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--orange-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="var(--orange)" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="16" height="16" rx="2"/><path d="M11 8v6M8 11h6"/></svg>
            </div>
            <p style={{ margin: '0 0 14px', fontSize: 14.5, color: 'var(--ink-2)' }}>Nie masz jeszcze żadnych ogłoszeń</p>
            <Link to="/listings/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 36, padding: '0 16px', background: 'var(--ink)', color: '#fff', borderRadius: 8, fontSize: 13.5, fontWeight: 500, textDecoration: 'none' }}>
              + Wystaw pierwsze ogłoszenie
            </Link>
          </div>
        ) : (
          recentListings.map((listing) => {
            const clsMap: Record<string, string> = { ALLEGRO: 'a', OLX: 'o', OTOMOTO: 'm', OVOKO: 'v' };
            return (
              <Link key={listing.id} to={`/listings/${listing.id}/edit`} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'var(--ink)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0, overflow: 'hidden', background: 'linear-gradient(135deg,#E8E2D4,#D9D0B9)' }}>
                  {listing.images?.[0]?.url && <img src={listing.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{listing.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                    {listing.condition === 'NEW' ? 'Nowy' : listing.condition === 'USED' ? 'Używany' : 'Uszkodzony'}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, flexShrink: 0 }}>
                  {Number(listing.basePrice).toFixed(2)} zł
                </div>
                <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                  {listing.platformListings?.map((pl) => (
                    <span key={pl.platform} className={`pf-dot ${clsMap[pl.platform] ?? 'off'}`} style={{ width: 14, height: 14 }} />
                  ))}
                </div>
              </Link>
            );
          })
        )}
      </section>

    </div>
  );
}
