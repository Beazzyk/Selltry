import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/api/dashboard.api';

const QUICK = [
  { to: '/listings/new', title: 'Wystaw ogłoszenie', desc: 'Nowy wpis na 4 platformy w 90 sekund',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 3v12M3 9h12"/></svg> },
  { to: '/listings?status=ENDED', title: 'Odnów wygasłe', desc: 'Sprawdź ogłoszenia wymagające odnowienia',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="9" cy="9" r="7"/><path d="M9 5v4l3 2"/></svg> },
  { to: '/platforms', title: 'Zarządzaj platformami', desc: 'Połącz i synchronizuj swoje konta',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="5" cy="9" r="3"/><circle cx="14" cy="5" r="2.5"/><circle cx="14" cy="13" r="2.5"/><path d="M8 8l4-2M8 10l4 2"/></svg> },
];

const PLATFORM_STATUS = [
  { cls: 'a', bg: 'var(--pf-allegro-bg)', color: 'var(--pf-allegro)', letter: 'A', name: 'Allegro',  sub: 'OAUTH · OK', count: 52 },
  { cls: 'o', bg: 'var(--pf-olx-bg)',     color: 'var(--pf-olx)',     letter: 'O', name: 'OLX',      sub: 'OAUTH · OK', count: 48 },
  { cls: 'm', bg: 'var(--pf-otomoto-bg)', color: 'var(--pf-otomoto)', letter: 'M', name: 'Otomoto',  sub: 'LOGIN · OK',  count: 28 },
  { cls: 'v', bg: 'var(--pf-ovoko-bg)',   color: 'var(--pf-ovoko)',   letter: 'V', name: 'Ovoko',    sub: 'API · OK',    count: 19 },
];

const FEED = [
  { type: 'ok', text: <><b>Rozrusznik Bosch BMW E46 318i</b> opublikowano na Allegro, OLX i Otomoto</>, meta: '320 zł · 3 z 4 platform', time: '8 min' },
  { type: 'warn', text: <><b>Bluza Nike Tech Fleece XL</b> wygasła na OLX</>, meta: 'Wymaga odnowienia', time: '42 min' },
  { type: 'ok', text: <>AI wygenerował opisy dla <b>5 nowych ogłoszeń</b></>, meta: 'Średni czas: 2.1s', time: '1 godz' },
  { type: 'err', text: <><b>Czujnik ABS Audi A4 B7</b> odrzucony na Otomoto</>, meta: 'Naprawiony automatycznie', time: '3 godz' },
];

const FEED_ICONS: Record<string, JSX.Element> = {
  ok:   <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 7l3 3 7-7"/></svg>,
  warn: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 1v8M7 11.5v1"/></svg>,
  err:  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3l8 8M11 3l-8 8"/></svg>,
};
const FEED_BG: Record<string,string> = { ok: 'var(--teal-3)', warn: '#FFF4DC', err: '#FBDDDD' };
const FEED_COLOR: Record<string,string> = { ok: 'var(--teal-2)', warn: 'var(--warn)', err: 'var(--danger)' };

const AI_CATS = [['Motoryzacja · części',68,80],['Narzędzia',34,42],['Elektronika',22,26],['Moda',12,14]];
const BAR_DATA = [[4,3,2,1],[5,4,2,1],[3,5,1,2],[6,4,3,2],[5,3,2,1],[7,5,3,2],[6,4,2,1],[8,6,4,3],[7,5,3,2],[9,7,4,3],[8,6,3,2],[10,7,5,3],[9,6,4,2],[11,8,5,4],[10,7,4,3],[12,9,6,4],[11,8,5,3],[13,9,7,4],[12,8,5,4],[14,10,6,5]];
const PF_COLORS = ['var(--pf-allegro)','var(--pf-olx)','var(--pf-otomoto)','var(--pf-ovoko)'];

function BarChart() {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const W = 600, H = 220, gap = 5;
    const colW = (W - gap * (BAR_DATA.length - 1)) / BAR_DATA.length;
    const max = Math.max(...BAR_DATA.map(d => d.reduce((a,b)=>a+b,0)));
    let html = '';
    BAR_DATA.forEach((d, i) => {
      let y = H - (d.reduce((a,b)=>a+b,0) / max) * H;
      d.forEach((v, j) => {
        const h = (v / max) * H;
        html += `<rect x="${i*(colW+gap)}" y="${y}" width="${colW}" height="${h}" fill="${PF_COLORS[j]}" rx="${j===0?3:0}"/>`;
        y += h;
      });
    });
    const g = ref.current.querySelector('#bars');
    if (g) g.innerHTML = html;
  }, []);

  return (
    <svg ref={ref} viewBox="0 0 600 220" preserveAspectRatio="none" style={{ width: '100%', height: 220, display: 'block' }}>
      <g stroke="var(--border)" strokeWidth="1">
        {[0,55,110,165,220].map(y => <line key={y} x1="0" y1={y} x2="600" y2={y}/>)}
      </g>
      <g id="bars" />
    </svg>
  );
}

