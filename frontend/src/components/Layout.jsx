import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

const NAV = [
  { to: '/',       label: 'Home',   icon: '⌂' },
  { to: '/crops',  label: 'Crops',  icon: '🌱' },
  { to: '/market', label: 'Market', icon: '📊' },
  { to: '/record', label: 'Record', icon: '📝' },
];

export default function Layout() {
  const farmer   = useStore((s) => s.farmer);
  const logout   = useStore((s) => s.logout);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex flex-col">

      <nav className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <span className="text-primary font-semibold text-lg tracking-tight">AgriBridge</span>

        <div className="hidden md:flex items-center gap-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:block">
            {farmer?.name?.split(' ')[0]}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 pb-24 md:pb-6">
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-10">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2.5 text-xs font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-gray-400'
              }`
            }
          >
            <span className="text-lg leading-none mb-0.5">{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>

    </div>
  );
}
