import { Link, NavLink } from 'react-router-dom';
import { Home, LayoutDashboard, Package, PlugZap, Settings, ShoppingCart, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { SelltryLogo } from '@/pages/Landing/SelltryLogo';

const NAV_ITEMS = [
  { to: '/', label: 'Strona główna', icon: Home },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/listings', label: 'Ogłoszenia', icon: Package },
  { to: '/platforms', label: 'Platformy', icon: PlugZap },
  { to: '/orders', label: 'Zamówienia', icon: ShoppingCart },
  { to: '/settings', label: 'Ustawienia', icon: Settings },
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
    <aside className="flex h-full w-60 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center border-b border-gray-800 px-6">
        <Link to="/" className="text-lg font-bold text-white hover:text-amber-400">
          AutoLister
        </Link>
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
