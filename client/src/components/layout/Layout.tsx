import { Outlet, useLocation } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/listings': 'Ogłoszenia',
  '/listings/new': 'Nowe ogłoszenie',
  '/platforms': 'Platformy',
  '/orders': 'Zamówienia',
  '/settings': 'Ustawienia',
};

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? 'Selltry';

  return (
    <div className="app-selltry">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 md:hidden" />
          <Dialog.Content className="fixed left-0 top-0 z-50 h-full md:hidden" style={{ outline: 'none' }}>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Main area */}
      <div className="app-main">
        <header className="app-topbar">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
            {/* Mobile menu button */}
            <button onClick={() => setMobileOpen(true)} className="md:hidden" style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: 12, padding: 4, color: 'var(--muted)' }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18"><path d="M2 4h12M2 8h12M2 12h12"/></svg>
            </button>
            <h1>{title}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/listings/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 34, padding: '0 14px', background: 'var(--orange)', color: '#fff', borderRadius: 8, fontSize: 13.5, fontWeight: 500, textDecoration: 'none', fontFamily: 'var(--font-sans)' }}>
              + Nowe ogłoszenie
            </Link>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
