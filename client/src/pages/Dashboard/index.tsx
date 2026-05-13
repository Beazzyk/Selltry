import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/api/dashboard.api';
import { Listing } from '@/types';

const S = {
  panel: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14 } as React.CSSProperties,
  ph:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' } as React.CSSProperties,
  phT:   { margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-sans)' } as React.CSSProperties,
  more:  { fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)', textDecoration: 'none' } as React.CSSProperties,
};

const clsMap: Record<string, string> = { ALLEGRO: 'a', OLX: 'o', OTOMOTO: 'm', OVOKO: 'v' };

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string; action: string }> = {
  ERROR:            { label: 'Błąd publikacji',    color: 'var(--danger)', bg: '#FBDDDD', action: 'Napraw →' },
  ENDED:            { label: 'Wygasłe',            color: 'var(--warn)',   bg: '#FFF4DC', action: 'Odnów →' },
  PARTIALLY_ACTIVE: { label: 'Częściowo aktywne',  color: 'var(--navy)',   bg: 'var(--pf-ovoko-bg)', action: 'Sprawdź →' },
};

function ListingRow({ listing }: { listing: Listing }) {
  const meta = STATUS_LABEL[listing.status] ?? STATUS_LABEL.ERROR;
  const errMsg = listing.platformListings?.find(p => p.status === 'ERROR')?.errorMessage;

  return (
    <Link to={`/listings/${listing.id}/edit`} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'var(--ink)' }}>
      <div style={{ width: 38, height: 38, borderRadius: 8, flexShrink: 0, overflow: 'hidden', background: 'linear-gradient(135deg,#E8E2D4,#D9D0B9)' }}>
        {listing.images?.[0]?.url && <img src={listing.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{listing.title}</div>
        {errMsg && <div style={{ fontSize: 11.5, color: 'var(--danger)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{errMsg}</div>}
      </div>
      <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
        {listing.platformListings?.map(pl => (
          <span key={pl.platform} className={`pf-dot ${clsMap[pl.platform] ?? 'off'}`} style={{ width: 14, height: 14, opacity: pl.status === 'ACTIVE' ? 1 : 0.3 }} />
        ))}
      </div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 500, padding: '3px 10px', borderRadius: 999, background: meta.bg, color: meta.color, flexShrink: 0, fontFamily: 'var(--font-sans)' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, display: 'inline-block' }} />
        {meta.label}
      </div>
      <span style={{ fontSize: 12, color: meta.color, fontWeight: 500, flexShrink: 0, fontFamily: 'var(--font-sans)' }}>{meta.action}</span>
    </Link>
  );
}

function RecentRow({ listing }: { listing: Listing }) {
  return (
    <Link to={`/listings/${listing.id}/edit`} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'var(--ink)' }}>
      <div style={{ width: 38, height: 38, borderRadius: 8, flexShrink: 0, overflow: 'hidden', background: 'linear-gradient(135deg,#E8E2D4,#D9D0B9)' }}>
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
        {listing.platformListings?.map(pl => (
          <span key={pl.platform} className={`pf-dot ${clsMap[pl.platform] ?? 'off'}`} style={{ width: 14, height: 14 }} />
        ))}
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats });
  const firstName = user?.name?.split(' ')[0] ?? '';
  const v = (n: number | undefined) => isLoading ? '—' : (n ?? 0);

  const attentionListings = data?.attentionListings ?? [];
  const recentListings    = data?.recentListings    ?? [];
  const errorCount  = data?.errorListings  ?? 0;
  const endedCount  = data?.endedListings  ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: 'var(--font-sans)' }}>

      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
          {firstName ? `Cześć, ${firstName} 👋` : 'Dashboard'}
        </h2>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14.5 }}>
          {data
            ? `${data.activeListings} aktywnych · ${data.totalListings} łącznie`
            : 'Ładowanie...'}
        </p>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Aktywne ogłoszenia</div>
          <div className="kpi-val">{v(data?.activeListings)}</div>
          <div className="kpi-delta">opublikowane na platformach</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Szkice</div>
          <div className="kpi-val">{v(data?.draftListings)}</div>
          <div className="kpi-delta">
            {(data?.draftListings ?? 0) > 0
              ? <Link to="/listings" style={{ color: 'var(--navy)', textDecoration: 'none' }}>Przejdź do ogłoszeń →</Link>
              : 'brak szkiców'}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Błędy publikacji</div>
          <div className="kpi-val" style={{ color: errorCount > 0 ? 'var(--danger)' : 'inherit' }}>{v(data?.errorListings)}</div>
          <div className="kpi-delta" style={{ color: errorCount > 0 ? 'var(--danger)' : undefined }}>
            {errorCount > 0 ? 'wymagają naprawy' : 'wszystko OK'}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Wygasłe</div>
          <div className="kpi-val" style={{ color: endedCount > 0 ? 'var(--warn)' : 'inherit' }}>{v(data?.endedListings)}</div>
          <div className="kpi-delta" style={{ color: endedCount > 0 ? 'var(--warn)' : undefined }}>
            {endedCount > 0 ? 'do odnowienia' : 'żadnych wygasłych'}
          </div>
        </div>
      </div>

      {/* Wymagają uwagi */}
      {attentionListings.length > 0 && (
        <section style={S.panel}>
          <div style={S.ph}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3 style={S.phT}>Wymagają uwagi</h3>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, padding: '2px 7px', background: '#FBDDDD', color: 'var(--danger)', borderRadius: 4 }}>
                {attentionListings.length}
              </span>
            </div>
            <Link to="/listings" style={S.more}>Pokaż wszystkie →</Link>
          </div>
          <div>
            {attentionListings.map(l => <ListingRow key={l.id} listing={l} />)}
          </div>
        </section>
      )}

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
          recentListings.map(l => <RecentRow key={l.id} listing={l} />)
        )}
      </section>

    </div>
  );
}