const S = {
  panel: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14 } as React.CSSProperties,
  ph: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' } as React.CSSProperties,
  phTitle: { margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-sans)' } as React.CSSProperties,
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats });
  const firstName = user?.name?.split(' ')[0] ?? 'там';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: 'var(--font-sans)' }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}>Cześć, {firstName} 👋</h2>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14.5 }}>Twoje konto sprzedaje na {data?.listingsByPlatform?.length ?? 4} platformach. Tu masz cały obraz.</p>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        {[
          { label: 'Aktywne ogłoszenia', val: data?.activeListings ?? 147, delta: '↑ 12 w tym tygodniu', down: false },
          { label: 'Wystawione · 7 dni',   val: 38, delta: '↑ 24% vs. poprzedni tydzień', down: false },
          { label: 'Sprzedaż · 7 dni',     val: '12 480 zł', delta: '↑ 22% vs. poprzedni tydzień', down: false },
          { label: 'Do odnowienia',         val: 6, delta: '3 wygasają w tym tygodniu', down: true },
        ].map(({ label, val, delta, down }) => (
          <div key={label} className="kpi-card">
            <div className="kpi-label">{label}</div>
            <div className="kpi-val">{val}</div>
            <div className={`kpi-delta${down ? ' down' : ''}`}>{delta}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }} className="quick-actions-grid">
        {QUICK.map(({ to, title, desc, icon }) => (
          <Link key={to} to={to} style={{ display: 'flex', gap: 14, padding: '18px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, textDecoration: 'none', color: 'var(--ink)', transition: 'border-color .15s, transform .15s, box-shadow .15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--orange)'; (e.currentTarget as HTMLElement).style.transform='translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow='var(--shadow-2)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--border)'; (e.currentTarget as HTMLElement).style.transform=''; (e.currentTarget as HTMLElement).style.boxShadow=''; }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--orange-3)', color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
            <div>
              <h4 style={{ margin: '0 0 2px', fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{title}</h4>
              <p style={{ margin: 0, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.4 }}>{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Chart + Platform status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18 }} className="dash-grid">
        <section style={S.panel}>
          <div style={S.ph}>
            <h3 style={S.phTitle}>Publikacje per platforma</h3>
            <div style={{ display: 'inline-flex', padding: 2, background: 'var(--bg-2)', borderRadius: 6, fontSize: 12, gap: 2 }}>
              {['7d','30d','90d'].map((p, i) => (
                <button key={p} style={{ background: i===1?'var(--surface)':'transparent', border: 'none', padding: '4px 10px', borderRadius: 4, fontFamily: 'inherit', fontSize: 12, color: i===1?'var(--ink)':'var(--muted)', cursor: 'pointer', boxShadow: i===1?'var(--shadow-1)':'none' }}>{p}</button>
              ))}
            </div>
          </div>
          <div style={{ padding: 20 }}>
            <BarChart />
            <div style={{ display: 'flex', gap: 18, marginTop: 14, flexWrap: 'wrap' }}>
              {[['Allegro','var(--pf-allegro)'],['OLX','var(--pf-olx)'],['Otomoto','var(--pf-otomoto)'],['Ovoko','var(--pf-ovoko)']].map(([name,bg]) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--ink-2)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: bg, display: 'inline-block' }} />{name}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={S.panel}>
          <div style={S.ph}>
            <h3 style={S.phTitle}>Status platform</h3>
            <Link to="/platforms" style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)', textDecoration: 'none' }}>Zarządzaj →</Link>
          </div>
          <div>
            {PLATFORM_STATUS.map(({ bg, color, letter, name, sub, count }) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 7, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 13, flexShrink: 0 }}>{letter}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>{sub}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)' }}>
                  {count} <span style={{ color: 'var(--muted)' }}>/ {data?.activeListings ?? 147}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Activity + AI usage */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18 }} className="dash-grid">
        <section style={S.panel}>
          <div style={S.ph}><h3 style={S.phTitle}>Ostatnia aktywność</h3></div>
          <div>
            {FEED.map(({ type, text, meta, time }, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 20px', borderBottom: i < FEED.length-1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', background: FEED_BG[type], color: FEED_COLOR[type], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{FEED_ICONS[type]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.4 }}>{text}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>{time} temu</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{meta}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={S.panel}>
          <div style={S.ph}><h3 style={S.phTitle}>AI Generator opisów</h3><span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Maj 2026</span></div>
          <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Zużycie</div>
                <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 4, color: 'var(--ink)' }}>142 <span style={{ color: 'var(--muted)', fontSize: 18 }}>/ 500</span></div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Średnia</div>
                <div style={{ fontSize: 14, marginTop: 6, fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>2.1s / opis</div>
              </div>
            </div>
            <div style={{ height: 8, background: 'var(--bg-2)', borderRadius: 4, overflow: 'hidden', margin: '14px 0 10px' }}>
              <div style={{ width: '28%', height: '100%', background: 'linear-gradient(90deg,var(--orange),var(--orange-2))', borderRadius: 4 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              <span>28% miesięcznego limitu</span><span>resetuje się 1 czerwca</span>
            </div>
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--ink)' }}>Najczęstsze kategorie</div>
              {AI_CATS.map(([label, count, w]) => (
                <div key={label as string} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4, color: 'var(--ink)' }}>
                    <span>{label as string}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>{count as number}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg-2)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${w as number}%`, height: '100%', background: 'var(--navy)', borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
