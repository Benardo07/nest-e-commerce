import { PropsWithChildren } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/hooks/useAuth';
import { Button } from '../ui/button';
import { httpClient } from '../../lib/http';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/products', label: 'Products' },
  { to: '/orders', label: 'Orders' },
  { to: '/chat', label: 'Chat' },
];

export const AppShell = ({ children }: PropsWithChildren) => {
  const { user, clearAuth } = useAuth();
  const navigate = useNavigate();

  const signOut = async () => {
    try {
      await httpClient.post('/auth/logout');
    } catch (error) {
      console.warn('Failed to notify API about logout', error);
    } finally {
      clearAuth();
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <NavLink to="/dashboard" className="text-lg font-semibold text-indigo-600">
            C2C Marketplace
          </NavLink>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? 'text-indigo-600' : 'hover:text-indigo-500'
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{user?.username}</span>
            <Button variant="ghost" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        {children ?? <Outlet />}
      </main>
    </div>
  );
};
