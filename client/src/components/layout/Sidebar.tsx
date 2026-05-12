import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { SelltryLogo } from '@/pages/Landing/SelltryLogo';

const MAIN_NAV = [
  { to: '/dashboard', label: 'Dashboard',
    icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg> },
  { to: '/listings', label: 'Ogłoszenia', count: true,
    icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><path d="M2 4h12M2 8h12M2 12h8"/></svg> },
  { to: '/listings/new', label: 'Nowe ogłoszenie',
    icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><path d="M8 2v12M2 8h12"/></svg> },
  { to: '/orders', label: 'Zamówienia',
    icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><path d="M2 5h12l-1 9H3z"/><path d="M5 5V3a3 3 0 0 1 6 0v2"/></svg> },
];

const ACCOUNT_NAV = [
  { to: '/platforms', label: 'Platformy',
    icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><circle cx="4" cy="8" r="2"/><circle cx="12" cy="4" r="2"/><circle cx="12" cy="12" r="2"/><path d="M6 7l4-2M6 9l4 2"/></svg> },
  { to: '/settings', label: 'Ustawienia',
    icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><circle cx="8" cy="8" r="2"/><path d="M8 1v2M8 13v2M15 8h-2M3 8H1M13 3l-1.4 1.4M4.4 11.6L3 13M13 13l-1.4-1.4M4.4 4.4L3 3"/></svg> },
];

interface Props { onNavigate?: () => void; }

export function Sidebar({ onNavigate }: Props) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  async function handleLogout() {
    await logout();
    setUser(null);
    navigate('/');
  }

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <aside className="sb">
      <div className="sb-logo">
        <SelltryLogo size={26} />
        <span className="lt">Selltry</span>
      </div>

      <nav className="sb-section">
        <span className="sb-sec-label">Główne</span>
        {MAIN_NAV.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} onClick={onNavigate} end={to === '/dashboard'}
            className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}>
            {icon}{label}
          </NavLink>
        ))}
      </nav>

      <nav className="sb-section">
        <span className="sb-sec-label">Konto</span>
        {ACCOUNT_NAV.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} onClick={onNavigate}
            className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}>
            {icon}{label}
          </NavLink>
        ))}
      </nav>

      <div className="sb-spacer" />

      <div className="sb-user">
        <div className="sb-avatar">{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sb-user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name ?? 'Użytkownik'}</div>
          <div className="sb-user-plan">{user?.plan ?? 'FREE'}</div>
        </div>
        <button onClick={handleLogout} title="Wyloguj" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--muted)', display: 'flex' }}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><path d="M6 3H3v10h3M10 5l3 3-3 3M13 8H7"/></svg>
        </button>
      </div>
    </aside>
  );
}
