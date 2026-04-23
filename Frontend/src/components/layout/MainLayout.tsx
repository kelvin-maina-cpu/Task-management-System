import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../app/store';
import { logout } from '../../features/auth/authSlice';
import { useLogoutMutation } from '../../features/auth/authApi';
import { ThemeToggle } from '../ThemeToggle';

const navItems = [
  {
    path: '/dashboard',
    label: 'Learning Dashboard',
    shortLabel: 'Dashboard',
    accent: 'from-amber-300 to-orange-500',
  },
  {
    path: '/projects/suggestions',
    label: 'Project Studio',
    shortLabel: 'Projects',
    accent: 'from-orange-400 to-rose-500',
  },
  {
    path: '/workspace/beginner',
    label: 'Beginner Workspace',
    shortLabel: 'Beginner',
    accent: 'from-emerald-400 to-green-500',
  },
  {
    path: '/workspace/senior',
    label: 'Advanced Workspace',
    shortLabel: 'Advanced',
    accent: 'from-purple-400 to-indigo-500',
  },
];

export const MainLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } finally {
      dispatch(logout());
    }
  };

  return (
    <div className="theme-page flex min-h-screen overflow-hidden">
      <aside className="theme-sidebar sticky top-0 flex h-screen w-72 shrink-0 flex-col border-r px-5 py-6 backdrop-blur-xl">
        <Link to="/" className="theme-sidebar-link block rounded-[28px] border p-4 transition">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-orange-500 to-rose-500 text-sm font-black text-slate-950">
              DH
            </span>
            <div>
              <h1 className="text-lg font-semibold">Developer Hub</h1>
              <p className="theme-soft text-xs uppercase tracking-[0.22em]">Guide + Lab</p>
            </div>
          </div>
        </Link>

        <div className="theme-sidebar-link mt-6 rounded-[28px] border p-4">
          <p className="theme-soft text-xs uppercase tracking-[0.2em]">Signed in as</p>
          <p className="mt-3 text-lg font-semibold">{user?.name || 'Developer'}</p>
          <p className="theme-soft mt-1 text-sm">{user?.email}</p>
        </div>

        <div className="mt-6">
          <ThemeToggle className="w-full justify-center" />
        </div>

        <nav className="mt-6 space-y-3">
          {navItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group block rounded-[24px] border px-4 py-4 transition ${
                  active
                    ? 'theme-sidebar-link-active shadow-lg shadow-slate-950/10'
                    : 'theme-sidebar-link'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent} text-sm font-black text-slate-950`}>
                    {item.shortLabel.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="theme-soft text-xs">
                      {item.path === '/dashboard' 
                        ? 'Track growth and progress' 
                        : item.path === '/projects/suggestions' 
                        ? 'Explore stacks and project ideas'
                        : item.path === '/workspace/beginner'
                        ? 'Master HTML, CSS, and JavaScript fundamentals'
                        : item.path === '/workspace/senior'
                        ? 'Advanced patterns and full-stack development'
                        : ''}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="theme-surface mt-6 rounded-[28px] border p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-200">Current mission</p>
          <h2 className="mt-3 text-lg font-semibold">Learn fundamentals, then ship with modern frameworks.</h2>
          <p className="theme-muted mt-2 text-sm leading-6">
            Use the dashboard for direction and the project studio to turn ideas into web and app builds.
          </p>
        </div>

        <div className="mt-auto space-y-3">
          <Link
            to="/"
            className="theme-sidebar-link block rounded-2xl border px-4 py-3 text-sm font-medium transition"
          >
            Back to homepage
          </Link>
          <button
            onClick={handleLogout}
            className="theme-sidebar-link theme-soft w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-300"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
