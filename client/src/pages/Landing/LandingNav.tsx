import { Link } from 'react-router-dom';
import { SelltryLogo } from './SelltryLogo';

export function LandingNav() {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(246,243,234,.82)',
      backdropFilter: 'saturate(140%) blur(10px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div className="landing-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: 'var(--ink)', textDecoration: 'none' }}>
          <SelltryLogo />
          <span style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-0.02em' }}>Selltry</span>
        </a>

        <ul style={{ display: 'flex', gap: 28, listStyle: 'none', padding: 0, margin: 0 }} className="landing-nav-links">
          {[['#funkcje','Funkcje'],['#jak','Jak działa'],['#integracje','Integracje'],['#cennik','Cennik']].map(([href, label]) => (
            <li key={href}>
              <a href={href} style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: 14.5, fontWeight: 500 }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--orange-2)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/login" className="btn btn-ghost btn-sm">Zaloguj się</Link>
          <Link to="/register" className="btn btn-cta btn-sm">Wypróbuj za darmo</Link>
        </div>
      </div>
    </nav>
  );
}
